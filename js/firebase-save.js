      // S objesi hazır olmadan önce sıkıştırılan yazmaları biriktirir
      window._fbPendingWrites = {};
      window._fbFlushTimer    = null;

      // Firestore'a toplu yazma (3 sn debounce)
      window._fbFlush = function() {
        if (!window._fb || !window._fbReady) return;
        const pending = {...window._fbPendingWrites};
        window._fbPendingWrites = {};
        if (!Object.keys(pending).length) return;

        const { db, doc, setDoc, serverTimestamp } = window._fb;

        // Realtime veriler ayrı koleksiyona
        const rtData    = {};
        const stateData = { _meta: { lastSave: Date.now() } };

        Object.entries(pending).forEach(([k, v]) => {
          if (window._rtKeys && window._rtKeys.includes(k)) {
            rtData[k] = v;
          } else {
            stateData[k] = v;
          }
        });

        if (Object.keys(stateData).length > 1) {
          setDoc(doc(db, "games", window._gameId, "state", "main"), stateData, { merge: true })
            .catch(e => console.warn("[Firebase] State yazma hatası:", e.message));
        }
        if (Object.keys(rtData).length) {
          setDoc(doc(db, "games", window._gameId, "realtime", "shared"), rtData, { merge: true })
            .catch(e => console.warn("[Firebase] Realtime yazma hatası:", e.message));
        }
      };

      window._fbScheduleFlush = function() {
        if (window._fbFlushTimer) clearTimeout(window._fbFlushTimer);
        window._fbFlushTimer = setTimeout(window._fbFlush, 3000);
      };
