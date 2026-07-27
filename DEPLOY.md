# Firebase'e Deploy (Canlıya Alma)

Proje zaten Firebase Hosting için hazır (`firebase.json`, `.firebaserc` mevcut,
proje: `understate-62919`). Aşağıdaki adımları kendi bilgisayarında terminalde çalıştır
(Google hesabı ile interaktif giriş gerektiği için bu adımı benim yerime senin yapman gerekiyor).

## 1. Firebase CLI kurulumu (bir kere yapılır)

```bash
npm install -g firebase-tools
```

## 2. Giriş yap

```bash
firebase login
```

Bu komut tarayıcı açar, `understate-62919` projesine erişimi olan Google hesabınla giriş yap.

## 3. Doğru projeye bağlı olduğunu kontrol et

```bash
firebase projects:list
firebase use understate-62919
```

`.firebaserc` dosyası zaten `understate-62919`'u varsayılan proje olarak ayarlamış durumda,
bu adım sadece teyit içindir.

## 4. Hosting'e deploy et

```bash
npm run firebase:deploy
```

Bu, proje kökündeki her şeyi (`index.html`, `css/`, `js/`, `assets/` vs.) Firebase Hosting'e yükler.
Deploy bitince terminalde şuna benzer bir canlı URL göreceksin:

```
Hosting URL: https://understate-62919.web.app
```

## 5. Database rules'u da deploy et

CSS/JS dosyalarının aksine, `database.rules.json` içeriği ayrı deploy edilir:

```bash
npm run firebase:deploy:rules
```

> ⚠️ Bu adımı, aşağıdaki "Security Rules" bölümünde yaptığımız güncellemeden SONRA çalıştır.

## 6. (Opsiyonel) Özel domain bağlama

Firebase Console → Hosting → "Add custom domain" üzerinden kendi domainini bağlayabilirsin.
DNS ayarlarını Firebase sana adım adım gösterecek.

## Notlar

- `server.js` (Socket.IO sunucusu) Firebase Hosting'in **dışında** ayrı bir yerde
  (Render, Railway, Fly.io, VPS vb.) çalıştırılmalı — Firebase Hosting statik dosya barındırır,
  Node.js/Socket.IO sunucusu çalıştırmaz. Şu an gerçek zamanlı senkronizasyon zaten
  Firebase RTDB üzerinden yürüdüğü için (`firebase-realtime-v7.js`), Socket.IO sadece
  ek/yardımcı bir katman — hosting deploy'u bunu etkilemez.
- Deploy sonrası tarayıcı konsolunda Firebase bağlantı hatası görürsen, Firebase Console →
  Authentication → Settings → "Authorized domains" listesine yeni hosting domainini eklemen gerekebilir.
