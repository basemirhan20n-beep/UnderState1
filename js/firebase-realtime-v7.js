/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNDERSTATE v7: FULL REAL-TIME GAME SYNC
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Bu sistem tüm oyun verilerini anlık olarak senkronize eder:
 * • Borsa fiyatları, vergi oranları (Economy)
 * • Oyuncu bakiyeleri, envanteri (User Data)
 * • Tarım durumları, üretim (Farms)
 * • Çevrimiçi oyuncuların canlı listesi (Presence)
 * 
 * Teknik: Firebase Realtime Database + Firestore onSnapshot (hybrid)
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function() {
  "use strict";

  // ─────────────────────────────────────────────────────────────────────────
  // 1. GLOBAL STATE LISTENER - Borsa, Vergi, Yasalar (Anlık Güncelleme)
  // ─────────────────────────────────────────────────────────────────────────
  window._globalListeners = {};

  /**
   * Borsa fiyatları, vergi oranları, aktif yasalar = herkes için aynı
   * Değişince TÜM çevrimiçi oyuncular anında görür
   */
  async function setupGlobalStateListener() {
    if (!window._fb || !window._fbReady) {
      console.warn("[GlobalState] Firebase hazır değil");
      return;
    }

    const db = window._fb.db;
    const gameId = window._gameId;

    try {
      // Firestore: games/{gameId}/state/global
      const globalRef = db
        .collection("games")
        .doc(gameId)
        .collection("state")
        .doc("global");

      // onSnapshot: Değişince callback çalışır
      window._globalListeners.unsubscribe = globalRef.onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            console.log("[GlobalState] Belge boş, ilk kez oluşturuluyor");
            return;
          }

          const globalData = snapshot.data();

          // Borsa fiyatları
          if (globalData.stockMarket) {
            localStorage.setItem("rep_stockMarket", JSON.stringify(globalData.stockMarket));
            window.dispatchEvent(new Event("stock-market-updated"));
            console.log("📊 Borsa güncellendi:", globalData.stockMarket);
          }

          // Vergi oranları
          if (globalData.taxRates) {
            localStorage.setItem("rep_taxRates", JSON.stringify(globalData.taxRates));
            window.dispatchEvent(new Event("tax-rates-updated"));
            console.log("💰 Vergi oranları güncellendi:", globalData.taxRates);
          }

          // Aktif Yasalar / Duyurular
          if (globalData.activeLaws) {
            localStorage.setItem("rep_activeLaws", JSON.stringify(globalData.activeLaws));
            window.dispatchEvent(new Event("laws-updated"));
            console.log("⚖️ Yasalar güncellendi:", globalData.activeLaws);
          }

          // Global Para Havuzu / Hazine
          if (globalData.treasury !== undefined) {
            localStorage.setItem("rep_treasury", JSON.stringify(globalData.treasury));
            window.dispatchEvent(new Event("treasury-updated"));
          }

          console.log("[GlobalState] ✓ Global veri sinkronize edildi");
        },
        (error) => {
          console.error("[GlobalState] Dinleyici hatası:", error);
        }
      );
    } catch (error) {
      console.error("[GlobalState] Setup hatası:", error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. USER DATA LISTENER - Oyuncu Bakiyesi, Envanteri (Kişiye Özel)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Her oyuncu kendi verilerini dinler:
   * users/{userId}/profile, users/{userId}/inventory, users/{userId}/farms
   * Ceza alırsa, para gelirse = anında ekranda görünür
   */
  async function setupUserDataListener(userId) {
    if (!userId) {
      console.warn("[UserData] userId tanımlanmamış");
      return;
    }

    if (!window._fb || !window._fbReady) {
      console.warn("[UserData] Firebase hazır değil");
      return;
    }

    const db = window._fb.db;
    const gameId = window._gameId;

    try {
      // Firestore: games/{gameId}/users/{userId}
      const userRef = db
        .collection("games")
        .doc(gameId)
        .collection("users")
        .doc(userId);

      // Eski listener'ı kapat
      if (window._userListener && typeof window._userListener === "function") {
        window._userListener();
      }

      // Yeni listener başlat
      window._userListener = userRef.onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            console.log("[UserData] Kullanıcı belgesi yok:", userId);
            return;
          }

          const userData = snapshot.data();

          // Profil (bakiye, level, vs)
          if (userData.profile) {
            localStorage.setItem("rep_userProfile", JSON.stringify(userData.profile));
            window.dispatchEvent(new Event("user-profile-updated"));
            console.log("👤 Profil güncellendi:", userData.profile);
          }

          // Envanter (kaç para, malı vs)
          if (userData.inventory) {
            localStorage.setItem("rep_userInventory", JSON.stringify(userData.inventory));
            window.dispatchEvent(new Event("user-inventory-updated"));
            console.log("🎒 Envanter güncellendi:", userData.inventory);
          }

          // Tarımlar
          if (userData.farms) {
            localStorage.setItem("rep_userFarms", JSON.stringify(userData.farms));
            window.dispatchEvent(new Event("user-farms-updated"));
            console.log("🌾 Tarımlar güncellendi:", userData.farms);
          }

          // Param (para, borç, gelir)
          if (userData.finances) {
            localStorage.setItem("rep_userFinances", JSON.stringify(userData.finances));
            window.dispatchEvent(new Event("user-finances-updated"));
            console.log("💸 Finanslar güncellendi:", userData.finances);
          }

          console.log("[UserData] ✓ Kullanıcı verisi sinkronize edildi");
        },
        (error) => {
          if(error.code !== "permission-denied") console.warn("[UserData] Listener hatası:", error.message);
        }
      );
    } catch (error) {
      console.error("[UserData] Setup hatası:", error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. PRESENCE SYSTEM - Çevrimiçi Oyuncuları Takip Et
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Online/Offline durumunu takip et:
   * - Biri girdi → "Şu an 47 kişi online"
   * - Biri çıktı → "Şu an 46 kişi online"
   * 
   * Firebase RTDB'de: online_players/{userId} = {timestamp, username}
   * Eğer 5 dak mesaj yok → offline kabul et
   */
  function setupPresenceListener() {
    if (!window._fb || !window._rtdb) {
      console.warn("[Presence] Firebase hazır değil");
      return;
    }

    const rtdb = window._fb.rtdb;
    const gameId = window._gameId;
    const userId = window._fbUid;

    try {
      const onlineRef = rtdb.ref("games/" + gameId + "/online_players");

      // Çevrimiçi oyuncuları dinle
      window._presenceListener = onlineRef.on("value", (snapshot) => {
        const playersData = snapshot.val();
        const onlineCount = playersData ? Object.keys(playersData).length : 0;
        const onlineList = playersData ? Object.entries(playersData) : [];

        localStorage.setItem("rep_onlineCount", JSON.stringify(onlineCount));
        localStorage.setItem("rep_onlineList", JSON.stringify(onlineList));

        window.dispatchEvent(
          new CustomEvent("presence-updated", {
            detail: { count: onlineCount, players: onlineList },
          })
        );

        console.log("👥 Çevrimiçi:", onlineCount, "oyuncu");
      });

      // Bu oyuncuyu "online" olarak işaretle
      const myPresence = rtdb.ref(
        "games/" + gameId + "/online_players/" + userId
      );
      myPresence.set(
        {
          username: localStorage.getItem("rep_userProfile")
            ? JSON.parse(localStorage.getItem("rep_userProfile")).username
            : "Anonymous",
          lastSeen: firebase.database.ServerValue.TIMESTAMP,
          status: "active",
        },
        (error) => {
          if (error) {
            console.error("[Presence] Yazma hatası:", error);
          } else {
            console.log("[Presence] ✓ Çevrimiçi olarak işaretlendi");
          }
        }
      );

      // Sayfa kapatılınca "offline" yap (onDisconnect)
      myPresence.onDisconnect().remove((error) => {
        if (error) {
          console.error("[Presence] onDisconnect hatası:", error);
        } else {
          console.log("[Presence] onDisconnect ayarlandı");
        }
      });
    } catch (error) {
      console.error("[Presence] Setup hatası:", error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. OPTIMISTIC UI - Hemen Görüntüle, Sonra Sinkronize
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Oyuncu "Hasat Et" butonuna bastı:
   * 1. UI anında güncelle (paraşı artır, tarlayı boşalt)
   * 2. Arka planda Firebase'e kaydet
   * 3. Başarısızsa, eski duruma geri döndür
   */
  window._optimisticAction = async function (actionName, localData, serverUpdate) {
    try {
      // 1. Yerel state anında güncelle
      Object.entries(localData).forEach(([key, value]) => {
        localStorage.setItem("rep_" + key, JSON.stringify(value));
      });
      window.dispatchEvent(new Event("optimistic-update"));
      console.log("⚡ Optimistic UI:", actionName);

      // 2. Arka planda Firebase'e gönder
      if (serverUpdate && typeof serverUpdate === "function") {
        await serverUpdate();
      }

      return true;
    } catch (error) {
      console.error("[OptimisticUI] Hata:", error);
      // 3. Başarısızsa, rollback (eski veriye geri dön)
      window.dispatchEvent(new Event("optimistic-rollback"));
      return false;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 5. COLLECTION LISTENER - Çoklu Belgeleri Bir Kez Dinle
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Oyuncu listesi, kurumlar, vs gibi collection'ları dinle
   * query.onSnapshot() ile tüm değişiklikleri (add, modify, remove) yakala
   */
  async function setupCollectionListener(
    collectionPath,
    storageKey,
    eventName
  ) {
    if (!window._fb || !window._fbReady) {
      console.warn("[Collection] Firebase hazır değil");
      return;
    }

    const db = window._fb.db;

    try {
      // Pathten collection reference'ı oluştur
      const parts = collectionPath.split("/");
      let ref = db;
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
          ref = ref.collection(parts[i]);
        } else {
          ref = ref.doc(parts[i]);
        }
      }

      ref.onSnapshot((snapshot) => {
        const docs = [];
        snapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });

        localStorage.setItem(storageKey, JSON.stringify(docs));
        window.dispatchEvent(new Event(eventName));

        console.log(
          `[Collection] ${collectionPath} güncellendi:`,
          docs.length,
          "belge"
        );
      });
    } catch (error) {
      console.error("[Collection] Setup hatası:", error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. REFACTORED STATE SYNC (Eski Single-Doc Yerine)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Eski: games/{gameId}/state/main (HERKESE AIT TÜM VERİ = yazma çakışması)
   * Yeni: 
   *   - games/{gameId}/state/global (borsa, vergi, yasalar)
   *   - games/{gameId}/users/{userId} (oyuncu verisi)
   *   - games/{gameId}/farms/{farmId} (tarım verisi)
   *   - games/{gameId}/companies/{companyId} (şirket verisi)
   */

  async function initFullRealtimeSync(userId) {
    console.log("[FullSync] Başlanıyor...");

    // Adım 1: Global veri (borsa, vergi)
    await setupGlobalStateListener();

    // Adım 2: Kendi oyuncu verisi
    await setupUserDataListener(userId);

    // Adım 3: Çevrimiçi oyuncular
    setupPresenceListener();

    // Adım 4: Collections (oyuncu listesi, kurumlar, vs)
    const gameId = window._gameId;
    const db = window._fb.db;

    // Örnek: Oyuncu listesi
    await setupCollectionListener(
      `games/${gameId}/users`,
      "rep_playersList",
      "players-list-updated"
    );

    // Örnek: Tarlalar
    await setupCollectionListener(
      `games/${gameId}/farms`,
      "rep_farmsList",
      "farms-list-updated"
    );

    // Örnek: Kurumlar
    await setupCollectionListener(
      `games/${gameId}/companies`,
      "rep_companiesList",
      "companies-list-updated"
    );

    console.log("[FullSync] ✓ Tüm dinleyiciler aktif");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EXPORT
  // ─────────────────────────────────────────────────────────────────────────

  window._realtimeSync = {
    init: initFullRealtimeSync,
    setupGlobalState: setupGlobalStateListener,
    setupUserData: setupUserDataListener,
    setupPresence: setupPresenceListener,
    setupCollection: setupCollectionListener,
    optimisticAction: window._optimisticAction,
  };

  console.log(
    "[Firebase v7] Real-time sync modülü yüklendi. Çağırın: _realtimeSync.init(userId)"
  );
})();
