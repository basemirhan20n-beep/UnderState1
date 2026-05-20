      window._fbPendingWrites = {};
      window._fbFlushTimer    = null;
      window._fbRtFlushTimer  = null;

      // Realtime veriler → RTDB + Firestore realtime/shared (ikisi birden)
      // Oyun state'i → Firestore state/main
      window._fbFlush = function(rtOnly) {
        if (!window._fb || !window._fbReady) return;
        const pending = {...window._fbPendingWrites};
        if (!rtOnly) window._fbPendingWrites = {};

        const { db, rtdb, doc, setDoc } = window._fb;

        const rtData    = {};
        const stateData = { _meta: { lastSave: Date.now() } };

        Object.entries(pending).forEach(([k, v]) => {
          if (window._rtKeys && window._rtKeys.includes(k)) {
            rtData[k] = v;
          } else if (!rtOnly) {
            stateData[k] = v;
          }
        });

        if (!rtOnly && Object.keys(stateData).length > 1) {
          setDoc(doc(db, "games", window._gameId, "state", "main"), stateData, { merge: true })
            .catch(e => console.warn("[Firestore] State yazma hatası:", e.message));
        }

        if (Object.keys(rtData).length) {
          // 1. RTDB'ye yaz (anlık, hızlı)
          if (rtdb) {
            rtdb.ref("games/" + window._gameId + "/realtime")
              .update(rtData)
              .then(() => console.log("[RTDB] Yazıldı ✓", Object.keys(rtData).join(", ")))
              .catch(e => console.warn("[RTDB] Yazma hatası:", e.message));
          }

          // 2. Firestore realtime/shared'e de yaz (yedek + eski istemciler için)
          setDoc(
            doc(db, "games", window._gameId, "realtime", "shared"),
            rtData,
            { merge: true }
          ).catch(e => console.warn("[Firestore] Realtime yazma hatası:", e.message));
        }
      };

      window._fbScheduleFlush = function(key) {
        const isRealtime = key && window._rtKeys && window._rtKeys.includes(key);

        if (isRealtime) {
          // Chat/mesaj: 150ms içinde gönder
          if (window._fbRtFlushTimer) clearTimeout(window._fbRtFlushTimer);
          window._fbRtFlushTimer = setTimeout(() => window._fbFlush(true), 150);
        } else {
          // Oyun state'i: 3 sn debounce
          if (window._fbFlushTimer) clearTimeout(window._fbFlushTimer);
          window._fbFlushTimer = setTimeout(() => window._fbFlush(false), 3000);
        }
      };
