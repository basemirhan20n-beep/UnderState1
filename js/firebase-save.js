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

      // ═══════════════════════════════════════════════════════════════
      // Mesaj ekleme fonksiyonu (Chat collections için)
      // ═══════════════════════════════════════════════════════════════
      window._fbAddMessage = async function(chatType, messageData) {
        if (!window._fb || !window._fbReady) {
          console.warn("[Firebase] Firestore hazır değil");
          return null;
        }

        try {
          const { db, serverTimestamp } = window._fb;
          
          // Chat collection path'ini belirle
          const chatPaths = {
            "globalChat": "messages/globalChat/messages",
            "cityChats": "messages/cityChats/messages",
            "parliamentMsgs": "messages/parliamentMsgs/messages",
            "supportMsgs": "messages/supportMsgs/messages",
            "liveNews": "data/liveNews/items",
            "announcements": "data/announcements/items",
            "activityFeed": "data/activityFeed/items"
          };

          const path = chatPaths[chatType];
          if (!path) {
            console.warn(`[Firebase] Bilinmeyen chat türü: ${chatType}`);
            return null;
          }

          // Path'den collection reference oluştur
          const pathParts = path.split('/');
          let ref = _db;
          for(let i = 0; i < pathParts.length; i++) {
            if (i % 2 === 0) {
              ref = ref.collection(pathParts[i]);
            } else {
              ref = ref.doc(pathParts[i]);
            }
          }

          // Mesaj objesini hazırla
          const message = {
            ...messageData,
            timestamp: serverTimestamp(),
            sender: messageData.sender || window._fbUid,
            createdAt: new Date().toISOString()
          };

          // Firestore'a ekle
          const docRef = await firebase.firestore().collection(path).add(message);
          
          console.log(`[Firebase] Mesaj eklendi (${chatType}):`, docRef.id);
          return { id: docRef.id, ...message };

        } catch(e) {
          console.warn("[Firebase] Mesaj ekleme hatası:", e.message);
          return null;
        }
      };

      // ═══════════════════════════════════════════════════════════════
      // Mesaj silme fonksiyonu
      // ═══════════════════════════════════════════════════════════════
      window._fbDeleteMessage = async function(chatType, messageId) {
        if (!window._fb || !window._fbReady) return false;

        try {
          const chatPaths = {
            "globalChat": "messages/globalChat/messages",
            "cityChats": "messages/cityChats/messages",
            "parliamentMsgs": "messages/parliamentMsgs/messages",
            "supportMsgs": "messages/supportMsgs/messages"
          };

          const path = chatPaths[chatType];
          if (!path) return false;

          await _db.collection(path).doc(messageId).delete();
          console.log(`[Firebase] Mesaj silindi (${chatType}):`, messageId);
          return true;

        } catch(e) {
          console.warn("[Firebase] Mesaj silme hatası:", e.message);
          return false;
        }
      };

      // ═══════════════════════════════════════════════════════════════
      // Mesaj güncelleme fonksiyonu
      // ═══════════════════════════════════════════════════════════════
      window._fbUpdateMessage = async function(chatType, messageId, updates) {
        if (!window._fb || !window._fbReady) return false;

        try {
          const chatPaths = {
            "globalChat": "messages/globalChat/messages",
            "cityChats": "messages/cityChats/messages",
            "parliamentMsgs": "messages/parliamentMsgs/messages",
            "supportMsgs": "messages/supportMsgs/messages"
          };

          const path = chatPaths[chatType];
          if (!path) return false;

          await _db.collection(path).doc(messageId).update({
            ...updates,
            updatedAt: new Date().toISOString()
          });
          
          console.log(`[Firebase] Mesaj güncellendi (${chatType}):`, messageId);
          return true;

        } catch(e) {
          console.warn("[Firebase] Mesaj güncelleme hatası:", e.message);
          return false;
        }
      };
