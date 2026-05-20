# UnderState Asset Entegrasyon Kılavuzu

Bu kılavuz, oyununuzdaki emojileri modern minimal SVG icon'larla nasıl değiştireceğinizi adım adım anlatır.

## 🚀 Hızlı Başlangıç

### 1. Asset Klasörünü Kontrol Edin

```bash
UnderState1/
└── assets/
    ├── icons/          # Ana icon'lar
    ├── buttons/        # Buton tasarımları
    └── ui/             # UI elemanları
```

### 2. Icon'ları Önizleyin

`assets/icon-showcase.html` dosyasını tarayıcınızda açın:

```bash
# Dizine gidin
cd UnderState1/assets

# HTML dosyasını tarayıcıda açın
open icon-showcase.html  # macOS
start icon-showcase.html # Windows
xdg-open icon-showcase.html # Linux
```

## 📝 Entegrasyon Adımları

### Adım 1: Icon Component Oluşturun

`src/components/Icon.jsx` dosyası oluşturun:

```jsx
import React from 'react';

const ICON_MAP = {
  money: '/assets/icons/money.svg',
  bank: '/assets/icons/bank.svg',
  government: '/assets/icons/government.svg',
  user: '/assets/icons/user.svg',
  briefcase: '/assets/icons/briefcase.svg',
  settings: '/assets/icons/settings.svg',
  crown: '/assets/icons/crown.svg',
  vote: '/assets/icons/vote.svg',
  law: '/assets/icons/law.svg',
  chart: '/assets/icons/chart.svg',
  weapon: '/assets/icons/weapon.svg',
  map: '/assets/icons/map.svg',
  education: '/assets/icons/education.svg',
  truck: '/assets/icons/truck.svg',
  factory: '/assets/icons/factory.svg',
  
  // İş icon'ları
  'job-trash': '/assets/icons/jobs/trash.svg',
  'job-chef': '/assets/icons/jobs/chef.svg',
  'job-porter': '/assets/icons/jobs/porter.svg',
  'job-warehouse': '/assets/icons/jobs/warehouse.svg',
  'job-miner': '/assets/icons/jobs/miner.svg',
  'job-engineer': '/assets/icons/jobs/engineer.svg',
  'job-doctor': '/assets/icons/jobs/doctor.svg',
  'job-programmer': '/assets/icons/jobs/programmer.svg',
  'job-pilot': '/assets/icons/jobs/pilot.svg',
};

export function Icon({ name, size = 24, className = '', style = {} }) {
  const src = ICON_MAP[name];
  
  if (!src) {
    console.warn(`Icon "${name}" bulunamadı!`);
    return null;
  }
  
  return (
    <img 
      src={src}
      alt={name}
      width={size}
      height={size}
      className={className}
      style={style}
    />
  );
}

export default Icon;
```

### Adım 2: Emoji'leri Değiştirin

#### Örnek 1: Basit Emoji Değişimi

**Öncesi:**
```jsx
<div style={{fontSize:'2rem'}}>💰</div>
```

**Sonrası:**
```jsx
import Icon from './components/Icon';

<Icon name="money" size={32} />
```

#### Örnek 2: İş Listesinde

**Öncesi (app.jsx satır 152-164):**
```jsx
const JOBS = [
  { id:"copcu", name:"Çöpçü", icon:"🗑️", earn:500, time:5, req:null },
  { id:"firinci", name:"Fırıncı", icon:"👨‍🍳", earn:800, time:5, req:null },
  // ...
];
```

**Sonrası:**
```jsx
const JOBS = [
  { id:"copcu", name:"Çöpçü", icon:"job-trash", earn:500, time:5, req:null },
  { id:"firinci", name:"Fırıncı", icon:"job-chef", earn:800, time:5, req:null },
  { id:"hamal", name:"Hamal", icon:"job-porter", earn:1500, time:10, req:null },
  { id:"depo", name:"Depo Görevlisi", icon:"job-warehouse", earn:4000, time:30, req:"C Sınıfı Ehliyet" },
  { id:"madenci", name:"Madenci", icon:"job-miner", earn:16000, time:120, req:null },
  { id:"muhendis", name:"Mühendis", icon:"job-engineer", earn:25000, time:240, req:"Üniversite" },
  { id:"doktor", name:"Doktor", icon:"job-doctor", earn:40000, time:360, req:"Doktora" },
  { id:"yazilimci", name:"Yazılımcı", icon:"job-programmer", earn:30000, time:240, req:"Üniversite" },
  { id:"pilot", name:"Pilot", icon:"job-pilot", earn:60000, time:480, req:"Yüksek Lisans" },
];

// İş kartını render ederken:
function JobCard({ job }) {
  return (
    <div className="job-card">
      <Icon name={job.icon} size={32} />
      <h3>{job.name}</h3>
      <p>Kazanç: {fmtMoney(job.earn)}</p>
    </div>
  );
}
```

#### Örnek 3: Menü Butonları

**Öncesi (app.jsx satır 772):**
```jsx
{ id:'jobs', icon:'💼', label:'İşler', rgb:'16,185,129' }
```

**Sonrası:**
```jsx
{ id:'jobs', icon:'briefcase', label:'İşler', rgb:'16,185,129' }

// Render ederken:
<button>
  <Icon name={item.icon} size={20} />
  <span>{item.label}</span>
</button>
```

### Adım 3: Toplu Değişim İçin Utility

`src/utils/emojiToIcon.js` dosyası oluşturun:

```jsx
export const EMOJI_TO_ICON = {
  '💰': 'money',
  '🏦': 'bank',
  '🏛️': 'government',
  '👤': 'user',
  '💼': 'briefcase',
  '⚙️': 'settings',
  '👑': 'crown',
  '🗳️': 'vote',
  '⚖️': 'law',
  '📊': 'chart',
  '🔫': 'weapon',
  '🗺️': 'map',
  '🎓': 'education',
  '🚛': 'truck',
  '🏭': 'factory',
  '🗑️': 'job-trash',
  '👨‍🍳': 'job-chef',
  '💪': 'job-porter',
  '📦': 'job-warehouse',
  '⛏️': 'job-miner',
  '👷': 'job-engineer',
  '👨‍⚕️': 'job-doctor',
  '💻': 'job-programmer',
  '✈️': 'job-pilot',
};

export function convertEmojiToIcon(emoji) {
  return EMOJI_TO_ICON[emoji] || null;
}

// Kullanım:
const iconName = convertEmojiToIcon('💰'); // 'money'
<Icon name={iconName} size={24} />
```

## 🎨 Buton Tasarımlarını Kullanma

### CSS ile Buton Stilleri

`src/styles/buttons.css` dosyası oluşturun:

```css
.btn-primary {
  background: #D00000;
  border: 2px solid rgba(255, 96, 96, 0.3);
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #FF0000;
  box-shadow: 0 4px 16px rgba(208, 0, 0, 0.5);
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(0, 201, 255, 0.1);
  border: 2px solid #00C9FF;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  color: #00C9FF;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(0, 201, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 201, 255, 0.3);
}

.btn-ghost {
  background: rgba(10, 10, 10, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-ghost:hover {
  background: rgba(30, 30, 30, 0.7);
  border-color: rgba(255, 255, 255, 0.3);
}
```

## 🔧 Gelişmiş Kullanım

### Dinamik Icon Component (Renk Değiştirme)

```jsx
import React from 'react';

export function DynamicIcon({ name, size = 24, color = null }) {
  // SVG'yi inline olarak render et ve rengi değiştir
  const iconSvg = {
    money: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={color || "#10B981"} strokeWidth="2"/>
        <path d="M12 7V17M9 10H13.5C14.328 10 15 10.672 15 11.5C15 12.328 14.328 13 13.5 13H9" 
              stroke={color || "#10B981"} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    // ... diğer icon'lar
  };
  
  return iconSvg[name] || null;
}

// Kullanım:
<DynamicIcon name="money" size={32} color="#FF0000" />
```

### Icon'ları Animasyonlu Kullanma

```css
.icon-animated {
  transition: all 0.3s ease;
}

.icon-animated:hover {
  transform: scale(1.2) rotate(5deg);
}

.icon-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.95); }
}
```

```jsx
<Icon name="money" size={24} className="icon-animated" />
<Icon name="crown" size={32} className="icon-pulse" />
```

## 📋 Kontrol Listesi

- [ ] `Icon` component'i oluşturuldu
- [ ] Tüm emoji kullanımları tespit edildi
- [ ] `JOBS` array'i güncellendi
- [ ] Menü icon'ları değiştirildi
- [ ] Buton stilleri uygulandı
- [ ] Test edildi ve doğrulandı

## ⚠️ Dikkat Edilmesi Gerekenler

1. **Performans:** Çok fazla SVG kullanımı sayfa yükleme süresini artırabilir. Sprite kullanmayı düşünün.
2. **Accessibility:** Her icon için uygun `alt` text'i ekleyin.
3. **Boyutlar:** Icon boyutlarının tutarlı olduğundan emin olun (16px, 20px, 24px, 32px gibi standart boyutlar).
4. **Cache:** SVG'leri tarayıcı cache'inde saklamak için uygun header'ları ayarlayın.

## 🆘 Sorun Giderme

**Sorun:** Icon'lar görünmüyor  
**Çözüm:** Dosya yollarının doğru olduğundan emin olun. Browser console'da 404 hatası var mı kontrol edin.

**Sorun:** Icon'lar çok büyük/küçük  
**Çözüm:** `size` prop'unu ayarlayın veya CSS ile `width` ve `height` belirleyin.

**Sorun:** Icon renkleri değişmiyor  
**Çözüm:** SVG'lerde `fill` ve `stroke` değerleri hardcoded olabilir. Dinamik renk için `DynamicIcon` component'ini kullanın.

---

**Destek için:** Issues açabilir veya dokümantasyonu inceleyebilirsiniz.
