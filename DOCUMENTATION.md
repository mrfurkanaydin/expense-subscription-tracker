# Expense & Subscription Tracker 📊

Kişisel gider ve abonelik takip uygulaması. Go (backend) ve Next.js (frontend) ile geliştirilmiştir.

---

## 📋 İçindekiler

- [Proje Hakkında](#-proje-hakkında)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Proje Yapısı](#-proje-yapısı)
- [Kurulum ve Çalıştırma](#-kurulum-ve-çalıştırma)
- [Mevcut Özellikler](#-mevcut-özellikler)
- [API Endpointleri](#-api-endpointleri)
- [Veritabanı Şeması](#-veritabanı-şeması)
- [Eklenebilecek Özellikler](#-eklenebilecek-özellikler)

---

## 🎯 Proje Hakkında

Bu uygulama, kullanıcıların günlük giderlerini ve periyodik aboneliklerini tek bir yerden takip etmelerini sağlar. Modern ve kullanıcı dostu bir arayüz ile finansal durumunuzu kontrol altında tutabilirsiniz.

### Temel Özellikler
- 💰 Gider ekleme ve listeleme
- 🔄 Abonelik takibi (aylık/yıllık)
- 📊 Dashboard ile genel bakış
- 🔔 Abonelik hatırlatıcıları
- 🎨 Modern ve responsive tasarım

---

## 🛠 Teknoloji Yığını

### Backend
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| Go | 1.25+ | Backend programlama dili |
| PostgreSQL | - | Veritabanı |
| pgx/v5 | v5.7.6 | PostgreSQL driver |
| godotenv | v1.5.1 | Ortam değişkenleri yönetimi |
| Air | - | Hot reload geliştirme aracı |

### Frontend
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| Next.js | 16.0.7 | React framework |
| React | 19.2.0 | UI kütüphanesi |
| TypeScript | 5.x | Tip güvenli JavaScript |
| TailwindCSS | 4.x | CSS framework |
| Framer Motion | 12.23.25 | Animasyon kütüphanesi |
| React Hook Form | 7.68.0 | Form yönetimi |
| Zod | 4.1.13 | Şema validasyonu |
| Lucide React | 0.556.0 | İkon kütüphanesi |

---

## 📁 Proje Yapısı

```
expense-subscription-tracker/
├── .env                      # Ortam değişkenleri
├── .env.example              # Örnek ortam değişkenleri
├── docker-compose.yml        # Docker yapılandırması
├── README.md                 # Proje açıklaması
│
├── backend/                  # Go backend
│   ├── cmd/
│   │   └── api/
│   │       └── main.go       # Uygulama giriş noktası
│   ├── internal/
│   │   ├── db/               # Veritabanı bağlantısı ve migrasyonlar
│   │   │   ├── db.go
│   │   │   └── migrations/   # SQL migration dosyaları
│   │   ├── expenses/         # Gider modülü
│   │   │   ├── handler.go    # HTTP handler
│   │   │   ├── model.go      # Veri modeli
│   │   │   ├── postgres.go   # Repository implementasyonu
│   │   │   └── repository.go # Repository interface
│   │   ├── subscriptions/    # Abonelik modülü
│   │   │   ├── handler.go
│   │   │   ├── model.go
│   │   │   ├── postgres.go
│   │   │   ├── reminder.go   # Hatırlatıcı sistemi
│   │   │   └── repository.go
│   │   ├── users/            # Kullanıcı modülü
│   │   │   ├── handler.go
│   │   │   ├── postgres.go
│   │   │   ├── repository.go
│   │   │   └── user.go
│   │   └── middleware/       # CORS middleware
│   ├── go.mod
│   ├── go.sum
│   └── .air.toml             # Air hot reload yapılandırması
│
└── frontend/                 # Next.js frontend
    ├── app/                  # App Router sayfaları
    │   ├── layout.tsx        # Ana layout
    │   ├── page.tsx          # Dashboard sayfası
    │   ├── expenses/         # Giderler sayfası
    │   └── subscriptions/    # Abonelikler sayfası
    ├── components/           # React bileşenleri
    │   ├── dashboard/        # Dashboard bileşenleri
    │   ├── expenses/         # Gider bileşenleri
    │   ├── subscriptions/    # Abonelik bileşenleri
    │   ├── layout/           # Layout bileşenleri
    │   ├── ui/               # UI bileşenleri (Button, Card, Badge)
    │   └── user/             # Kullanıcı bileşenleri
    ├── contexts/             # React context'leri
    │   └── user-context.tsx  # Kullanıcı state yönetimi
    ├── lib/                  # Yardımcı fonksiyonlar
    │   ├── api.ts            # API çağrıları
    │   ├── types.ts          # TypeScript tipleri
    │   ├── utils.ts          # Yardımcı fonksiyonlar
    │   ├── hooks.ts          # Custom hooks
    │   ├── motion.ts         # Animasyon yapılandırması
    │   └── constants.ts      # Sabitler
    ├── package.json
    └── tsconfig.json
```

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Go 1.25 veya üzeri
- Node.js 18+ ve npm
- PostgreSQL veritabanı

### 1. Depoyu Klonlama

```bash
git clone https://github.com/mrfurkanaydin/expense-subscription-tracker.git
cd expense-subscription-tracker
```

### 2. Ortam Değişkenlerini Ayarlama

Root dizinde `.env` dosyası oluşturun:

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expense_tracker
DB_USER=postgres
DB_PASSWORD=your_password
```

Frontend için (opsiyonel):

```bash
cd frontend
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Veritabanı Kurulumu

PostgreSQL'de veritabanını oluşturun:

```sql
CREATE DATABASE expense_tracker;
```

Migration dosyaları `backend/internal/db/migrations/` dizininde bulunmaktadır. Bunları manuel olarak çalıştırmanız gerekebilir.

### 4. Backend'i Çalıştırma

```bash
cd backend

# Bağımlılıkları indirin
go mod download

# Uygulamayı çalıştırın
go run ./cmd/api

# VEYA Air ile hot reload için
air
```

Backend varsayılan olarak `http://localhost:8080` adresinde çalışır.

### 5. Frontend'i Çalıştırma

```bash
cd frontend

# Bağımlılıkları indirin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Frontend varsayılan olarak `http://localhost:3000` adresinde çalışır.

### Diğer Frontend Komutları

```bash
npm run build          # Production build
npm run start          # Production sunucu
npm run lint           # ESLint kontrolü
npm run lint:fix       # Lint hatalarını düzelt
npm run format         # Prettier ile formatlama
npm run format:check   # Format kontrolü
npm run type-check     # TypeScript tip kontrolü
```

---

## ✨ Mevcut Özellikler

### 👤 Kullanıcı Yönetimi
- E-posta ile kullanıcı oluşturma
- E-posta ile kullanıcı sorgulama
- Oturum state'i (Context API ile)

### 💰 Gider Takibi
- Yeni gider ekleme
- Giderleri kullanıcıya göre listeleme
- Gider detayları:
  - Başlık
  - Tutar
  - Para birimi
  - Kategori
  - Oluşturulma tarihi

### 🔄 Abonelik Takibi
- Yeni abonelik ekleme
- Abonelikleri kullanıcıya göre listeleme
- Abonelik detayları:
  - Başlık
  - Tutar
  - Para birimi
  - Faturalama periyodu (aylık/yıllık)
  - Sonraki fatura tarihi
  - Aktif/Pasif durumu
- Arka planda abonelik hatırlatıcı kontrolü

### 📊 Dashboard
- Toplam gider özeti
- Aktif abonelik sayısı
- Aylık tekrarlayan harcama
- Yıllık toplam harcama
- Son eklenen giderler listesi
- Yaklaşan abonelik ödemeleri

### 🎨 Kullanıcı Arayüzü
- Responsive tasarım (mobil uyumlu)
- Modern gradient ve glassmorphism efektleri
- Framer Motion animasyonları
- Türkçe arayüz

---

## 🔌 API Endpointleri

Base URL: `http://localhost:8080`

### Sağlık Kontrolü

```
GET /health
```

Yanıt:
```json
{"status": "okey"}
```

### Kullanıcılar

#### Kullanıcı Oluştur
```
POST /users
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Kullanıcı Sorgula
```
GET /users?email=user@example.com
```

### Giderler

#### Gider Oluştur
```
POST /expenses
Content-Type: application/json

{
  "user_id": "uuid",
  "title": "Market alışverişi",
  "amount": 250.50,
  "currency": "TRY",
  "category": "Gıda"
}
```

#### Giderleri Listele
```
GET /expenses?user_id=uuid
```

### Abonelikler

#### Abonelik Oluştur
```
POST /subscriptions
Content-Type: application/json

{
  "user_id": "uuid",
  "title": "Netflix",
  "amount": 149.99,
  "currency": "TRY",
  "billing_period": "monthly",
  "next_billing_at": "2025-02-01T00:00:00Z"
}
```

#### Abonelikleri Listele
```
GET /subscriptions?user_id=uuid
```

---

## 🗄 Veritabanı Şeması

### Users Tablosu
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Expenses Tablosu
```sql
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Subscriptions Tablosu
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL,
    billing_period VARCHAR(10) NOT NULL,
    next_billing_at TIMESTAMP WITH TIME ZONE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🚀 Eklenebilecek Özellikler

### 🔐 Güvenlik ve Kimlik Doğrulama

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| JWT Authentication | Token tabanlı kimlik doğrulama | ⭐⭐⭐ Yüksek |
| Şifre ile giriş | E-posta + şifre ile kullanıcı girişi | ⭐⭐⭐ Yüksek |
| OAuth entegrasyonu | Google, GitHub ile giriş | ⭐⭐ Orta |
| İki faktörlü doğrulama (2FA) | Ekstra güvenlik katmanı | ⭐ Düşük |
| Şifre sıfırlama | E-posta ile şifre sıfırlama | ⭐⭐⭐ Yüksek |

### 📊 Raporlama ve Analitik

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Grafik ve çizelgeler | Chart.js veya Recharts ile görselleştirme | ⭐⭐⭐ Yüksek |
| Aylık/yıllık raporlar | Dönemsel harcama raporları | ⭐⭐⭐ Yüksek |
| Kategori bazlı analiz | Hangi kategoriye ne kadar harcandı | ⭐⭐ Orta |
| Bütçe takibi | Aylık bütçe belirleme ve takip | ⭐⭐⭐ Yüksek |
| Harcama trendleri | Zaman içindeki harcama eğilimleri | ⭐⭐ Orta |
| PDF/Excel export | Raporları dışa aktarma | ⭐⭐ Orta |

### 💳 Gider Yönetimi

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Gider düzenleme | Mevcut giderleri güncelleme | ⭐⭐⭐ Yüksek |
| Gider silme | Gider kayıtlarını silme | ⭐⭐⭐ Yüksek |
| Fotoğraf/Fiş ekleme | Harcama belgelerini kaydetme | ⭐⭐ Orta |
| Tekrarlayan giderler | Otomatik gider ekleme | ⭐⭐ Orta |
| Etiketleme sistemi | Giderlere tag ekleme | ⭐ Düşük |
| Çoklu para birimi desteği | Döviz kuru dönüşümü | ⭐⭐ Orta |

### 🔄 Abonelik Yönetimi

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Abonelik düzenleme | Mevcut abonelikleri güncelleme | ⭐⭐⭐ Yüksek |
| Abonelik silme | Abonelik kayıtlarını silme | ⭐⭐⭐ Yüksek |
| Abonelik iptal etme | Durumu pasif yapma | ⭐⭐⭐ Yüksek |
| Otomatik yenileme tarihi | Ödeme yapıldığında tarihi güncelle | ⭐⭐⭐ Yüksek |
| Abonelik kategorileri | Streaming, Yazılım, vb. | ⭐⭐ Orta |
| Deneme süresi takibi | Trial süresini takip etme | ⭐ Düşük |

### 🔔 Bildirimler

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| E-posta bildirimleri | Yaklaşan ödemeler için e-posta | ⭐⭐⭐ Yüksek |
| Push notifications | Tarayıcı bildirimleri | ⭐⭐ Orta |
| Telegram/Discord bot | Anlık mesaj bildirimleri | ⭐ Düşük |
| Özelleştirilebilir hatırlatmalar | Kaç gün önce hatırlat | ⭐⭐ Orta |

### 🎨 Kullanıcı Deneyimi

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Dark/Light mode | Tema değiştirme | ⭐⭐ Orta |
| Dil desteği (i18n) | Çoklu dil desteği | ⭐⭐ Orta |
| PWA desteği | Offline çalışma, ana ekrana ekleme | ⭐⭐ Orta |
| Arama ve filtreleme | Gider/abonelik arama | ⭐⭐⭐ Yüksek |
| Sıralama seçenekleri | Tarihe, tutara göre sıralama | ⭐⭐ Orta |
| Sayfalama (Pagination) | Çok sayıda kayıt için | ⭐⭐ Orta |

### 🔧 Teknik İyileştirmeler

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Unit testler | Backend/Frontend testleri | ⭐⭐⭐ Yüksek |
| Integration testler | API testleri | ⭐⭐ Orta |
| Docker Compose setup | Tam Docker ortamı | ⭐⭐⭐ Yüksek |
| CI/CD pipeline | Otomatik deployment | ⭐⭐ Orta |
| API rate limiting | İstek sınırlandırma | ⭐⭐ Orta |
| Logging sistemi | Yapılandırılmış loglama | ⭐⭐ Orta |
| Migration aracı (golang-migrate) | Veritabanı migration yönetimi | ⭐⭐⭐ Yüksek |
| Swagger/OpenAPI dökümantasyonu | API dökümantasyonu | ⭐⭐ Orta |
| Error handling iyileştirmesi | Daha detaylı hata mesajları | ⭐⭐⭐ Yüksek |

### 📱 Mobil Uygulama

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| React Native app | Mobil uygulama | ⭐ Düşük |
| Expo ile hızlı geliştirme | Cross-platform mobil | ⭐ Düşük |

### 🔗 Entegrasyonlar

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Banka entegrasyonu | Otomatik işlem çekme (Open Banking) | ⭐ Düşük |
| Google Sheets sync | Verileri tabloya aktarma | ⭐ Düşük |
| Notion entegrasyonu | Notion'a veri senkronizasyonu | ⭐ Düşük |

---

## 📌 Hızlı Başlangıç Özeti

```bash
# 1. Depoyu klonla
git clone https://github.com/mrfurkanaydin/expense-subscription-tracker.git
cd expense-subscription-tracker

# 2. .env dosyasını ayarla
cp .env.example .env
# .env dosyasını düzenle

# 3. Backend'i başlat
cd backend
go run ./cmd/api

# 4. Yeni terminal'de frontend'i başlat
cd frontend
npm install
npm run dev

# 5. Tarayıcıda aç
# http://localhost:3000
```

---

## 📄 Lisans

Bu proje özel kullanım içindir.

---

## 👨‍💻 Geliştirici

**Furkan Aydın**
- GitHub: [@mrfurkanaydin](https://github.com/mrfurkanaydin)
