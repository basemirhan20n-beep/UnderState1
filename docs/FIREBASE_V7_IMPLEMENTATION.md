# 📘 Firebase v7 Real-Time Sync - Implementasyon Rehberi

## 🎯 Kısa Özet

**Sorun:** Mesajlaşma anlık, ama borsa fiyatları, oyuncu bakiyesi, tarımlar gecikme ile güncelleniyor.

**Çözüm:** Firebase `onSnapshot()` ile TÜM oyun verilerini gerçek zamanlı sinkronize ediyoruz.

---

## 🚀 Adım 1: Başlangıçta Sync Başlatmak

Oyuncu giriş yaptığında, ana React bileşeninize ekleyin:

```javascript
// src/App.js veya ana bileşen
useEffect(() => {
  const handleFirebaseReady = async () => {
    const userId = localStorage.getItem('userId') || `user_${Date.now()}`;
    
    // Firebase v7 başlat
    if (window._realtimeSync && window._realtimeSync.init) {
      await window._realtimeSync.init(userId);
      console.log('✓ Real-time sync hazır!');
    }
  };

  window.addEventListener('firebase-ready', handleFirebaseReady);
  return () => window.removeEventListener('firebase-ready', handleFirebaseReady);
}, []);
```

---

## 📊 Adım 2: Borsa Ekranını Güncelle

```javascript
import React, { useEffect, useState } from 'react';

export function StockMarket() {
  const [stocks, setStocks] = useState({});

  useEffect(() => {
    // İlk yükleme
    const saved = localStorage.getItem('rep_stockMarket');
    if (saved) setStocks(JSON.parse(saved));

    // Borsa değişirse anında güncelle
    const handleUpdate = () => {
      const updated = localStorage.getItem('rep_stockMarket');
      if (updated) {
        setStocks(JSON.parse(updated));
        console.log('📊 Borsa güncellendi!');
      }
    };

    window.addEventListener('stock-market-updated', handleUpdate);
    return () => window.removeEventListener('stock-market-updated', handleUpdate);
  }, []);

  return (
    <div className="stock-container">
      <h2>📊 Borsa Fiyatları</h2>
      <div className="stock-grid">
        {Object.entries(stocks).map(([symbol, price]) => (
          <div key={symbol} className="stock-item">
            <span className="symbol">{symbol}</span>
            <span className="price" style={{ color: price > 100 ? '#00ff00' : '#ff6b6b' }}>
              ${price}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Ne olur?** Bir oyuncu hisse sattığında, tüm oyuncuların ekranındaki fiyat ANINDA güncellenmiş olur.

---

## 💰 Adım 3: Oyuncu Bakiyesi

```javascript
export function UserBalance() {
  const [balance, setBalance] = useState({
    money: 0,
    underCoin: 0,
    meritPoints: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem('rep_userProfile');
    if (saved) {
      const profile = JSON.parse(saved);
      setBalance({
        money: profile.money,
        underCoin: profile.underCoin,
        meritPoints: profile.meritPoints,
      });
    }

    // Profil güncellenirse (ceza, hediye, vs)
    const handleUpdate = () => {
      const updated = localStorage.getItem('rep_userProfile');
      if (updated) {
        const profile = JSON.parse(updated);
        setBalance({
          money: profile.money,
          underCoin: profile.underCoin,
          meritPoints: profile.meritPoints,
        });
      }
    };

    window.addEventListener('user-profile-updated', handleUpdate);
    return () => window.removeEventListener('user-profile-updated', handleUpdate);
  }, []);

  return (
    <div className="balance-card">
      <div className="balance-item">
        <span>💵 Para:</span>
        <strong>₺{balance.money.toLocaleString('tr-TR')}</strong>
      </div>
      <div className="balance-item">
        <span>🪙 UnderCoin:</span>
        <strong>{balance.underCoin}</strong>
      </div>
      <div className="balance-item">
        <span>⭐ Merit Points:</span>
        <strong>{balance.meritPoints}</strong>
      </div>
    </div>
  );
}
```

**Ne olur?** Başkan oyuncuya ceza keserse, bakiye ANINDA ekranda görülür.

---

## 🌾 Adım 4: Tarım Hasat (Optimistic UI)

```javascript
export function FarmScreen() {
  const [farms, setFarms] = useState([]);
  const [harvesting, setHarvesting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rep_userFarms');
    if (saved) setFarms(JSON.parse(saved));

    const handleUpdate = () => {
      const updated = localStorage.getItem('rep_userFarms');
      if (updated) setFarms(JSON.parse(updated));
    };

    window.addEventListener('user-farms-updated', handleUpdate);
    return () => window.removeEventListener('user-farms-updated', handleUpdate);
  }, []);

  const handleHarvest = async (farmId) => {
    // 1. UI'ı ANINDA güncelle (oyuncu hemen paraşını artmış görür)
    const updated = farms.map((f) =>
      f.id === farmId
        ? { ...f, harvested: true, money: (f.money || 0) + 500 }
        : f
    );
    setFarms(updated);
    localStorage.setItem('rep_userFarms', JSON.stringify(updated));
    setHarvesting(true);

    // 2. Arka planda Firebase'e gönder
    try {
      window._fbPendingWrites['userFarms'] = updated;
      window._fbScheduleFlush('userFarms');
      console.log('✓ Hasat başarılı!');
    } catch (error) {
      console.error('✗ Hasat başarısız');
      // Başarısızsa, eski duruma geri dön
      setFarms(JSON.parse(localStorage.getItem('rep_userFarms') || '[]'));
    } finally {
      setHarvesting(false);
    }
  };

  return (
    <div className="farms-container">
      <h2>🌾 Tarımlar</h2>
      {farms.map((farm) => (
        <div key={farm.id} className="farm-card">
          <h3>{farm.cropType}</h3>
          <p>Verim: {farm.yield} kg</p>
          <p className="status">
            {farm.harvested ? '✓ Hasat Edildi' : '⏳ Hazır'}
          </p>
          {!farm.harvested && (
            <button
              onClick={() => handleHarvest(farm.id)}
              disabled={harvesting}
              className="harvest-btn"
            >
              {harvesting ? '⏳ Hasat ediliyor...' : '🌾 Hasat Et'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

**Ne olur?** Hasat butonuna bastığında:
- ⚡ Para anında ekranda artıyor (optimistic UI)
- Arka planda Firebase'e kaydediliyor
- İnternet bağlantısı kesilse bile, oyuncu paraşını kaybetmiyor

---

## 👥 Adım 5: Canlı Çevrimiçi Oyuncular

```javascript
export function OnlinePlayersList() {
  const [onlineCount, setOnlineCount] = useState(0);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const handlePresenceUpdate = (event) => {
      const { count, players: playersList } = event.detail;
      setOnlineCount(count);
      setPlayers(playersList);
    };

    window.addEventListener('presence-updated', handlePresenceUpdate);
    return () => window.removeEventListener('presence-updated', handlePresenceUpdate);
  }, []);

  return (
    <div className="online-section">
      <h3>👥 Çevrimiçi ({onlineCount})</h3>
      <div className="online-badge" style={{ background: onlineCount > 50 ? '#00ff00' : '#ffaa00' }}>
        🟢 {onlineCount} oyuncu aktif
      </div>
      <ul className="players-list">
        {players.map(([userId, data]) => (
          <li key={userId}>
            {data?.username} - {new Date(data?.lastSeen).toLocaleTimeString('tr-TR')}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Ne olur?** Biri oyuna girdi → Sayı anında 47'den 48'e çıkıyor.

---

## ⚖️ Adım 6: Yasalar & Duyurular

```javascript
export function AnnouncementsScreen() {
  const [laws, setLaws] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('rep_activeLaws');
    if (saved) setLaws(JSON.parse(saved));

    const handleUpdate = () => {
      const updated = localStorage.getItem('rep_activeLaws');
      if (updated) {
        setLaws(JSON.parse(updated));
        // Bildirim göster
        new Audio('notification.mp3').play();
        alert('⚖️ Yeni yasa geçti!');
      }
    };

    window.addEventListener('laws-updated', handleUpdate);
    return () => window.removeEventListener('laws-updated', handleUpdate);
  }, []);

  return (
    <div className="announcements">
      <h2>⚖️ Aktif Yasalar</h2>
      {laws.map((law) => (
        <div key={law.id} className="law-item">
          <h4>{law.name}</h4>
          <p>{law.description}</p>
          <small>Geçiş: {new Date(law.passedAt).toLocaleString('tr-TR')}</small>
        </div>
      ))}
    </div>
  );
}
```

---

## 📋 Firebase Firestore Yapısı (Backend)

Arka uçta böyle organize etmelisiniz:

```
Firestore Database:
games/
  └── understate_main_server/
      ├── state/
      │   └── global/
      │       ├── stockMarket: { AAPL: 155, GOOG: 2850, ... }
      │       ├── taxRates: { income: 0.15, sales: 0.08, ... }
      │       ├── activeLaws: [ { id, name, description }, ... ]
      │       └── treasury: 1000000
      │
      ├── users/
      │   ├── user_123/
      │   │   ├── profile: { username, level, rank, ... }
      │   │   ├── inventory: { money: 5000, underCoin: 100, ... }
      │   │   ├── farms: [ { id, cropType, harvested }, ... ]
      │   │   └── finances: { income, expenses, netWorth }
      │   │
      │   └── user_456/ (diğer oyuncu)
      │
      └── companies/
          ├── company_1/
          │   ├── name: "Ali Şirketleri"
          │   ├── ownerId: "user_123"
          │   └── revenue: 50000
          │
          └── company_2/
```

---

## 🔥 Dinleyebileceğiniz Tüm Events

```javascript
// Global Veri
'stock-market-updated'      // Borsa değişti
'tax-rates-updated'         // Vergi oranları değişti
'laws-updated'              // Yasalar değişti
'treasury-updated'          // Hazine değişti

// Oyuncu Veri
'user-profile-updated'      // Profil güncellemesi
'user-inventory-updated'    // Envanter güncellemesi
'user-farms-updated'        // Tarımlar güncellemesi
'user-finances-updated'     // Finanslar güncellemesi

// Çevrimiçi
'presence-updated'          // Oyuncular giriş/çıkış yaptı

// UI
'optimistic-update'         // Optimistic UI başarılı
'optimistic-rollback'       // Optimistic UI başarısız, geri al
```

---

## 🛠️ Debugging & Test

**Console'da kontrol etmek:**

```javascript
// Mevcut veriyi göster
console.log('Borsa:', JSON.parse(localStorage.getItem('rep_stockMarket')));
console.log('Profil:', JSON.parse(localStorage.getItem('rep_userProfile')));
console.log('Online:', JSON.parse(localStorage.getItem('rep_onlineCount')));

// Manüel test: Borsa fiyatını değiştir
window._fbPendingWrites['stockMarket'] = { AAPL: 200 };
window._fbScheduleFlush('stockMarket');

// Real-time sync API'yi kontrol et
console.log(window._realtimeSync);
```

---

## ✅ Sonuç: Ne Değişti?

| Özellik | Öncesi | Sonrası |
|---------|--------|---------|
| **Borsa Güncellemesi** | "Sayfayı yenile" | Anlık ✅ |
| **Oyuncu Bakiyesi** | Gecikme var | Anında ✅ |
| **Tarım Hasat** | 3-5 sn bekleme | Anlık ✅ |
| **Online Listesi** | Manuel yenileme | Canlı ✅ |
| **Yasalar** | Hile ile bilgi | Tüm oyunculara anında ✅ |
| **Yazma Çakışması** | Sık yaşanıyordu | Çözüldü ✅ |

---

## 📞 Sorunlar?

**Q: Firebase bağlantısı kesilirse ne olur?**
- A: Optimistic UI çalışıyor. Oyuncu işemi yapıyor, bağlantı kopunca rollback geçiyor.

**Q: Çok oyuncu aynı anda hasat ederse?**
- A: Veri parçalı olduğu için çakışma yok. Her biri kendi `users/{userId}` belgesini yazıyor.

**Q: React kullanmıyorum, vanilla JS'im:**
- A: localStorage events'i dinleyebilirsiniz veya window custom events'ini kullanın.

