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
        rtdbSet:         (ref, data) => ref.set(data),
        rtdbUpdate:      (ref, data) => ref.update(data),
        rtdbServerTime:  () => firebase.database.ServerValue.TIMESTAMP
      };

      // ─── ADIM 1: RTDB dinleyicisini hemen kur (Firestore'dan bağımsız) ───
      function setupRTDBListener() {
        const rtdbPath = "games/" + GAME_ID + "/realtime";
        const rtdbRef  = _rtdb.ref(rtdbPath);

        rtdbRef.on("value",
          (snap) => {
            if (!snap.exists()) return;
            const data = snap.val();
            Object.entries(data).forEach(([k, v]) => {
              if (!REALTIME_KEYS.includes(k)) return;
              try {
                const curr     = localStorage.getItem("rep_" + k);
                const incoming = JSON.stringify(v);
                if (curr !== incoming) {
                  localStorage.setItem("rep_" + k, incoming);
                  window.dispatchEvent(new CustomEvent("fb-sync", { detail: { key: k, value: v } }));
                }
              } catch(e) {}
            });
          },
          (err) => {
            console.warn("[RTDB] Dinleyici hatası (" + err.code + ") — Firestore fallback'e geçiyor");
            // RTDB başarısız → Firestore onSnapshot ile devam et
            setupFirestoreFallbackListener();
          }
        );

        console.log("[RTDB] Dinleyici kuruldu ✓ (" + rtdbPath + ")");
      }

      // ─── ADIM 2: RTDB başarısız olursa Firestore fallback ───
      function setupFirestoreFallbackListener() {
        const rtRef = _db.collection("games").doc(GAME_ID).collection("realtime").doc("shared");
        rtRef.onSnapshot(
          (snap) => {
            if (!snap.exists) return;
            const data = snap.data();
            Object.entries(data).forEach(([k, v]) => {
              if (!REALTIME_KEYS.includes(k)) return;
              try {
                const curr     = localStorage.getItem("rep_" + k);
                const incoming = JSON.stringify(v);
                if (curr !== incoming) {
                  localStorage.setItem("rep_" + k, incoming);
                  window.dispatchEvent(new CustomEvent("fb-sync", { detail: { key: k, value: v } }));
                }
              } catch(e) {}
            });
          },
          (err) => {
            console.warn("[Firestore] Fallback da başarısız:", err.message);
          }
        );
        console.log("[Firestore] Fallback dinleyici kuruldu ✓");
      }

      // ─── ADIM 3: Oyun state'ini Firestore'dan yükle (opsiyonel, hata olsa bile devam) ───
      async function loadGameState() {
        try {
          const gameRef  = _db.collection("games").doc(GAME_ID).collection("state").doc("main");
          const gameSnap = await gameRef.get();

          if (gameSnap.exists) {
            const data = gameSnap.data();
            Object.entries(data).forEach(([k, v]) => {
              if (k === "_meta") return;
              try { localStorage.setItem("rep_" + k, JSON.stringify(v)); } catch(e) {}
            });
            console.log("[Firestore] State yüklendi:", Object.keys(data).length, "anahtar");
          } else {
            console.log("[Firestore] Yeni oyun — yerel veri kullanılıyor");
          }
        } catch(e) {
          console.warn("[Firestore] State yüklenemedi (izin hatası?), yerel ile devam:", e.message);
        }
      }

      // ─── ADIM 4: RTDB'den mevcut realtime veriyi bir kez çek ───
      async function loadRealtimeSnapshot() {
        try {
          const snap = await _rtdb.ref("games/" + GAME_ID + "/realtime").get();
          if (snap.exists()) {
            const data = snap.val();
            Object.entries(data).forEach(([k, v]) => {
              if (!REALTIME_KEYS.includes(k)) return;
              try { localStorage.setItem("rep_" + k, JSON.stringify(v)); } catch(e) {}
            });
            console.log("[RTDB] Anlık snapshot yüklendi:", Object.keys(data).length, "anahtar");
          }
        } catch(e) {
          console.warn("[RTDB] Snapshot yüklenemedi:", e.message);
        }
      }

      async function initFirebaseData() {
        window._fbUid = "webview_" + Math.random().toString(36).substr(2, 9);
        console.log("[Firebase] Başlatılıyor...");

        // Dinleyicileri HEMEN kur — Firestore/RTDB hatasından bağımsız
        setupRTDBListener();

        // Mevcut veriyi çek (hata olsa bile devam)
        await Promise.allSettled([
          loadGameState(),
          loadRealtimeSnapshot()
        ]);

        window._fbReady = true;
        window.dispatchEvent(new Event("firebase-ready"));
        console.log("[Firebase] Hazır ✓");
      }

      initFirebaseData();
