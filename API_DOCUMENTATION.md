# API Dokümantasyonu

Bu doküman, "Akıllı Servis Yönetim Sistemi" projesinin RESTful API uç noktalarını (endpoints) ve WebSockets olaylarını açıklamaktadır. 

## Base URL
Tüm istekler aşağıdaki temel URL üzerinden yapılmalıdır:
`http://localhost:5000/api`

## Kimlik Doğrulama (Authentication)
Projeye erişim için JWT (JSON Web Token) kullanılmaktadır. Token'i almak için `/auth/login` isteği atılmalı ve sonrasında diğer isteklere `Authorization` header'ında "Bearer" olarak eklenmelidir.

```json
{
  "Authorization": "Bearer <sizin_jwt_tokeniniz>"
}
```

---

## REST Endpoints

### 1. Kimlik Doğrulama (`/auth`)
- `POST /auth/login`
  - **Body:** `{ "email": "admin@example.com", "password": "123" }`
  - **Response:** `{ "token": "ey...", "user": { "role": "admin", ... } }`

### 2. Öğrenci Yönetimi (`/students`)
- `GET /students` - Tüm öğrencileri getir (Admin).
- `PUT /students/:id/approve` - Velinin eklediği öğrenciyi onayla (Admin).
- `PUT /students/:id` - Öğrenci bilgilerini güncelle (Admin).
- `DELETE /students/:id` - Öğrenci sil (Admin).

### 3. Veli İşlemleri (`/parents`)
- `GET /parents` - Velileri listele (Admin).
- `GET /parents/:id/students` - Belirli bir veliye bağlı öğrencileri listele (Admin/Veli).
- `POST /parents/students` - Veli tarafından sisteme yeni öğrenci ekleme talebi gönder (Onay gerektirir).
  - **Body:** `{ "name": "Ali Yılmaz", "schoolName": "Atatürk İlkokulu", "schoolNumber": "1234", "photoUrl": "https..." }`

### 4. Şoför & Rota (`/driver`) - Şoför & Admin
- `GET /driver/route` - Şoförün kendi günlük rotasını ve duraklarını getirir.
- `POST /driver/board` - Öğrencinin servise bindiğini kaydeder.
  - **Body:** `{ "studentId": 123, "status": "boarded" }`

---

## WebSockets (Gerçek Zamanlı İletişim - Socket.IO)

Sistem gerçek zamanlı konum ve bildirim akışı için **Socket.IO** kullanmaktadır.

**Bağlantı URL'i:** `ws://localhost:5000`

### Olaylar (Events)

- **`updateLocation` (Şoför gönderir)**
  - Şoför mobil uygulaması, belirli aralıklarla mevcut GPS bilgisini backend'e gönderir.
  - *Payload:* `{ "routeId": 10, "lat": 41.0082, "lng": 28.9784, "timestamp": "2026-05-16T10:00:00Z" }`

- **`trackLocation` (Veli/Admin dinler)**
  - Veliler veya yöneticiler ilgili rota ID'sine abone olarak aracı canlı haritada izler.
  - *Payload:* `{ "lat": 41.0082, "lng": 28.9784 }`

- **`notification` (Herkes dinler)**
  - Önemli olaylarda (örneğin "Araç durağa yaklaşıyor", "Öğrenci araca bindi") tetiklenen olaydır.
