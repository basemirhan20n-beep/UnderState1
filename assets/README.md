# UnderState Asset Pack - Modern Minimal

**Tasarım Stili:** Modern Minimal  
**Renk Paleti:** 
- Kırmızı: `#D00000` (Ana renk)
- Mavi: `#00C9FF` (Aksan)
- Yeşil: `#10B981` (Para/Başarı)
- Mor: `#8B5CF6` (Devlet/Siyaset)
- Turuncu: `#F59E0B` (Uyarı/Önemli)

## 📂 Klasör Yapısı

```
assets/
├── icons/                  # Ana icon'lar
│   ├── money.svg          # 💰 Para
│   ├── bank.svg           # 🏦 Banka
│   ├── government.svg     # 🏛️ Devlet/Meclis
│   ├── user.svg           # 👤 Kullanıcı
│   ├── briefcase.svg      # 💼 İş/Portföy
│   ├── settings.svg       # ⚙️ Ayarlar
│   ├── crown.svg          # 👑 Lider/Başkan
│   ├── vote.svg           # 🗳️ Seçim/Oylama
│   ├── law.svg            # ⚖️ Yasa/Kanun
│   ├── chart.svg          # 📊 İstatistik
│   ├── weapon.svg         # 🔫 Silah
│   ├── map.svg            # 🗺️ Bölge/Harita
│   ├── education.svg      # 🎓 Eğitim
│   ├── truck.svg          # 🚛 Lojistik
│   ├── factory.svg        # 🏭 Fabrika
│   └── jobs/              # İş kategorisi icon'ları
│       ├── trash.svg      # 🗑️ Çöpçü
│       ├── chef.svg       # 👨‍🍳 Fırıncı
│       ├── porter.svg     # 💪 Hamal
│       ├── warehouse.svg  # 📦 Depo
│       ├── miner.svg      # ⛏️ Madenci
│       ├── engineer.svg   # 👷 Mühendis
│       ├── doctor.svg     # 👨‍⚕️ Doktor
│       ├── programmer.svg # 💻 Yazılımcı
│       └── pilot.svg      # ✈️ Pilot
├── buttons/               # Buton tasarımları
│   ├── primary-button.svg    # Ana buton (kırmızı)
│   ├── secondary-button.svg  # İkincil buton (mavi)
│   └── ghost-button.svg      # Hayalet buton
└── ui/                    # UI elemanları
    ├── card-background.svg       # Kart arkaplanı
    ├── notification-success.svg  # Başarı bildirimi
    └── notification-error.svg    # Hata bildirimi
```

## 🎨 Kullanım Örnekleri

### React/JSX'de Icon Kullanımı

```jsx
// Doğrudan SVG import
import MoneyIcon from './assets/icons/money.svg';

function EconomyCard() {
  return (
    <div>
      <img src={MoneyIcon} alt="Para" width="24" height="24" />
      <span>₺1.250.000</span>
    </div>
  );
}
```

### CSS ile Background

```css
.primary-button {
  background: url('./assets/buttons/primary-button.svg');
  background-size: cover;
  width: 200px;
  height: 48px;
}
```

### Inline SVG (Dinamik Renk Değişimi)

```jsx
function DynamicIcon({ color = "#D00000" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
      {/* ... diğer path'ler */}
    </svg>
  );
}
```

## 🔄 Emoji Değiştirme Tablosu

| Emoji | SVG Dosya | Açıklama |
|-------|-----------|----------|
| 💰 | `icons/money.svg` | Para, ekonomi |
| 🏦 | `icons/bank.svg` | Banka, finans |
| 🏛️ | `icons/government.svg` | Devlet, meclis |
| 👤 | `icons/user.svg` | Kullanıcı profili |
| 💼 | `icons/briefcase.svg` | İş, portföy |
| ⚙️ | `icons/settings.svg` | Ayarlar |
| 👑 | `icons/crown.svg` | Lider, başkan |
| 🗳️ | `icons/vote.svg` | Seçim, oylama |
| ⚖️ | `icons/law.svg` | Yasa, kanun |
| 📊 | `icons/chart.svg` | İstatistik, grafik |
| 🔫 | `icons/weapon.svg` | Silah |
| 🗺️ | `icons/map.svg` | Bölge, harita |
| 🎓 | `icons/education.svg` | Eğitim |
| 🚛 | `icons/truck.svg` | Lojistik |
| 🏭 | `icons/factory.svg` | Fabrika, üretim |
| 🗑️ | `icons/jobs/trash.svg` | Çöpçü işi |
| 👨‍🍳 | `icons/jobs/chef.svg` | Fırıncı işi |
| 💪 | `icons/jobs/porter.svg` | Hamal işi |
| 📦 | `icons/jobs/warehouse.svg` | Depo görevlisi |
| ⛏️ | `icons/jobs/miner.svg` | Madenci işi |
| 👷 | `icons/jobs/engineer.svg` | Mühendis işi |
| 👨‍⚕️ | `icons/jobs/doctor.svg` | Doktor işi |
| 💻 | `icons/jobs/programmer.svg` | Yazılımcı işi |
| ✈️ | `icons/jobs/pilot.svg` | Pilot işi |

## 🛠️ Özelleştirme

Tüm SVG'ler düz renkler kullanır ve kolayca özelleştirilebilir:

1. **Renk değiştirme:** SVG dosyasını açın, `stroke` ve `fill` değerlerini değiştirin
2. **Boyut ayarlama:** `width` ve `height` attribute'lerini değiştirin
3. **Animasyon ekleme:** CSS veya SMIL animasyonları eklenebilir

## 📝 Lisans

Bu asset'ler UnderState oyunu için özel olarak tasarlanmıştır.

---

**Tasarım Notu:** Modern minimal stil için icon'lar basit geometrik şekillerden oluşturulmuştur. Tüm stroke genişlikleri tutarlı (2px ana, 1.5px detay) ve köşeler yuvarlatılmıştır (stroke-linecap="round").
