# Auth / Şifre Güvenliği — Yapılan Değişiklikler ve Kalan Riskler

## Bu oturumda tamamlanan gerçek Firebase Authentication geçişi

1. **`index.html`**: `window._fbAuth` yardımcı nesnesi eklendi — `signUp`, `signIn`,
   `sendReset`, `changePassword` gerçek Firebase Authentication SDK çağrılarını sarmalıyor.
   Şifreler artık Firebase'in kendi güvenli altyapısında tutuluyor; uygulama hiçbir zaman
   ham/geri döndürülebilir şifre saklamıyor.

2. **`src/app.jsx` → `S.save`**: `"users"` anahtarı Firebase/Supabase/Socket.IO'ya
   senkronize edilmeden önce artık `password` alanı **her zaman** siliniyor. Bu, en kritik
   sızıntı noktasıydı (herkesin indirdiği ortak state içinde şifre hash'lerinin dolaşması) —
   kapatıldı.

3. **`handleRegister`**: Artık önce gerçek bir Firebase Authentication hesabı
   (`createUserWithEmailAndPassword`) oluşturuyor, dönen `uid`'i kullanıcı kaydına ekliyor.
   Yeni hesaplarda hiç `password` alanı saklanmıyor.

4. **`handleLogin`**: Önce gerçek Firebase Authentication ile giriş deniyor. Hesap henüz
   taşınmamışsa (`auth/user-not-found`), eski zayıf hash ile bir kerelik kontrol yapıp
   başarılıysa **sessizce** gerçek bir Firebase hesabı oluşturuyor (migration) ve yerel
   `password` alanını temizliyor. Bir sonraki girişte tamamen Firebase Authentication
   üzerinden ilerliyor.

5. **`changePass`**: Artık Firebase'in `reauthenticateWithCredential` + `updatePassword`
   akışını kullanıyor — eski gibi ham şifre karşılaştırması yapmıyor.

6. **Şifre sıfırlama modalı**: Var olmayan `/api/mail/reset-request` ve
   `/api/mail/reset-confirm` uç noktalarını çağırıyordu (bu özellik hiç çalışmıyordu).
   Artık Firebase'in gerçek, üretime hazır `sendPasswordResetEmail` özelliğini kullanıyor —
   sunucu tarafında hiç kod gerektirmiyor.

7. **`firestore.rules`** eklendi (daha önce hiç yoktu): `request.auth != null` şartı.

## ⚠️ ÇOK ÖNEMLİ — hemen yapılması gereken: admin şifresini değiştir

Önceden kodda **herkesin tarayıcı kaynağından okuyabileceği** sabit bir admin arka kapısı
vardı: kullanıcı adı `admin`, şifre `admin123` yazılırsa doğrudan admin yetkisi veriliyordu
(veritabanı kontrolü bile yapmadan, düz metin karşılaştırma). **Bu arka kapı tamamen
kaldırıldı.**

Ama eğer canlı veritabanınızda daha önce bu akışla oluşturulmuş bir "admin" kullanıcı kaydı
varsa, o kayıt hâlâ `admin123` şifresiyle (legacy hash olarak) durur olabilir — yeni sistemde
bu, normal bir kullanıcı gibi legacy-login yoluyla bir kez daha çalışır ve sizi otomatik
olarak gerçek Firebase hesabına taşır. **`admin123` herkesçe bilinen bir şifre olduğu için,
deploy sonrası admin hesabıyla bir kez giriş yapıp yeni "Şifre Değiştir" özelliğiyle HEMEN
güçlü, benzersiz bir şifreye geçin.**

## Hâlâ kalan yapısal risk (bu oturumda kapsam dışı bırakıldı)

Kullanıcıların diğer verileri (bakiye, envanter, pozisyon, e-posta vb. — şifre hariç) hâlâ
ortak `users` dizisinin içinde, tüm bağlı istemcilere gerçek zamanlı olarak yayılıyor. Bu,
oyunun temel mimarisi (herkesin herkesin genel istatistiklerini görebildiği bir şehir/devlet
simülasyonu) ile kısmen kasıtlı olsa da, e-posta adresi gibi daha hassas alanların da aynı
şekilde herkese açık yayıldığı anlamına geliyor.

Bunu tam çözmek, `users` verisini "herkese açık profil" (kullanıcı adı, seviye, şehir vb.) ve
"özel veri" (e-posta, telefon vb.) olarak iki ayrı yapıya bölmeyi ve özel veriyi
`uid`'e göre kısıtlı ayrı bir koleksiyona taşımayı gerektirir — bu, 28 bin satırlık
`app.jsx` içinde onlarca okuma noktasını etkileyen ayrı, daha büyük bir proje. İstersen
bir sonraki adım olarak bunu planlayabiliriz.
