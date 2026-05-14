      const FIREBASE_CONFIG = {
        apiKey:            "AIzaSyBOfuPVR5fns4c0EFM9uyO0og0ZvlySAe4",
        authDomain:        "understate-62919.firebaseapp.com",
        projectId:         "understate-62919",
        storageBucket:     "understate-62919.firebasestorage.app",
        messagingSenderId: "1005888565298",
        appId:             "1:1005888565298:android:30da582e4c434e9652cc2b",
        databaseURL:       "https://understate-62919-default-rtdb.europe-west1.firebasedatabase.app"
      };

      window._fbAuthBypass = true;

      const GAME_ID       = "understate_main_server";
      const REALTIME_KEYS = ["globalChat","cityChats","parliamentMsgs","supportMsgs","liveNews","announcements","activityFeed"];
      const LOG_KEYS      = ["casinoLogs","activityLog","historyLog","liveFeed","socialPosts","newspapers","randomEvents","scandals","netWorthHistory"];

      firebase.initializeApp(FIREBASE_CONFIG);
      const _db   = firebase.firestore();
      const _rtdb = firebase.database();
      const _auth = firebase.auth();

      window._gameId  = GAME_ID;
      window._rtKeys  = REALTIME_KEYS;
      window._logKeys = LOG_KEYS;
      window._fbReady = false;

      window._fb = {
        db:              _db,
        rtdb:            _rtdb,
        setDoc:          (ref, data, opts) => opts && opts.merge ? ref.set(data, {merge:true}) : ref.set(data),
        getDoc:          (ref) => ref.get(),
        doc: (db, ...path) => {
          let ref = db;
          for (let i = 0; i < path.length; i++) {
            ref = (i % 2 === 0) ? ref.collection(path[i]) : ref.doc(path[i]);
          }
          return ref;
        },
        onSnapshot:      (ref, cb) => ref.onSnapshot(cb),
        serverTimestamp: () => firebase.firestore.FieldValue.serverTimestamp(),
        rtdbRef:         (path) => _rtdb.ref(path),
        rtdbUpdate:      (path, data) => _rtdb.ref(path).update(data),
        rtdbServerTime:  () => firebase.database.ServerValue.TIMESTAMP
      };

      // ─── Firebase RTDB array dönüşümü ───
      // RTDB array'leri {"0":a,"1":b} şeklinde saklar, bunu geri çeviriyoruz
      function rtdbToJS(val) {
        if (val === null || val === undefined) return val;
        if (typeof val !== 'object' || Array.isArray(val)) {
          return Array.isArray(val) ? val.map(rtdbToJS) : val;
        }
        const keys = Object.keys(val);
        if (keys.length === 0) return val;
        const allNumeric = keys.every(k => /^\d+$/.test(k));
        if (allNumeric) {
          const maxIdx = Math.max(...keys.map(Number));
          if (maxIdx === keys.length - 1) {
            return keys.sort((a,b) => Number(a)-Number(b)).map(k => rtdbToJS(val[k]));
          }
        }
        const out = {};
        keys.forEach(k => { out[k] = rtdbToJS(val[k]); });
        return out;
      }

      // ─── Gelen veriyi işle ve React'i güncelle ───
      function applyRealtimeData(rawData, source) {
        Object.entries(rawData).forEach(([k, rawVal]) => {
          if (!REALTIME_KEYS.includes(k)) return;
          try {
            const v        = source === 'rtdb' ? rtdbToJS(rawVal) : rawVal;
            const curr     = localStorage.getItem("rep_" + k);
            const incoming = JSON.stringify(v);
            if (curr !== incoming) {
              localStorage.setItem("rep_" + k, incoming);
              window.dispatchEvent(new CustomEvent("fb-sync", { detail: { key: k, value: v } }));
              console.log("[" + source.toUpperCase() + "] Güncellendi →", k);
            }
          } catch(e) {}
        });
      }

      // ─── 1. RTDB dinleyicisi ───
      function setupRTDBListener() {
        const rtdbRef = _rtdb.ref("games/" + GAME_ID + "/realtime");
        rtdbRef.on("value",
          (snap) => {
            if (!snap.exists()) {
              console.log("[RTDB] Henüz veri yok — Firestore kaynaklı veriler kullanılacak");
              return;
            }
            applyRealtimeData(snap.val(), 'rtdb');
          },
          (err) => {
            console.warn("[RTDB] Bağlantı hatası:", err.code, err.message);
          }
        );
        console.log("[RTDB] Dinleyici aktif ✓");
      }

      // ─── 2. Firestore realtime/shared dinleyicisi (her zaman aktif) ───
      function setupFirestoreRealtimeListener() {
        const rtRef = _db.collection("games").doc(GAME_ID).collection("realtime").doc("shared");
        rtRef.onSnapshot(
          (snap) => {
            if (!snap.exists) return;
            applyRealtimeData(snap.data(), 'firestore');
          },
          (err) => console.warn("[Firestore] Realtime dinleyici hatası:", err.message)
        );
        console.log("[Firestore] Realtime dinleyici aktif ✓");
      }

      // ─── 3. Mevcut chat geçmişini Firestore'dan yükle ───
      async function loadRealtimeFromFirestore() {
        try {
          const snap = await _db
            .collection("games").doc(GAME_ID)
            .collection("realtime").doc("shared").get();
          if (snap.exists) {
            const data = snap.data();
            let count = 0;
            Object.entries(data).forEach(([k, v]) => {
              if (!REALTIME_KEYS.includes(k)) return;
              try {
                localStorage.setItem("rep_" + k, JSON.stringify(v));
                count++;
              } catch(e) {}
            });
            console.log("[Firestore] Chat geçmişi yüklendi:", count, "anahtar");
          } else {
            console.log("[Firestore] Chat geçmişi henüz yok");
          }
        } catch(e) {
          console.warn("[Firestore] Chat yükleme hatası:", e.message);
        }
      }

      // ─── 4. Oyun state'ini Firestore'dan yükle ───
      async function loadGameState() {
        try {
          const snap = await _db
            .collection("games").doc(GAME_ID)
            .collection("state").doc("main").get();
          if (snap.exists) {
            const data = snap.data();
            Object.entries(data).forEach(([k, v]) => {
              if (k === "_meta") return;
              try { localStorage.setItem("rep_" + k, JSON.stringify(v)); } catch(e) {}
            });
            console.log("[Firestore] Oyun state'i yüklendi:", Object.keys(data).length, "anahtar");
          }
        } catch(e) {
          console.warn("[Firestore] State yüklenemedi:", e.message);
        }
      }

      // ─── 5. RTDB bağlantı testi ───
      async function testRTDBWrite() {
        try {
          const testRef = _rtdb.ref("games/" + GAME_ID + "/_ping");
          await testRef.set({ t: Date.now() });
          console.log("[RTDB] Yazma testi ✓ — RTDB tamamen çalışıyor");
          await testRef.remove();
        } catch(e) {
          console.warn("[RTDB] Yazma izni yok:", e.message);
          console.warn("⚠️  Firebase Console → Realtime Database → Kurallar sayfasını kontrol et!");
        }
      }

      async function initFirebaseData() {
        window._fbUid = "webview_" + Math.random().toString(36).substr(2, 9);
        console.log("[Firebase] Başlatılıyor...");

        // Dinleyicileri hemen kur (ikisi de aktif)
        setupRTDBListener();
        setupFirestoreRealtimeListener();

        // Mevcut veriyi yükle (paralel)
        await Promise.allSettled([
          loadGameState(),
          loadRealtimeFromFirestore()
        ]);

        // RTDB write testi (arka planda)
        testRTDBWrite();

        window._fbReady = true;
        window.dispatchEvent(new Event("firebase-ready"));
        console.log("[Firebase] Hazır ✓");
      }

      initFirebaseData();
