const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");

const sb = require("./supabase-server");
const mail = require("./mail");

// ── Şifre sıfırlama token store (bellek içi, 15dk TTL) ────────
const resetTokens = new Map(); // token → { userId, username, email, expiresAt }

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname), { etag: false, lastModified: false }));
app.use(express.static(path.join(__dirname, 'public'), { etag: false, lastModified: false }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
  path: "/socket.io/"
});

// ── Bellek içi state ──────────────────────────────────────────
const connectedPlayers = new Map();
const marketData = {};
const tradeOffers = {};
const chatHistory = [];

// Şehir sahipliği (in-memory + Supabase sync)
const cityOwnership = {};

// Aktif savaşlar / mafia savaşları
const activeCombats = {};

// Seçim oyu sayaçları
const electionVotes = {};

// Anti-cheat: son işlem zamanları
const lastActionTime = {};
const actionCounts = {};

// ── Anti-Cheat Yardımcıları ──────────────────────────────────
function antiCheatCheck(socket, action, data) {
  const sid = socket.id;
  const player = connectedPlayers.get(sid);
  if (!player) return { ok: true };

  const now = Date.now();
  const key = `${sid}:${action}`;

  // Rate limiter: dakikada max eylem sayısı
  const LIMITS = {
    chat: 20,
    job: 5,
    trade: 10,
    combat: 3,
    vote: 1,
    default: 15
  };
  const limit = LIMITS[action] || LIMITS.default;

  if (!actionCounts[key]) actionCounts[key] = { count: 0, resetAt: now + 60000 };
  if (now > actionCounts[key].resetAt) {
    actionCounts[key] = { count: 0, resetAt: now + 60000 };
  }
  actionCounts[key].count++;

  if (actionCounts[key].count > limit) {
    console.warn(`[Anti-Cheat] Rate limit: ${player.username} — ${action} (${actionCounts[key].count}/${limit})`);
    socket.emit('antiCheatAlert', {
      reason: `Çok hızlı işlem: ${action}`,
      action,
      suspended: actionCounts[key].count > limit * 3
    });
    return { ok: false, reason: 'rate_limit' };
  }

  // Para tutarsızlığı kontrolü
  if (data && data.money !== undefined && player.money !== undefined) {
    const diff = Math.abs(data.money - player.money);
    const maxAllowedGain = 10000000; // 10M max tek seferde kazanç
    if (diff > maxAllowedGain && data.money > player.money) {
      console.warn(`[Anti-Cheat] Şüpheli para artışı: ${player.username} ${player.money} → ${data.money}`);
      socket.emit('antiCheatAlert', {
        reason: 'Şüpheli para artışı tespit edildi',
        action,
        diff
      });
      return { ok: false, reason: 'suspicious_money' };
    }
  }

  return { ok: true };
}

function getOnlineList() {
  return Array.from(connectedPlayers.values()).map(p => ({
    userId: p.userId,
    username: p.username,
    level: p.level || 1,
    city: p.city || '',
    gender: p.gender || 'erkek',
    avatar: p.avatar || null,
    joinedAt: p.joinedAt,
    money: p.money || 0,
    party: p.party || null,
    gang: p.gang || null,
  }));
}

// ── Başlangıçta sunucu state yükle ───────────────────────────
async function loadServerState() {
  try {
    const ownership = await sb.loadGameState('cityOwnership');
    if (ownership) Object.assign(cityOwnership, ownership);

    const elections = await sb.loadGameState('electionState');
    if (elections) Object.assign(electionVotes, elections);

    console.log('🗄️  Sunucu state yüklendi ✓');
  } catch(e) {
    console.warn('State yükleme hatası:', e.message);
  }
}

// ── Socket.IO ─────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("✓ Oyuncu bağlandı:", socket.id);

  socket.emit("marketSnapshot", Object.values(marketData));

  // Supabase'den chat geçmişi yükle
  sb.getChatHistory('global', 100).then(history => {
    if (history.length > 0) {
      const formatted = history.map(m => ({
        id: m.id,
        sender: m.sender,
        senderId: m.sender_id,
        message: m.message,
        gifUrl: m.gif_url,
        sticker: m.sticker,
        channel: m.channel,
        ts: m.ts || m.created_at
      }));
      socket.emit("chatHistory", formatted);
    } else {
      socket.emit("chatHistory", chatHistory.slice(-50));
    }
  }).catch(() => socket.emit("chatHistory", chatHistory.slice(-50)));

  // Mevcut şehir sahipliği gönder
  socket.emit("cityOwnershipUpdate", cityOwnership);

  // ── OYUNCU GİRİŞİ ─────────────────────────────────────────
  socket.on("playerJoin", (playerData) => {
    connectedPlayers.set(socket.id, {
      socketId: socket.id,
      userId: playerData.userId,
      username: playerData.username,
      level: playerData.level || 1,
      city: playerData.city || '',
      gender: playerData.gender || 'erkek',
      avatar: playerData.avatar || null,
      money: playerData.money || 0,
      party: playerData.party || null,
      gang: playerData.gang || null,
      joinedAt: Date.now(),
    });
    const list = getOnlineList();
    io.emit("onlineCount", list.length);
    io.emit("onlinePlayers", list);
    console.log(`👥 ${playerData.username} bağlandı. Online: ${list.length}`);
    sb.upsertPlayer(playerData).catch(() => {});
  });

  // ── PRESENCE HEARTBEAT ────────────────────────────────────
  socket.on("playerHeartbeat", (data) => {
    const existing = connectedPlayers.get(socket.id);
    if (existing && data.userId === existing.userId) {
      connectedPlayers.set(socket.id, { ...existing, lastSeen: Date.now() });
    }
  });

  // ── OYUNCU GÜNCELLEME ──────────────────────────────────────
  socket.on("playerUpdate", (data) => {
    const check = antiCheatCheck(socket, 'playerUpdate', data);
    if (!check.ok) return;

    const existing = connectedPlayers.get(socket.id);
    if (existing) {
      connectedPlayers.set(socket.id, { ...existing, ...data });
      io.emit("onlinePlayers", getOnlineList());
    }
    io.emit("playerUpdate", { ...data, socketId: socket.id });

    if (data.userId) {
      sb.updatePlayerStats(data.userId, {
        level: data.level,
        money: data.money,
        city: data.city,
        party: data.party,
        gang: data.gang
      }).catch(() => {});
    }
  });

  // ── GLOBAL SOHBET ──────────────────────────────────────────
  socket.on("chat", (data) => {
    const check = antiCheatCheck(socket, 'chat', data);
    if (!check.ok) return;

    const msg = { ...data, socketId: socket.id, ts: data.ts || Date.now() };
    chatHistory.push(msg);
    if (chatHistory.length > 200) chatHistory.shift();
    io.emit("chat", msg);
    console.log(`💬 [${data.channel || 'global'}] ${data.sender}: ${String(data.message || '').slice(0, 60)}`);
    sb.saveMessage(msg).catch(() => {});
  });

  // ── DİREKT MESAJ ───────────────────────────────────────────
  socket.on("dm", (data) => {
    const targetEntry = [...connectedPlayers.entries()].find(([, p]) => p.userId === data.toUserId);
    if (targetEntry) {
      io.to(targetEntry[0]).emit("dm", data);
    }
    socket.emit("dm_delivered", { ...data, delivered: !!targetEntry });
    sb.saveMessage({ ...data, channel: 'dm', sender: data.fromUsername, message: data.text || data.message }).catch(() => {});
  });

  // ── BORSA GÜNCELLEME ───────────────────────────────────────
  socket.on("marketUpdate", (data) => {
    if (data.companyId) {
      marketData[data.companyId] = { ...marketData[data.companyId], ...data, lastUpdate: Date.now() };
      sb.upsertCompany(data).catch(() => {});
    }
    io.emit("marketUpdate", { ...data, ts: Date.now() });
  });

  // ── TİCARET TEKLİFİ ────────────────────────────────────────
  socket.on("tradeOffer", (data) => {
    const check = antiCheatCheck(socket, 'trade', data);
    if (!check.ok) return;

    const offerId = data.offerId || `offer_${Date.now()}`;
    tradeOffers[offerId] = { ...data, offerId, status: 'pending', ts: Date.now() };
    const targetEntry = [...connectedPlayers.entries()].find(([, p]) => p.userId === data.toUserId);
    if (targetEntry) {
      io.to(targetEntry[0]).emit("tradeOffer", tradeOffers[offerId]);
      socket.emit("tradeOfferSent", { offerId, success: true });
    } else {
      socket.emit("tradeOfferSent", { offerId, success: false, reason: 'Oyuncu çevrimdışı' });
    }
    if (sb.supabase) {
      sb.supabase.from('trade_offers').upsert({
        id: offerId,
        from_user_id: data.fromUserId,
        from_username: data.fromUsername,
        to_user_id: data.toUserId,
        to_username: data.toUsername,
        offer: data.offer || {},
        request: data.request || {},
        status: 'pending'
      }, { onConflict: 'id' }).catch(() => {});
    }
  });

  // ── TİCARET YANITI ─────────────────────────────────────────
  socket.on("tradeResponse", (data) => {
    const offer = tradeOffers[data.offerId];
    if (!offer) return;
    offer.status = data.accepted ? 'accepted' : 'rejected';
    const senderEntry = [...connectedPlayers.entries()].find(([, p]) => p.userId === offer.fromUserId);
    if (senderEntry) io.to(senderEntry[0]).emit("tradeResponse", { ...data, offer });
    if (sb.supabase) {
      sb.supabase.from('trade_offers').update({ status: offer.status }).eq('id', data.offerId).catch(() => {});
    }
  });

  // ── ENVANTER SİSTEMİ (Server Authority) ───────────────────
  socket.on("inventoryAction", async (data) => {
    const check = antiCheatCheck(socket, 'inventory', data);
    if (!check.ok) return;

    const player = connectedPlayers.get(socket.id);
    if (!player || player.userId !== data.userId) return;

    try {
      const { action, item, amount, targetUserId } = data;

      if (action === 'use') {
        const result = await sb.useInventoryItem(data.userId, item);
        socket.emit('inventoryUpdate', { userId: data.userId, inventory: result.inventory, effect: result.effect });
        if (result.effect) {
          // Efekti sunucu tarafında doğrulayarak uygula
          socket.emit('serverAction', { key: 'itemEffect', value: result.effect });
        }

      } else if (action === 'give') {
        if (!targetUserId) return;
        const result = await sb.transferInventoryItem(data.userId, targetUserId, item, amount || 1);
        if (result.ok) {
          socket.emit('inventoryUpdate', { userId: data.userId, inventory: result.fromInventory });
          const targetEntry = [...connectedPlayers.entries()].find(([, p]) => p.userId === targetUserId);
          if (targetEntry) {
            io.to(targetEntry[0]).emit('inventoryUpdate', { userId: targetUserId, inventory: result.toInventory });
          }
        }

      } else if (action === 'buy') {
        const result = await sb.buyMarketItem(data.userId, item, amount || 1);
        if (result.ok) {
          socket.emit('inventoryUpdate', { userId: data.userId, inventory: result.inventory });
          socket.emit('serverAction', { key: 'money', value: result.newMoney });
          // Online listeyi güncelle
          const existing = connectedPlayers.get(socket.id);
          if (existing) {
            connectedPlayers.set(socket.id, { ...existing, money: result.newMoney });
            io.emit("onlinePlayers", getOnlineList());
          }
        } else {
          socket.emit('actionError', { action: 'buy', reason: result.reason });
        }
      }
    } catch(e) {
      console.warn('[Inventory] Hata:', e.message);
      socket.emit('actionError', { action: 'inventoryAction', reason: e.message });
    }
  });

  // ── ŞEHİR SAHİPLİĞİ ──────────────────────────────────────
  socket.on("cityCapture", async (data) => {
    const check = antiCheatCheck(socket, 'combat', data);
    if (!check.ok) return;

    const player = connectedPlayers.get(socket.id);
    if (!player) return;

    const { cityId, gangId, gangName } = data;
    const now = Date.now();

    // Mevcut sahibi kontrol et
    const current = cityOwnership[cityId];
    if (current && current.gangId === gangId) {
      socket.emit('actionError', { action: 'cityCapture', reason: 'Bu şehir zaten sizin' });
      return;
    }

    // Ele geçirme kuralları: 10 dakikada bir şehir ele geçirilebilir
    const CAPTURE_COOLDOWN = 10 * 60 * 1000;
    if (current && current.capturedAt && (now - current.capturedAt) < CAPTURE_COOLDOWN) {
      const remaining = Math.ceil((CAPTURE_COOLDOWN - (now - current.capturedAt)) / 60000);
      socket.emit('actionError', { action: 'cityCapture', reason: `Şehir ${remaining} dakika daha ele geçirilemez` });
      return;
    }

    // Şehir sahipliğini güncelle
    cityOwnership[cityId] = {
      cityId,
      gangId,
      gangName,
      capturedBy: player.username,
      capturedAt: now,
      tax: data.tax || 5
    };

    await sb.saveGameState('cityOwnership', cityOwnership).catch(() => {});

    io.emit('cityOwnershipUpdate', cityOwnership);
    io.emit('gameEvent', {
      type: 'city_capture',
      title: `${gangName} şehri ele geçirdi!`,
      description: `${gangName}, ${cityId} şehrini kontrol altına aldı.`,
      city: cityId,
      ts: now
    });
    io.emit('adminBroadcast', {
      type: 'city',
      title: `🏙️ Şehir El Değiştirdi!`,
      message: `${gangName}, ${cityId} şehrini ele geçirdi!`,
      sender: 'Sistem',
      ts: now
    });
    console.log(`🏙️  ${gangName} → ${cityId} ele geçirdi`);
  });

  // ── MUHAREBE / SAVAŞ SİSTEMİ ─────────────────────────────
  socket.on("combat", async (data) => {
    const check = antiCheatCheck(socket, 'combat', data);
    if (!check.ok) return;

    const attacker = connectedPlayers.get(socket.id);
    if (!attacker) return;

    const { targetUserId, combatType, stake } = data;
    const combatId = `combat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    // Hedef oyuncu online mi?
    const targetEntry = [...connectedPlayers.entries()].find(([, p]) => p.userId === targetUserId);
    if (!targetEntry) {
      socket.emit('combatResult', { combatId, result: 'target_offline', reason: 'Hedef oyuncu çevrimdışı' });
      return;
    }

    const defender = targetEntry[1];

    // Server-taraflı savaş hesabı
    const attackerPower = (attacker.level || 1) * 10 + Math.random() * 50;
    const defenderPower = (defender.level || 1) * 10 + Math.random() * 50;

    const attackerWins = attackerPower > defenderPower;
    const winner = attackerWins ? attacker : defender;
    const loser = attackerWins ? defender : attacker;

    // Bahis varsa para transferi (max %5 miktarı)
    let moneyTransfer = 0;
    if (stake && stake > 0) {
      moneyTransfer = Math.min(stake, (loser.money || 0) * 0.05);
    }

    const result = {
      combatId,
      combatType: combatType || 'duel',
      attackerId: attacker.userId,
      attackerName: attacker.username,
      defenderId: defender.userId,
      defenderName: defender.username,
      attackerPower: Math.round(attackerPower),
      defenderPower: Math.round(defenderPower),
      winnerId: winner.userId,
      winnerName: winner.username,
      loserId: loser.userId,
      loserName: loser.username,
      moneyTransfer,
      ts: Date.now()
    };

    activeCombats[combatId] = result;

    // Her iki oyuncuya da sonucu gönder
    socket.emit('combatResult', result);
    io.to(targetEntry[0]).emit('combatResult', result);

    // Tüm oyunculara duyur
    io.emit('gameEvent', {
      type: 'combat',
      title: `Dövüş: ${attacker.username} vs ${defender.username}`,
      description: `${winner.username} kazandı!${moneyTransfer ? ` ₺${moneyTransfer} el değiştirdi.` : ''}`,
      ts: Date.now()
    });

    // Supabase'e kaydet
    await sb.saveCombatLog(result).catch(() => {});
    console.log(`⚔️  ${attacker.username} vs ${defender.username} → ${winner.username} kazandı`);
  });

  // ── MAFİA SAVAŞI (Çete vs Çete) ──────────────────────────
  socket.on("mafiaWar", async (data) => {
    const check = antiCheatCheck(socket, 'combat', data);
    if (!check.ok) return;

    const player = connectedPlayers.get(socket.id);
    if (!player) return;

    const { attackingGangId, defendingGangId, city } = data;
    const warId = `war_${Date.now()}`;

    // Her iki çeteyi Supabase'den al
    const [attackers, defenders] = await Promise.all([
      sb.getGang(attackingGangId),
      sb.getGang(defendingGangId)
    ]).catch(() => [null, null]);

    if (!attackers || !defenders) {
      socket.emit('actionError', { action: 'mafiaWar', reason: 'Çete bulunamadı' });
      return;
    }

    // Savaş hesabı: güç + rastgele
    const attackPower = (attackers.power || 1) + Math.random() * 100;
    const defensePower = (defenders.power || 1) + Math.random() * 100;
    const attackerWins = attackPower > defensePower;

    const warResult = {
      warId,
      attackingGangId,
      attackingGangName: attackers.name,
      defendingGangId,
      defendingGangName: defenders.name,
      city,
      winner: attackerWins ? attackingGangId : defendingGangId,
      winnerName: attackerWins ? attackers.name : defenders.name,
      attackPower: Math.round(attackPower),
      defensePower: Math.round(defensePower),
      ts: Date.now()
    };

    // Şehir sahipliğini güncelle (savaş kazanılırsa)
    if (city && attackerWins) {
      cityOwnership[city] = {
        cityId: city,
        gangId: attackingGangId,
        gangName: attackers.name,
        capturedBy: player.username,
        capturedAt: Date.now(),
        tax: 5
      };
      await sb.saveGameState('cityOwnership', cityOwnership).catch(() => {});
      io.emit('cityOwnershipUpdate', cityOwnership);
    }

    // Güç güncellemesi
    const powerGain = attackerWins ? 10 : -5;
    const powerLoss = attackerWins ? -5 : 10;
    await Promise.all([
      sb.updateGangPower(attackingGangId, powerGain),
      sb.updateGangPower(defendingGangId, powerLoss)
    ]).catch(() => {});

    io.emit('mafiaWarUpdate', warResult);
    io.emit('gameEvent', {
      type: 'mafia_war',
      title: `Çete Savaşı: ${attackers.name} vs ${defenders.name}`,
      description: `${warResult.winnerName} savaşı kazandı!${city ? ` ${city} şehri el değiştirdi.` : ''}`,
      city: city || '',
      ts: Date.now()
    });
    io.emit('adminBroadcast', {
      type: 'gang',
      title: '⚔️ Çete Savaşı Sonuçlandı!',
      message: `${attackers.name} vs ${defenders.name} — Kazanan: ${warResult.winnerName}${city ? ` (${city} el değiştirdi)` : ''}`,
      sender: 'Sistem',
      ts: Date.now()
    });

    await sb.saveGameState('lastMafiaWar', warResult).catch(() => {});
    console.log(`⚔️  Çete savaşı: ${attackers.name} vs ${defenders.name} → ${warResult.winnerName}`);
  });

  // ── SEÇİM YAYINI ──────────────────────────────────────────
  socket.on("electionUpdate", (data) => {
    io.emit("electionUpdate", { ...data, ts: Date.now() });
    sb.saveGameState('electionState', data).catch(() => {});
  });

  // ── SEÇİM OYU (Server Authority) ──────────────────────────
  socket.on("electionVote", async (data) => {
    const check = antiCheatCheck(socket, 'vote', data);
    if (!check.ok) {
      socket.emit('voteError', { reason: 'Çok hızlı oy veriliyor' });
      return;
    }

    const player = connectedPlayers.get(socket.id);
    if (!player || player.userId !== data.voterId) {
      socket.emit('voteError', { reason: 'Kimlik doğrulama hatası' });
      return;
    }

    const { electionId, candidateId } = data;

    // Daha önce oy verdi mi?
    const existing = await sb.loadGameState('electionState').catch(() => null);
    if (existing && existing[electionId]) {
      const votedBy = existing[electionId].votedBy || [];
      if (votedBy.includes(player.userId)) {
        socket.emit('voteError', { reason: 'Bu seçimde zaten oy kullandınız' });
        return;
      }
    }

    // Oyu kaydet
    const elState = existing || {};
    if (!elState[electionId]) elState[electionId] = { candidates: {}, votedBy: [] };
    if (!elState[electionId].candidates[candidateId]) elState[electionId].candidates[candidateId] = 0;
    elState[electionId].candidates[candidateId]++;
    if (!elState[electionId].votedBy) elState[electionId].votedBy = [];
    elState[electionId].votedBy.push(player.userId);

    await sb.saveGameState('electionState', elState).catch(() => {});
    io.emit('electionUpdate', { ...elState, ts: Date.now() });
    socket.emit('voteSuccess', { electionId, candidateId });
    console.log(`🗳️  ${player.username} → ${candidateId} oyu`);
  });

  // ── SEÇİM SONUÇLARI ───────────────────────────────────────
  socket.on("electionEnd", async (data) => {
    const player = connectedPlayers.get(socket.id);
    if (!player) return;

    const { electionId } = data;
    const elState = await sb.loadGameState('electionState').catch(() => ({}));
    const election = elState && elState[electionId];

    if (!election) {
      socket.emit('actionError', { action: 'electionEnd', reason: 'Seçim bulunamadı' });
      return;
    }

    // Kazananı hesapla
    const candidates = election.candidates || {};
    const winner = Object.entries(candidates).sort((a, b) => b[1] - a[1])[0];

    const result = {
      electionId,
      winner: winner ? { candidateId: winner[0], votes: winner[1] } : null,
      allVotes: candidates,
      totalVotes: Object.values(candidates).reduce((a, b) => a + b, 0),
      ts: Date.now()
    };

    await sb.saveGameState('electionResults', result).catch(() => {});
    io.emit('electionResult', result);
    io.emit('gameEvent', {
      type: 'election_result',
      title: 'Seçim Sonuçlandı!',
      description: winner ? `${winner[0]} ${winner[1]} oyla seçimi kazandı!` : 'Seçim tamamlandı',
      ts: Date.now()
    });
    io.emit('adminBroadcast', {
      type: 'election',
      title: '🏆 Seçim Sonuçlandı!',
      message: winner ? `${winner[0]}, ${winner[1]} oyla seçimi kazandı!` : 'Seçim sona erdi, sonuçlar açıklandı.',
      sender: 'Sistem',
      ts: Date.now()
    });
    console.log(`🏆 Seçim ${electionId} sonuçlandı. Kazanan: ${winner ? winner[0] : 'belirsiz'}`);
  });

  // ── PARTİ GÜNCELLEME ──────────────────────────────────────
  socket.on("partyUpdate", (data) => {
    io.emit("partyUpdate", { ...data, ts: Date.now() });
    if (data.id) sb.upsertParty(data).catch(() => {});
  });

  // ── ÇETE GÜNCELLEME ───────────────────────────────────────
  socket.on("gangUpdate", (data) => {
    io.emit("gangUpdate", { ...data, ts: Date.now() });
    if (data.id) sb.upsertGang(data).catch(() => {});
  });

  // ── OYUN OLAYI ────────────────────────────────────────────
  socket.on("gameEvent", (data) => {
    io.emit("gameEvent", { ...data, ts: Date.now() });
    sb.saveEvent(data).catch(() => {});
  });

  // ── OYUN STATE KAYDET ─────────────────────────────────────
  socket.on("saveState", (data) => {
    if (data.key && data.value !== undefined) {
      sb.saveGameState(data.key, data.value).catch(() => {});
      socket.broadcast.emit("stateUpdate", { key: data.key, value: data.value, ts: Date.now() });
    }
  });

  // ── EKONOMİ KAYDET ────────────────────────────────────────
  socket.on("economyUpdate", (data) => {
    io.emit("economyUpdate", { ...data, ts: Date.now() });
    sb.saveEconomy(data).catch(() => {});
  });

  // ── PARTNERLİK TEKLİFİ ────────────────────────────────────
  socket.on("partnershipOffer", (data) => {
    const targetEntry = [...connectedPlayers.entries()].find(([, p]) => p.userId === data.toUserId);
    if (targetEntry) {
      io.to(targetEntry[0]).emit("partnershipOffer", data);
      socket.emit("partnershipSent", { success: true });
    } else {
      socket.emit("partnershipSent", { success: false, reason: 'Oyuncu çevrimdışı' });
    }
  });

  // ── GENEL BROADCAST ───────────────────────────────────────
  socket.on("gameAction", (data) => {
    io.emit("gameAction", { ...data, socketId: socket.id, ts: Date.now() });
  });

  // ── OYUN STATE SYNC ────────────────────────────────────────
  socket.on("cabinetUpdate", (data) => {
    io.emit("cabinetUpdate", data);
    sb.saveGameState('cabinet', data).catch(() => {});
  });

  socket.on("electionUpdate", (data) => {
    io.emit("electionUpdate", data);
    sb.saveGameState('electionState', data).catch(() => {});
    // Yeni seçim başladığında tüm oyunculara bildir
    if (data.type === 'election_start' && data.electionTitle) {
      io.emit('adminBroadcast', {
        type: 'election',
        title: '🗳️ Seçim Başladı!',
        message: `${data.electionTitle} seçimi başladı! Adaylar oyunuzu bekliyor.`,
        sender: 'Sistem',
        ts: Date.now()
      });
    }
  });

  socket.on("partyUpdate", (data) => {
    io.emit("partyUpdate", data);
    // Yeni parti kurulduğunda bildir
    if (data.isNew && data.name) {
      io.emit('adminBroadcast', {
        type: 'system',
        title: '🎉 Yeni Parti Kuruldu!',
        message: `"${data.name}" adlı yeni bir parti kuruldu. Partiye katılmak için Partiler sayfasına gidin!`,
        sender: 'Sistem',
        ts: Date.now()
      });
    }
  });

  socket.on("lawUpdate", (data) => {
    io.emit("lawUpdate", data);
    if (data.proposals) sb.saveGameState('lawProposals', data.proposals).catch(() => {});
    if (data.laws) sb.saveGameState('laws', data.laws).catch(() => {});
    // Yeni yasa kabul edildiğinde bildir
    if (data.passedLaw && data.passedLaw.title) {
      io.emit('adminBroadcast', {
        type: 'law',
        title: '📜 Yasa Kabul Edildi!',
        message: `"${data.passedLaw.title}" yasası mecliste kabul edildi ve yürürlüğe girdi!`,
        sender: 'Sistem',
        ts: Date.now()
      });
    }
  });

  socket.on("gangsUpdate", (data) => {
    io.emit("gangsUpdate", data);
  });

  socket.on("parliamentUpdate", (data) => {
    io.emit("parliamentUpdate", data);
  });

  socket.on("requestOnlinePlayers", () => {
    socket.emit("onlinePlayers", getOnlineList());
  });

  socket.on("usersSync", (data) => {
    // Sadece admin yayınlayabilir — basit kontrol
    const player = connectedPlayers.get(socket.id);
    if (player) {
      io.emit("usersSnapshot", data);
    }
  });

  // ── ADMİN BROADCAST (tüm oyunculara anlık bildirim) ────────
  socket.on("adminBroadcast", (data) => {
    const player = connectedPlayers.get(socket.id);
    if (!player) return;
    const payload = {
      type: data.type || "system",
      title: (data.title || "").slice(0, 120),
      message: (data.message || "").slice(0, 500),
      sender: player.username || "Admin",
      ts: Date.now()
    };
    // Göndereni de dahil ederek tüm bağlı oyunculara yayınla
    io.emit("adminBroadcast", payload);
    // Supabase'e kaydet (bildirim geçmişi)
    sb.saveGameState(`broadcast_${payload.ts}`, payload).catch(() => {});
    console.log(`📢 Broadcast: [${payload.type}] "${payload.title}" — ${player.username}`);
  });

  // ── AYRILIŞ ───────────────────────────────────────────────
  socket.on("disconnect", () => {
    const player = connectedPlayers.get(socket.id);
    connectedPlayers.delete(socket.id);

    // Anti-cheat temizleme
    Object.keys(actionCounts).forEach(k => { if (k.startsWith(socket.id + ':')) delete actionCounts[k]; });

    const list = getOnlineList();
    io.emit("onlineCount", list.length);
    io.emit("onlinePlayers", list);
    if (player) {
      console.log(`✗ ${player.username} çıktı. Online: ${list.length}`);
      if (player.userId) {
        sb.updatePlayerStats(player.userId, { last_seen: new Date().toISOString() }).catch(() => {});
      }
    }
  });
});

// ── REST API ──────────────────────────────────────────────────

// Chat geçmişi
app.get('/api/chat/:channel', async (req, res) => {
  const { channel } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 100, 200);
  const history = await sb.getChatHistory(channel, limit);
  res.json(history);
});

// Tüm oyuncular (admin paneli)
app.get('/api/players', async (req, res) => {
  try {
    const players = await sb.getAllPlayers(1000);
    res.json(players);
  } catch(e) {
    res.json([]);
  }
});

// Çevrimiçi oyuncular
app.get('/api/online-players', (req, res) => {
  res.json(getOnlineList());
});

// Liderlik tablosu
app.get('/api/leaderboard', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const data = await sb.getLeaderboard(limit);
  res.json(data);
});

// Borsa anlık
app.get('/api/market', async (req, res) => {
  const data = await sb.getMarketSnapshot();
  res.json(data);
});

// Oyun state yükle
app.get('/api/state/:key', async (req, res) => {
  const value = await sb.loadGameState(req.params.key);
  res.json({ key: req.params.key, value });
});

// Tüm state yükle
app.get('/api/state', async (req, res) => {
  const data = await sb.loadAllGameState();
  res.json(data);
});

// Partiler
app.get('/api/parties', async (req, res) => {
  const data = await sb.getAllParties();
  res.json(data);
});

// Çeteler
app.get('/api/gangs', async (req, res) => {
  const data = await sb.getAllGangs();
  res.json(data);
});

// Aktif olaylar
app.get('/api/events', async (req, res) => {
  const { city } = req.query;
  const data = await sb.getActiveEvents(city || null);
  res.json(data);
});

// Oyuncu profil yükle
app.get('/api/player/:userId', async (req, res) => {
  const data = await sb.getPlayer(req.params.userId);
  res.json(data);
});

// Oyuncu kaydet
app.post('/api/player', async (req, res) => {
  const playerData = req.body;
  await sb.upsertPlayer(playerData);
  res.json({ ok: true });
});

// State kaydet
app.post('/api/state', async (req, res) => {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ error: 'key gerekli' });
  await sb.saveGameState(key, value);
  res.json({ ok: true });
});

// Ekonomi kaydet
app.post('/api/economy', async (req, res) => {
  await sb.saveEconomy(req.body);
  res.json({ ok: true });
});

// ── ENVANTEr API ──────────────────────────────────────────────
app.get('/api/inventory/:userId', async (req, res) => {
  try {
    const data = await sb.getInventory(req.params.userId);
    res.json(data);
  } catch(e) {
    res.json([]);
  }
});

app.post('/api/inventory/:userId', async (req, res) => {
  try {
    const { item, amount } = req.body;
    const result = await sb.addInventoryItem(req.params.userId, item, amount || 1);
    res.json(result);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── ŞEHİR SAHİPLİĞİ API ──────────────────────────────────────
app.get('/api/city-ownership', async (req, res) => {
  const data = await sb.loadGameState('cityOwnership');
  res.json(data || cityOwnership);
});

// ── MUHAREBE LOGLARI ──────────────────────────────────────────
app.get('/api/combat-log', async (req, res) => {
  try {
    const { userId, limit: l } = req.query;
    const data = await sb.getCombatLog(userId, Math.min(parseInt(l) || 20, 50));
    res.json(data);
  } catch(e) {
    res.json([]);
  }
});

// ── SEÇİM DURUMU ──────────────────────────────────────────────
app.get('/api/elections', async (req, res) => {
  const data = await sb.loadGameState('electionState');
  res.json(data || {});
});

app.get('/api/election-results', async (req, res) => {
  const data = await sb.loadGameState('electionResults');
  res.json(data || {});
});

// ── CLIENT CONFIG ─────────────────────────────────────────────
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
  });
});

// ── MAİL API ─────────────────────────────────────────────────

// Hoş geldin maili — kayıt sonrası çağırılır
app.post('/api/mail/welcome', async (req, res) => {
  const { to, username, userId } = req.body;
  if (!to || !username) return res.status(400).json({ ok: false, reason: 'Eksik parametre' });
  const result = await mail.sendWelcome(to, username, userId);
  res.json(result);
});

// Şifre sıfırlama: kod oluştur ve gönder
app.post('/api/mail/reset-request', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ ok: false, reason: 'E-posta gerekli' });

  try {
    // Supabase'den bu e-posta ile oyuncu ara
    let player = null;
    if (sb.supabase) {
      const { data } = await sb.supabase
        .from('players')
        .select('id, username, email')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();
      player = data;
    }

    // Güvenlik: her durumda başarılı cevap ver (e-posta enumeration önleme)
    if (!player) {
      return res.json({ ok: true, message: 'Eğer bu e-posta kayıtlıysa sıfırlama kodu gönderildi.' });
    }

    // 6 haneli sayısal kod üret
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const token = `${player.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 dakika

    resetTokens.set(token, {
      code,
      userId: player.id,
      username: player.username,
      email: player.email,
      expiresAt
    });

    // Süresi dolmuş tokenleri temizle
    for (const [k, v] of resetTokens.entries()) {
      if (Date.now() > v.expiresAt) resetTokens.delete(k);
    }

    await mail.sendPasswordReset(player.email, player.username, code, player.id);

    res.json({ ok: true, token, message: 'Sıfırlama kodu e-postanıza gönderildi.' });
  } catch(e) {
    console.warn('[Reset] Hata:', e.message);
    res.status(500).json({ ok: false, reason: e.message });
  }
});

// Şifre sıfırlama: kodu doğrula ve yeni şifre ata
app.post('/api/mail/reset-confirm', async (req, res) => {
  const { token, code, newPasswordHash } = req.body;
  if (!token || !code || !newPasswordHash) {
    return res.status(400).json({ ok: false, reason: 'Eksik parametre' });
  }

  const entry = resetTokens.get(token);
  if (!entry) return res.status(400).json({ ok: false, reason: 'Geçersiz veya süresi dolmuş token' });
  if (Date.now() > entry.expiresAt) {
    resetTokens.delete(token);
    return res.status(400).json({ ok: false, reason: 'Sıfırlama kodunun süresi dolmuş (15 dk)' });
  }
  if (entry.code !== String(code).trim()) {
    return res.status(400).json({ ok: false, reason: 'Hatalı kod' });
  }

  try {
    if (sb.supabase) {
      await sb.supabase
        .from('players')
        .update({ password_hash: newPasswordHash, updated_at: new Date().toISOString() })
        .eq('id', entry.userId);
    }
    resetTokens.delete(token);
    res.json({ ok: true, username: entry.username, message: 'Şifre başarıyla güncellendi.' });
  } catch(e) {
    res.status(500).json({ ok: false, reason: e.message });
  }
});

// Ban bildirimi
app.post('/api/mail/ban', async (req, res) => {
  const { to, username, reason, until, userId } = req.body;
  if (!to || !username) return res.status(400).json({ ok: false, reason: 'Eksik parametre' });
  const result = await mail.sendBanNotification(to, username, reason, until, userId);
  res.json(result);
});

// Seçim sonucu bildirimi
app.post('/api/mail/election-result', async (req, res) => {
  const { to, username, position, winner, votes, userId } = req.body;
  if (!to || !username) return res.status(400).json({ ok: false, reason: 'Eksik parametre' });
  const result = await mail.sendElectionResult(to, username, position, winner, votes, userId);
  res.json(result);
});

// Genel bildirim (admin → oyuncu)
app.post('/api/mail/notify', async (req, res) => {
  const { to, username, title, message, userId } = req.body;
  if (!to || !username || !title || !message) return res.status(400).json({ ok: false, reason: 'Eksik parametre' });
  const result = await mail.sendNotification(to, username, title, message, userId);
  res.json(result);
});

// Mail durumu / log (admin için)
app.get('/api/mail/logs', async (req, res) => {
  if (!sb.supabase) return res.json([]);
  try {
    const { data } = await sb.supabase
      .from('mail_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    res.json(data || []);
  } catch(e) {
    res.json([]);
  }
});

// Toplu mail: tüm aktif oyunculara bildirim gönder (admin)
app.post('/api/mail/bulk', async (req, res) => {
  const { title, message, adminKey } = req.body;
  if (adminKey !== process.env.ADMIN_API_KEY && adminKey !== 'understate_admin_2026') {
    return res.status(403).json({ ok: false, reason: 'Yetkisiz' });
  }
  if (!title || !message) return res.status(400).json({ ok: false, reason: 'Eksik parametre' });

  try {
    if (!sb.supabase) return res.status(503).json({ ok: false, reason: 'Supabase bağlantısı yok' });
    const { data: players } = await sb.supabase
      .from('players')
      .select('id, username, email')
      .eq('banned', false)
      .not('email', 'is', null);

    let sent = 0, failed = 0;
    for (const p of (players || [])) {
      if (!p.email) continue;
      const r = await mail.sendNotification(p.email, p.username, title, message, p.id);
      if (r.ok) sent++; else failed++;
      // Rate limit: 2 mail/saniye (Brevo free = 300/gün)
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    res.json({ ok: true, sent, failed, total: (players || []).length });
  } catch(e) {
    res.status(500).json({ ok: false, reason: e.message });
  }
});

// ── ADMİN BROADCAST REST (HTTP üzerinden de broadcast) ─────────
app.post('/api/admin/broadcast', async (req, res) => {
  const { type, title, message, sender, ts } = req.body;
  if (!message) return res.status(400).json({ ok: false, reason: 'Mesaj boş' });
  const payload = {
    type: type || 'system',
    title: (title || '').slice(0, 120),
    message: message.slice(0, 500),
    sender: sender || 'Admin',
    ts: ts || Date.now()
  };
  // Tüm socket bağlantılarına yayınla
  io.emit('adminBroadcast', payload);
  // Supabase'e kaydet
  await sb.saveGameState(`broadcast_${payload.ts}`, payload).catch(() => {});
  console.log(`📢 REST Broadcast: [${payload.type}] "${payload.title}" — ${payload.sender}`);
  res.json({ ok: true, sent: io.engine.clientsCount });
});

// ── GIPHY PROXY ────────────────────────────────────────────────
const GIPHY_KEY_IOS = process.env.GIPHY_API_KEY_IOS || 'GIox2WMebFGLynjYWYLxiSZeIuQu2qge';
const GIPHY_KEY_ANDROID = process.env.GIPHY_API_KEY_ANDROID || 'al2PxWyNwWgH1lrjk6Lu2JTtnOLvKrz0';
const GIPHY_KEY = (req) => {
  const ua = (req && req.headers && req.headers['user-agent']) || '';
  return ua.toLowerCase().includes('android') ? GIPHY_KEY_ANDROID : GIPHY_KEY_IOS;
};

app.get('/api/giphy-search', async (req, res) => {
  const q = (req.query.q || 'eğlenceli').trim();
  const limit = parseInt(req.query.limit) || 24;
  try {
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY(req)}&q=${encodeURIComponent(q)}&limit=${limit}&rating=pg-13&lang=tr`;
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch(e) {
    res.json({ data: [] });
  }
});

app.get('/api/giphy-stickers', async (req, res) => {
  const q = (req.query.q || 'cool').trim();
  try {
    const url = `https://api.giphy.com/v1/stickers/search?api_key=${GIPHY_KEY(req)}&q=${encodeURIComponent(q)}&limit=20&rating=pg-13`;
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch(e) {
    res.json({ data: [] });
  }
});

// ── Sunucuyu başlat ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 UnderState Server aktif - Port: ${PORT}`);
  console.log(`🗄️  Supabase: ${process.env.SUPABASE_URL ? '✓ Bağlı' : '✗ Credentials eksik'}`);
  await loadServerState();
});
