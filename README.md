# Büyükşehir Okul Servis Araçları Yönetim Sistemi

![Akıllı Servis Yönetimi](screenshots/banner.png) <!-- Ekran görüntüsü buraya eklenebilir -->

## 📝 Proje Açıklaması
Büyükşehir Okul Servis Araçları Yönetim Sistemi, okul servis araçlarının şoför mobil uygulaması üzerinden GPS konumunun alınmasını, velilerin araçları canlı takip etmesini ve yöneticilerin kapsamlı bir panel üzerinden tüm süreci yönetmesini sağlayan akıllı ve modern bir yazılım çözümüdür.

## ✨ Özellikler

### 1. Yönetici (Admin)
- Öğrenci onaylama, silme ve güncelleme
- Veli, Şoför ve Araç yönetimi
- Servis rota ve durak yönetimi
- Tüm servis araçlarının harita üzerinden canlı takibi
- Detaylı raporlama ve sistem yönetimi paneli

### 2. Şoför
- Güvenli giriş sistemi
- Günlük rotayı ve durakları görüntüleme
- Öğrenci listesi ve biniş/iniş işaretleme
- Otomatik GPS konum paylaşımı (Arka planda belirli aralıklarla)
- Servis başlat/durdur özellikleri

### 3. Veli
- Öğrenci Ekleme: Sisteme çocuklarını ekleme (Okul adı, Okul no ve Fotoğraf ile). Bu kayıtlar Admin onayına düşer.
- Çocuğunun bulunduğu servis aracını harita üzerinden canlı izleme
- Öğrencinin servise biniş ve iniş saatlerini görüntüleme
- Tahmini varış süresi bilgisi (ETA)
- Anlık bildirimler (Firebase Cloud Messaging ile)

---

## 👥 Kullanıcı Rolleri
Sistem temel olarak 3 ana kullanıcı rolünden oluşur. **Tüm kullanıcı rolleri, uygulamanın hem Web (Masaüstü/Mobil tarayıcı) hem de Mobil (App) versiyonlarına giriş yapabilir.** Sistem, giriş yapan kişinin yetkisine göre ilgili ekranları ve özellikleri sunar.

1. **Admin (Yönetici):** Tüm sistem verilerine erişebilir ve yönetimsel işlemleri (veli öğrenci ekleme onayları vb.) gerçekleştirir.
2. **Şoför:** Rota ve öğrenci takiplerini gerçekleştirir, GPS konumu yollar.
3. **Veli:** Sistemden çocuklarını ekler, admin onayından sonra kendi çocuklarının servis canlı konumlarını takip eder.

---

## 💻 Kullanılan Teknolojiler

### Frontend (Tüm Roller İçin Web Platformu)
- **Framework:** Next.js / React
- **Stil & UI:** Tailwind CSS, Shadcn UI (veya MUI)
- **Harita:** Leaflet (OpenStreetMap)

### Mobile (Tüm Roller İçin Mobil Uygulama)
- **Framework:** React Native (Expo)
- **Harita:** MapLibre / React Native Maps (OpenStreetMap)

### Backend (RESTful API & WebSockets)
- **Çalışma Zamanı:** Node.js
- **Framework:** Express.js
- **Dil:** TypeScript
- **Veritabanı ORM:** Prisma
- **Veritabanı:** PostgreSQL
- **Kimlik Doğrulama:** JWT (JSON Web Token)
- **Gerçek Zamanlı İletişim:** Socket.IO
- **Bildirimler:** Firebase Cloud Messaging (FCM)
- **Cache / Message Broker:** Redis (İsteğe bağlı, Docker compose içinde mevcut)

### DevOps & Altyapı
- **Containerization:** Docker & Docker Compose
- **Sürüm Kontrol:** Git & GitHub

---

## 🚀 Kurulum Adımları

Projeyi kendi ortamınızda çalıştırmak için aşağıdaki adımları izleyin.

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/KULLANICI_ADI/akilli-servis.git
cd akilli-servis
```

### 2. Gerekli Paketleri Yükleyin (Root komutu ile)
Kök dizinde bulunan `package.json` sayesinde tüm bağımlılıkları tek bir komutla yükleyebilirsiniz:
```bash
npm run install:all
```

### 3. Çevre Değişkenleri (.env) Örneği
`backend/` klasörü içerisinde `.env` dosyanızı aşağıdaki örneğe göre oluşturun:
```env
# backend/.env örneği
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/akilliservis?schema=public"
JWT_SECRET="super_gizli_jwt_anahtari_buraya"
FIREBASE_SERVER_KEY="firebase_anahtariniz"
```

---

## ⚙️ Çalıştırma Talimatları

### Veritabanını Ayağa Kaldırma (Docker)
Kök dizinde terminal açarak veritabanı (PostgreSQL) ve Redis servislerini başlatın:
```bash
docker-compose up -d
```

### Backend Çalıştırma
```bash
npm run start:backend
# veya
cd backend
npm run dev
```

### Frontend Çalıştırma (Web)
```bash
npm run start:frontend
# veya
cd frontend
npm run dev
```
Frontend varsayılan olarak `http://localhost:3000` adresinde çalışacaktır.

### Mobil Uygulama Çalıştırma (Şoför)
```bash
npm run start:mobile
# veya
cd mobile
npx expo start
```
Expo CLI üzerinden verilen karekodu (QR code) telefonunuzdaki Expo Go uygulaması ile taratarak uygulamayı başlatabilirsiniz.

---

## 📡 API Endpoint Listesi (Özet)

Daha detaylı bilgi için [API_DOCUMENTATION.md](API_DOCUMENTATION.md) dosyasını inceleyebilirsiniz.

| Metot | Endpoint | Açıklama |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Sisteme giriş yapma (Token döner) |
| `GET` | `/api/students` | Tüm öğrencileri getir (Admin) |
| `POST` | `/api/students` | Yeni öğrenci ekle (Admin) |
| `GET` | `/api/routes/:driverId` | Şoförün bugünkü rotasını getir (Şoför) |
| `POST` | `/api/tracking/location` | Canlı GPS konumunu gönder (Şoför) |
| `GET` | `/api/tracking/:routeId` | Canlı araç konumunu dinle (Veli/Admin) |

---

## 📸 Ekran Görüntüleri
*(Bu bölüme projenin bitmiş haline ait arayüz görselleri eklenecektir.)*
- `screenshots/admin_dashboard.png`
- `screenshots/veli_harita.png`
- `screenshots/mobil_sofor.png`

---

## 🤝 Katkıda Bulunma
Bu projeye katkıda bulunmak istiyorsanız lütfen [CONTRIBUTING.md](CONTRIBUTING.md) ve [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) dosyalarını inceleyin. Geliştirmeleriniz için bir "Pull Request" göndermekten çekinmeyin.

## 📄 Lisans
Bu proje **MIT Lisansı** ile lisanslanmıştır. Daha fazla bilgi için [LICENSE](LICENSE) dosyasına göz atabilirsiniz.
