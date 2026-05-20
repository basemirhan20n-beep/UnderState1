/**
 * Supabase Server-side Helper (service role — tam yetki)
 */
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('[Supabase] Credentials eksik — SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli');
}

const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
      realtime: { transport: ws }
    })
  : null;

// ── CHAT ──────────────────────────────────────────────────────
async function saveMessage(msg) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('global_chat').upsert({
      id: msg.id || undefined,
      sender_id: msg.senderId || msg.userId || null,
      sender: msg.sender || msg.username || 'Anonim',
      message: msg.message || msg.text || '',
      gif_url: msg.gifUrl || msg.gif || null,
      sticker: msg.sticker || null,
      channel: msg.channel || 'global',
      ts: msg.ts || msg.timestamp || Date.now()
    }, { onConflict: 'id' });
    if (error) console.warn('[Supabase Chat] Kayıt hatası:', error.message);
  } catch (e) {
    console.warn('[Supabase Chat] İstisna:', e.message);
  }
}

async function getChatHistory(channel = 'global', limit = 100) {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('global_chat')
      .select('*')
      .eq('channel', channel)
      .order('ts', { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data || []).reverse();
  } catch (e) {
    return [];
  }
}

// ── OYUNCU ───────────────────────────────────────────────────
async function upsertPlayer(playerData) {
  if (!supabase) return;
  try {
    const row = {
      id: playerData.userId || playerData.id,
      username: playerData.username,
      level: playerData.level || 1,
      money: playerData.money || 0,
      city: playerData.city || '',
      gender: playerData.gender || 'erkek',
      party: playerData.party || null,
      gang: playerData.gang || null,
      last_seen: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    // Kolon olmayabilir — sadece varsa ekle
    if (playerData.avatar !== undefined) row.avatar = playerData.avatar;
    if (playerData.job !== undefined) row.job = playerData.job;
    if (playerData.education !== undefined) row.education = playerData.education;
    if (playerData.stats !== undefined) row.stats = playerData.stats;
    if (playerData.inventory !== undefined) row.inventory = playerData.inventory;

    const { error } = await supabase.from('players').upsert(row, { onConflict: 'id' });
    if (error && !error.message.includes('column')) {
      console.warn('[Supabase Player] Upsert hatası:', error.message);
    } else if (error) {
      // Kolon bulunamadı — minimum bilgiyle tekrar dene
      const minRow = { id: row.id, username: row.username, level: row.level, money: row.money, city: row.city, last_seen: row.last_seen, updated_at: row.updated_at };
      await supabase.from('players').upsert(minRow, { onConflict: 'id' });
    }
  } catch (e) {
    console.warn('[Supabase Player] İstisna:', e.message);
  }
}

async function getPlayer(userId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data;
  } catch (e) {
    return null;
  }
}

async function updatePlayerStats(userId, stats) {
  if (!supabase) return;
  try {
    const cleanStats = {};
    Object.entries(stats).forEach(([k, v]) => { if (v !== undefined) cleanStats[k] = v; });
    const { error } = await supabase.from('players')
      .update({ ...cleanStats, updated_at: new Date().toISOString(), last_seen: new Date().toISOString() })
      .eq('id', userId);
    if (error) console.warn('[Supabase Player] Update hatası:', error.message);
  } catch (e) {}
}

async function getLeaderboard(limit = 50) {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('players')
      .select('id, username, level, money, city, gang, party, stats, last_seen')
      .order('money', { ascending: false })
      .limit(limit);
    if (error) return [];
    return data || [];
  } catch (e) {
    return [];
  }
}

async function getAllPlayers(limit = 1000) {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.warn('[Supabase getAllPlayers] Hata:', error.message);
      return [];
    }
    return data || [];
  } catch (e) {
    console.warn('[Supabase getAllPlayers] İstisna:', e.message);
    return [];
  }
}

// ── ENVANTER SİSTEMİ ─────────────────────────────────────────
async function getInventory(userId) {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('players')
      .select('inventory')
      .eq('id', userId)
      .single();
    if (error) return [];
    return data?.inventory || [];
  } catch (e) {
    return [];
  }
}

async function addInventoryItem(userId, item, amount = 1) {
  if (!supabase) return { ok: false, reason: 'Supabase bağlantısı yok' };
  try {
    const current = await getInventory(userId);
    const existing = current.find(i => i.id === item.id);
    let updated;
    if (existing) {
      updated = current.map(i => i.id === item.id ? { ...i, amount: (i.amount || 1) + amount } : i);
    } else {
      updated = [...current, { ...item, amount }];
    }
    await supabase.from('players').update({ inventory: updated, updated_at: new Date().toISOString() }).eq('id', userId);
    return { ok: true, inventory: updated };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

async function removeInventoryItem(userId, itemId, amount = 1) {
  if (!supabase) return { ok: false };
  try {
    const current = await getInventory(userId);
    let updated = current.map(i => {
      if (i.id !== itemId) return i;
      const newAmt = (i.amount || 1) - amount;
      return newAmt <= 0 ? null : { ...i, amount: newAmt };
    }).filter(Boolean);
    await supabase.from('players').update({ inventory: updated, updated_at: new Date().toISOString() }).eq('id', userId);
    return { ok: true, inventory: updated };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

async function useInventoryItem(userId, item) {
  if (!supabase) return { ok: false };
  try {
    const result = await removeInventoryItem(userId, item.id, 1);
    if (!result.ok) return { ok: false, reason: 'Eşya bulunamadı' };

    // Eşya efektleri
    const ITEM_EFFECTS = {
      health_potion:    { health: +20 },
      energy_drink:     { energy: +30 },
      money_bag:        { money: +5000 },
      xp_boost:         { xpMultiplier: 2, duration: 3600000 },
      shield:           { combatBonus: +15, duration: 1800000 },
      speed_boost:      { workSpeed: 2, duration: 1800000 },
    };

    const effect = ITEM_EFFECTS[item.id] || {};
    return { ok: true, inventory: result.inventory, effect };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

async function transferInventoryItem(fromUserId, toUserId, item, amount = 1) {
  if (!supabase) return { ok: false };
  try {
    const fromInv = await getInventory(fromUserId);
    const fromItem = fromInv.find(i => i.id === item.id);
    if (!fromItem || (fromItem.amount || 1) < amount) {
      return { ok: false, reason: 'Yetersiz eşya' };
    }
    const removeResult = await removeInventoryItem(fromUserId, item.id, amount);
    const addResult = await addInventoryItem(toUserId, item, amount);
    return { ok: true, fromInventory: removeResult.inventory, toInventory: addResult.inventory };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

async function buyMarketItem(userId, item, amount = 1) {
  if (!supabase) return { ok: false, reason: 'Supabase bağlantısı yok' };
  try {
    const player = await getPlayer(userId);
    if (!player) return { ok: false, reason: 'Oyuncu bulunamadı' };

    const totalCost = (item.price || 0) * amount;
    if (player.money < totalCost) {
      return { ok: false, reason: `Yetersiz para (₺${totalCost} gerekli)` };
    }

    const newMoney = player.money - totalCost;
    await updatePlayerStats(userId, { money: newMoney });
    const addResult = await addInventoryItem(userId, item, amount);

    return { ok: true, newMoney, inventory: addResult.inventory };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

// ── BORSA ────────────────────────────────────────────────────
async function upsertCompany(companyData) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('stock_market').upsert({
      company_id: companyData.companyId,
      name: companyData.name,
      owner_id: companyData.ownerId || null,
      owner_name: companyData.ownerName || '',
      share_price: companyData.sharePrice || 100,
      sector: companyData.sector || '',
      sector_icon: companyData.sectorIcon || '🏢',
      price_history: companyData.priceHistory || [],
      value: companyData.value || 0,
      updated_at: new Date().toISOString()
    }, { onConflict: 'company_id' });
    if (error) console.warn('[Supabase Market] Upsert hatası:', error.message);
  } catch (e) {}
}

async function getMarketSnapshot() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('stock_market')
      .select('*')
      .order('value', { ascending: false });
    if (error) return [];
    return data || [];
  } catch (e) {
    return [];
  }
}

// ── OYUN STATE ────────────────────────────────────────────────
async function saveGameState(key, value) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('game_state').upsert({
      key,
      value,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });
    if (error) console.warn('[Supabase State] Upsert hatası:', key, error.message);
  } catch (e) {}
}

async function loadGameState(key) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('game_state')
      .select('value')
      .eq('key', key)
      .single();
    if (error) return null;
    return data?.value || null;
  } catch (e) {
    return null;
  }
}

async function loadAllGameState() {
  if (!supabase) return {};
  try {
    const { data, error } = await supabase
      .from('game_state')
      .select('key, value');
    if (error) return {};
    const result = {};
    (data || []).forEach(row => { result[row.key] = row.value; });
    return result;
  } catch (e) {
    return {};
  }
}

// ── PARTİLER ─────────────────────────────────────────────────
async function upsertParty(party) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('parties').upsert({
      id: party.id,
      name: party.name,
      leader_id: party.leaderId || null,
      leader: party.leader || '',
      ideology: party.ideology || '',
      members: party.members || [],
      treasury: party.treasury || 0,
      votes: party.votes || 0,
      color: party.color || '#888',
      logo: party.logo || null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
    if (error) console.warn('[Supabase Party] Upsert hatası:', error.message);
  } catch (e) {}
}

async function getAllParties() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('parties').select('*');
    if (error) return [];
    return data || [];
  } catch (e) {
    return [];
  }
}

// ── ÇETELER / KLANLAR ─────────────────────────────────────────
async function upsertGang(gang) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('gangs').upsert({
      id: gang.id,
      name: gang.name,
      leader_id: gang.leaderId || null,
      leader: gang.leader || '',
      members: gang.members || [],
      territory: gang.territory || '',
      treasury: gang.treasury || 0,
      power: gang.power || 0,
      logo: gang.logo || null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
    if (error) console.warn('[Supabase Gang] Upsert hatası:', error.message);
  } catch (e) {}
}

async function getGang(gangId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('gangs').select('*').eq('id', gangId).single();
    if (error) return null;
    return data;
  } catch (e) {
    return null;
  }
}

async function updateGangPower(gangId, delta) {
  if (!supabase) return;
  try {
    const gang = await getGang(gangId);
    if (!gang) return;
    const newPower = Math.max(0, (gang.power || 0) + delta);
    await supabase.from('gangs').update({ power: newPower, updated_at: new Date().toISOString() }).eq('id', gangId);
  } catch (e) {}
}

async function getAllGangs() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('gangs').select('*');
    if (error) return [];
    return data || [];
  } catch (e) {
    return [];
  }
}

// ── MUHAREBE LOGLARI ─────────────────────────────────────────
async function saveCombatLog(result) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('combat_logs').upsert({
      id: result.combatId,
      attacker_id: result.attackerId,
      attacker_name: result.attackerName,
      defender_id: result.defenderId,
      defender_name: result.defenderName,
      winner_id: result.winnerId,
      winner_name: result.winnerName,
      combat_type: result.combatType || 'duel',
      money_transfer: result.moneyTransfer || 0,
      attacker_power: result.attackerPower || 0,
      defender_power: result.defenderPower || 0,
      data: result,
      ts: result.ts || Date.now()
    }, { onConflict: 'id' });
    if (error) console.warn('[Supabase Combat] Log hatası:', error.message);
  } catch (e) {}
}

async function getCombatLog(userId, limit = 20) {
  if (!supabase) return [];
  try {
    let query = supabase
      .from('combat_logs')
      .select('*')
      .order('ts', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.or(`attacker_id.eq.${userId},defender_id.eq.${userId}`);
    }

    const { data, error } = await query;
    if (error) return [];
    return data || [];
  } catch (e) {
    return [];
  }
}

// ── OLAYLAR ───────────────────────────────────────────────────
async function saveEvent(event) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('game_events').upsert({
      id: event.id || undefined,
      type: event.type || 'general',
      title: event.title || '',
      description: event.description || '',
      data: event.data || {},
      city: event.city || '',
      active: event.active !== false,
      expires_at: event.expiresAt ? new Date(event.expiresAt).toISOString() : null
    }, { onConflict: 'id' });
    if (error) console.warn('[Supabase Event] Upsert hatası:', error.message);
  } catch (e) {}
}

async function getActiveEvents(city = null) {
  if (!supabase) return [];
  try {
    let query = supabase
      .from('game_events')
      .select('*')
      .eq('active', true)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());
    if (city) query = query.or(`city.eq.${city},city.eq.`);
    const { data, error } = await query.order('created_at', { ascending: false }).limit(50);
    if (error) return [];
    return data || [];
  } catch (e) {
    return [];
  }
}

// ── EKONOMİ ──────────────────────────────────────────────────
async function saveEconomy(data) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('economy').upsert({
      id: 'main',
      data,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
    if (error) console.warn('[Supabase Economy] Upsert hatası:', error.message);
  } catch (e) {}
}

async function getEconomy() {
  if (!supabase) return {};
  try {
    const { data, error } = await supabase.from('economy').select('data').eq('id', 'main').single();
    if (error) return {};
    return data?.data || {};
  } catch (e) {
    return {};
  }
}

module.exports = {
  supabase,
  // Chat
  saveMessage, getChatHistory,
  // Oyuncu
  upsertPlayer, getPlayer, updatePlayerStats, getLeaderboard, getAllPlayers,
  // Envanter
  getInventory, addInventoryItem, removeInventoryItem, useInventoryItem, transferInventoryItem, buyMarketItem,
  // Borsa
  upsertCompany, getMarketSnapshot,
  // State
  saveGameState, loadGameState, loadAllGameState,
  // Partiler
  upsertParty, getAllParties,
  // Çeteler
  upsertGang, getGang, getAllGangs, updateGangPower,
  // Muharebe
  saveCombatLog, getCombatLog,
  // Olaylar
  saveEvent, getActiveEvents,
  // Ekonomi
  saveEconomy, getEconomy
};
