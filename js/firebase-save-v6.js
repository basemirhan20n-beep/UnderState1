      window._fbPendingWrites = {};
      window._fbFlushTimer    = null;
      window._fbRtFlushTimer  = null;

      // Realtime veriler → SADECE RTDB (transaction ile — kısa array asla uzunun üzerine yazamaz)
      // Oyun state'i → SADECE Firestore state/main
      window._fbFlush = async function(rtOnly) {
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

        // Oyun state'i → Firestore (3 sn debounce)
        if (!rtOnly && Object.keys(stateData).length > 1) {
          setDoc(doc(db, "games", window._gameId, "state", "main"), stateData, { merge: true })
            .catch(e => console.warn("[Firestore] State yazma hatası:", e.message));
        }

        // Chat/mesajlar → SADECE RTDB
        // Array anahtarlar için TRANSACTION: yeni array eskisinden kısaysa SERVER REDDEDER.
        // Bu 23↔25 gibi multi-client çakışmalarını önler.
        if (Object.keys(rtData).length && rtdb) {
          const baseRef = rtdb.ref("games/" + window._gameId + "/realtime");
          const arrayKeys   = Object.keys(rtData).filter(k => Array.isArray(rtData[k]));
          const nonArrKeys  = Object.keys(rtData).filter(k => !Array.isArray(rtData[k]));

          // Scalar / object değerler → normal update (hızlı)
          if (nonArrKeys.length) {
            const nonArrData = {};
            nonArrKeys.forEach(k => { nonArrData[k] = rtData[k]; });
            baseRef.update(nonArrData)
              .catch(e => console.warn("[RTDB] Scalar yazma hatası:", e.message));
          }

          // Array değerler → transaction (monotonic büyüme garantisi)
          const txPromises = arrayKeys.map(k => {
            const newArr = rtData[k];
            return baseRef.child(k).transaction(
              (current) => {
                if (current === null) return newArr; // İlk yazma
                // RTDB {"0":a,...} → length hesabı
                const currLen = Array.isArray(current)
                  ? current.length
                  : Object.keys(current || {}).length;
                if (newArr.length > currLen) return newArr; // Daha uzun → yaz
                return; // undefined → transaction iptal (daha kısa → yazma)
              },
              null,   // onComplete callback
              false   // applyLocally=false → önce sunucuya sor
            ).catch(e => console.warn("[RTDB] Transaction hatası:", k, e.message));
          });

          Promise.allSettled(txPromises).then(() => {
            if (arrayKeys.length) {
              const names = arrayKeys.join(", ");
              console.log("[RTDB] Yazıldı ✓", names);
            }
          });
        }
      };

      window._fbScheduleFlush = function(key) {
        const isRealtime = key && window._rtKeys && window._rtKeys.includes(key);
        if (isRealtime) {
          if (window._fbRtFlushTimer) clearTimeout(window._fbRtFlushTimer);
          window._fbRtFlushTimer = setTimeout(() => window._fbFlush(true), 150);
        } else {
          if (window._fbFlushTimer) clearTimeout(window._fbFlushTimer);
          window._fbFlushTimer = setTimeout(() => window._fbFlush(false), 3000);
        }
      };
