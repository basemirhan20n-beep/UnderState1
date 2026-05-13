      const FIREBASE_CONFIG = {
        apiKey:            "AIzaSyBOfuPVR5fns4c0EFM9uyO0og0ZvlySAe4",
        authDomain:        "understate-62919.firebaseapp.com",
        projectId:         "understate-62919",
        storageBucket:     "understate-62919.firebasestorage.app",
        messagingSenderId: "1005888565298",
        appId:             "1:1005888565298:android:30da582e4c434e9652cc2b"
      };

      // WebView'da signInAnonymously yerine Firestore'u direkt kullan (auth bypass)
      window._fbAuthBypass = true;

      const GAME_ID     = "understate_main_server";
      const REALTIME_KEYS = ["globalChat","cityChats","parliamentMsgs","supportMsgs","liveNews","announcements","activityFeed"];
      const LOG_KEYS      = ["casinoLogs","activityLog","historyLog","liveFeed","socialPosts","newspapers","randomEvents","scandals","netWorthHistory"];
      const CHAT_COLLECTIONS = {
        globalChat: { path: "messages/globalChat/messages", limit: 50 },
        cityChats: { path: "messages/cityChats/messages", limit: 100 },
        parliamentMsgs: { path: "messages/parliamentMsgs/messages", limit: 50 },
        supportMsgs: { path: "messages/supportMsgs/messages", limit: 50 },
        liveNews: { path: "data/liveNews/items", limit: 30 },
        announcements: { path: "data/announcements/items", limit: 20 },
        activityFeed: { path: "data/activityFeed/items", limit: 100 }
      };

      firebase.initializeApp(FIREBASE_CONFIG);
      const _db   = firebase.firestore();
      const _auth = firebase.auth();

      window._gameId  = GAME_ID;
      window._rtKeys  = REALTIME_KEYS;
      window._logKeys = LOG_KEYS;
      window._fbReady = false;
      window._fbListeners = []; // Listeners'ı takip et

      // Compat API'yi window._fb'ye bağla (S objesiyle uyumlu)
      window._fb = {
        db: _db,
        setDoc: (ref, data, opts) => opts && opts.merge ? ref.set(data, {merge:true}) : ref.set(data),
        getDoc: (ref) => ref.get(),
        doc: (db, ...path) => {
          let ref = db;
          for(let i=0; i<path.length; i++) {
            ref = (i%2===0) ? ref.collection(path[i]) : ref.doc(path[i]);
          }
          return ref;
        },
        onSnapshot: (ref, cb) => ref.onSnapshot(cb),
        serverTimestamp: () => firebase.firestore.FieldValue.serverTimestamp(),
        addDoc: (ref, data) => firebase.firestore().collection(ref._path.segments.join('/')).add(data),
        query: (ref, ...constraints) => {
          let q = ref;
          for(let c of constraints) q = c(q);
          return q;
        },
        orderBy: (field, dir = 'asc') => (q) => q.orderBy(field, dir),
        limit: (n) => (q) => q.limit(n),
        getDocs: (ref) => ref.get()
      };

      async function initFirebaseData() {
        try {
          // WebView'da anonymous auth sorun çıkarıyor — direkt Firestore'a bağlan
          window._fbUid = "webview_" + Math.random().toString(36).substr(2, 9);
          console.log("[Firebase] Firestore bağlanıyor...");

          const gameRef  = _db.collection("games").doc(GAME_ID).collection("state").doc("main");
          const gameSnap = await gameRef.get();

          if (gameSnap.exists) {
            const data = gameSnap.data();
            Object.entries(data).forEach(([k, v]) => {
              if (k === "_meta") return;
              try { localStorage.setItem("rep_" + k, JSON.stringify(v)); } catch(e) {}
            });
            console.log("[Firebase] Veri yüklendi:", Object.keys(data).length, "anahtar");
          } else {
            console.log("[Firebase] İlk başlatma — yerel veri kullanılıyor");
          }

          setupRealtimeListeners();

          window._fbReady = true;
          window.dispatchEvent(new Event("firebase-ready"));

        } catch(e) {
          console.warn("[Firebase] Bağlantı hatası, offline modda devam:", e.message);
          window._fbReady = false;
          window.dispatchEvent(new Event("firebase-ready"));
        }
      }

      function setupRealtimeListeners() {
        // Tüm chat collections'ları dinle
        Object.entries(CHAT_COLLECTIONS).forEach(([key, config]) => {
          try {
            const pathParts = config.path.split('/');
            let ref = _db;
            
            // Path oluştur (collection/doc/collection formatında)
            for(let i = 0; i < pathParts.length; i++) {
              if (i % 2 === 0) {
                ref = ref.collection(pathParts[i]);
              } else {
                ref = ref.doc(pathParts[i]);
              }
            }

            // Listener ekle
            const unsubscribe = ref
              .orderBy("timestamp", "desc")
              .limit(config.limit)
              .onSnapshot((snap) => {
                const items = [];
                snap.forEach((doc) => {
                  items.push({ id: doc.id, ...doc.data() });
                });
                
                // Reverse to show oldest first
                items.reverse();
                
                localStorage.setItem("rep_" + key, JSON.stringify(items));
                window.dispatchEvent(new CustomEvent("fb-sync", { 
                  detail: { key: key, value: items } 
                }));
                
                console.log(`[Firebase] ${key} güncellendi: ${items.length} öğe`);
              }, (error) => {
                console.warn(`[Firebase] ${key} listener hatası:`, error.message);
              });

            // Listener'ı sakla (daha sonra cleanup için)
            window._fbListeners.push(unsubscribe);
            
          } catch(e) {
            console.warn(`[Firebase] ${key} setup hatası:`, e.message);
          }
        });

        // Eski "shared" document listener'ını da tut (geriye uyumluluk için)
        try {
          const rtRef = _db.collection("games").doc(GAME_ID).collection("realtime").doc("shared");
          const unsubscribe = rtRef.onSnapshot((snap) => {
            if (!snap.exists) return;
            const data = snap.data();
            Object.entries(data).forEach(([k, v]) => {
              if (!REALTIME_KEYS.includes(k) || CHAT_COLLECTIONS[k]) return; // Chat'ler zaten dinleniyor
              try {
                const curr     = localStorage.getItem("rep_" + k);
                const incoming = JSON.stringify(v);
                if (curr !== incoming) {
                  localStorage.setItem("rep_" + k, incoming);
                  window.dispatchEvent(new CustomEvent("fb-sync", { detail: { key: k, value: v } }));
                }
              } catch(e) {}
            });
          });
          window._fbListeners.push(unsubscribe);
        } catch(e) {
          console.warn("[Firebase] Shared listener setup hatası:", e.message);
        }
      }

      // Cleanup function
      window._fbCleanup = function() {
        window._fbListeners.forEach(unsub => {
          try { unsub(); } catch(e) {}
        });
        window._fbListeners = [];
        console.log("[Firebase] Tüm listeners temizlendi");
      };

      initFirebaseData();
