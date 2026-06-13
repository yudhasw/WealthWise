<div align="center">

<img src="frontend/src/assets/logo.png" alt="WealthWise Logo" width="120"/>

# WealthWise

### _Your AI-Powered Personal Finance Manager_

**Kelola keuanganmu lebih cerdas dengan kekuatan Artificial Intelligence**

[![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Groq](https://img.shields.io/badge/Groq_AI-LLaMA-F55036?style=for-the-badge&logo=meta&logoColor=white)](https://groq.com)

<br/>

</div>

---

## Apa itu WealthWise?

**WealthWise** adalah aplikasi manajemen keuangan pribadi berbasis web yang dilengkapi dengan kecerdasan buatan (AI). Tidak sekadar mencatat pemasukan dan pengeluaran — WealthWise menganalisis kondisi keuanganmu, memberikan insight harian, menjawab pertanyaan lewat chatbot AI, hingga **membaca struk belanja secara otomatis** hanya dengan foto.

---

## Fitur Unggulan

| Fitur                      | Deskripsi                                                                                                   | Model AI                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **Receipt Scanner**        | Foto struk belanjamu → AI langsung mengekstrak merchant, nominal, dan tanggal transaksi secara otomatis     | Llama 4 Scout 17B Vision                 |
| **Financial Chatbot**      | Tanya apa saja tentang keuanganmu. Chatbot AI menjawab berdasarkan data finansial riil milikmu              | Llama 3.3-70B Versatile                  |
| **Daily Insights**         | Setiap hari, AI menganalisis profil keuanganmu dan menghasilkan insight & rekomendasi yang diprioritaskan   | Llama 3.3-70B Versatile                  |
| **Financial Health Score** | Skor kesehatan keuangan (0–100) dihitung otomatis berdasarkan saving ratio, expense ratio, dan dana darurat | Algoritma Perhitungan Kesehatan Keuangan |

#### Receipt Scanner

<div align="center">
  <img src="frontend/src/assets/fitur2.png" alt="Tampilan Receipt Scanner WealthWise" width="100%"/>
</div>

```
1. Upload foto struk (jpg/png/webp)  ──►  2. Groq Vision AI menganalisis gambar
                                                         │
3. Transaksi langsung terisi otomatis  ◄──  AI mengekstrak:
   • Nama merchant                              • Nominal (IDR)
   • Nominal                                    • Tanggal
   • Tanggal transaksi                          • Deskripsi pembelian
```

#### Financial Chatbot, Insight and Health Score

<div align="center">
  <img src="frontend/src/assets/fitur1.png" alt="Tampilan Financial Health & AI Chatbot WealthWise" width="100%"/>
</div>

Chatbot WealthWise bukan chatbot generik. Setiap respons dibuat berdasarkan **data keuangan nyata milikmu**:

- Saving Ratio kamu saat ini
- Expense Ratio bulan ini
- Jumlah bulan dana darurat yang tersedia
- Skor Kesehatan Keuangan

---

### Fitur Utama

<details>
<summary><strong>Dashboard</strong></summary>

- Ringkasan total saldo semua akun
- Grafik pemasukan vs pengeluaran
- 5 transaksi terbaru

</details>

<details>
<summary><strong>Manajemen Akun</strong></summary>

- Tambah multiple akun (Bank, E-wallet, Tunai, dll.)
- Pantau saldo per akun secara real-time
- Edit & hapus akun kapan saja

</details>

<details>
<summary><strong>Manajemen Transaksi</strong></summary>

- Catat pemasukan & pengeluaran
- Filter & cari transaksi
- Edit dan hapus riwayat transaksi
- **Scan struk otomatis dengan AI** (fitur OCR)

</details>

<details>
<summary><strong>Kategori dengan Budget</strong></summary>

- Buat kategori kustom (Makan, Transport, Hiburan, dll.)
- Tetapkan batas budget per kategori
- Pantau realisasi budget harian/mingguan/bulanan

</details>

<details>
<summary><strong>Smart Planning — Target Keuangan</strong></summary>

- Buat target tabungan dengan nama & emoji kustom
- Pilih rencana pengisian: **Harian / Mingguan / Bulanan**
- Progress bar visual yang interaktif
- Kalkulasi otomatis nominal per periode
- Tambah/kurangi dana ke goal secara manual

</details>

<details>
<summary><strong>Statistik Visual</strong></summary>

- Grafik batang pemasukan per periode
- Pie chart pengeluaran per kategori
- Filter: Harian, Mingguan, Bulanan, Tahunan

</details>

<details>
<summary><strong>Financial Health</strong></summary>

- **Saving Ratio** (% pendapatan yang ditabung)
- **Expense Ratio** (% pendapatan yang dibelanjakan)
- **Dana Darurat** (berapa bulan pengeluaran yang aman)
- **Skor Kesehatan Keuangan** 0–100
- AI Insights harian yang dipersonalisasi
- Chatbot finansial interaktif

</details>

<details>
<summary><strong>Profil Pengguna</strong></summary>

- Edit nama & informasi profil
- Ganti password secara aman

</details>

<details>
<summary><strong>Autentikasi</strong></summary>

- Register & Login aman (Laravel Sanctum)
- Verifikasi email
- Token-based authentication

</details>

---

## 🛠️ Tech Stack

### Backend

| Teknologi               | Versi | Kegunaan                         |
| ----------------------- | ----- | -------------------------------- |
| **PHP**                 | 8.2   | Runtime bahasa                   |
| **Laravel**             | 12    | Framework backend                |
| **Laravel Sanctum**     | 4.0   | API Authentication (token-based) |
| **SQLite / PostgreSQL** | —     | Database                         |
| **Guzzle HTTP**         | —     | HTTP client untuk Groq API       |

### Frontend

| Teknologi            | Versi | Kegunaan                   |
| -------------------- | ----- | -------------------------- |
| **React**            | 19    | UI Library                 |
| **Vite**             | 8     | Build tool & dev server    |
| **Tailwind CSS**     | v4    | Utility-first styling      |
| **React Router DOM** | v7    | Client-side routing        |
| **Recharts**         | 3.x   | Grafik & visualisasi data  |
| **Lucide React**     | —     | Icon library               |
| **Axios**            | —     | HTTP client ke backend API |

### AI & Intelligence

| Teknologi    | Model                                       | Kegunaan                 |
| ------------ | ------------------------------------------- | ------------------------ |
| **Groq API** | `meta-llama/llama-4-scout-17b-16e-instruct` | Receipt Scanner          |
| **Groq API** | `llama-3.3-70b-versatile`                   | Chatbot & Daily Insights |

### DevOps & Tools

| Teknologi           | Kegunaan                                   |
| ------------------- | ------------------------------------------ |
| **Docker + Apache** | Containerization & deployment              |
| **Composer**        | PHP dependency manager                     |
| **npm / Node.js**   | Frontend dependency manager                |
| **Laravel Pail**    | Real-time log viewer                       |
| **concurrently**    | Jalankan server, queue, dan vite sekaligus |

---

## 🚀 Cara Instalasi

> Pastikan sudah terinstall: **PHP 8.2+**, **Composer**, **Node.js 18+**, dan **Git**

WealthWise adalah monorepo yang terdiri dari dua bagian: `backend/` (Laravel API) dan `frontend/` (React App).

### 1. Clone Repository

```bash
git clone <url-repo> WealthWise
cd WealthWise
```

### 2. Setup Backend (Laravel API)

```bash
cd backend

# Install dependency PHP
composer install

# Salin file environment
cp .env.example .env

# Generate app key
php artisan key:generate

# Buat database SQLite
touch database/database.sqlite

# Jalankan migrasi database
php artisan migrate

# Install dependency Node.js (dibutuhkan untuk asset build Laravel)
npm install
```

### 3. Konfigurasi Environment Backend

Lengkapi variabel berikut di `backend/.env` (lihat detail tiap variabel di bagian "Environment Variables" di bawah):

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=xxxxxxxxxxxxxxxxxxxx
MAIL_PASSWORD=xxxxxxxxxxxxxxxxxxxx
MAIL_FROM_ADDRESS="noreply@wealthwise.com"
MAIL_FROM_NAME="WealthWise"
```

### 4. Setup Frontend (React)

```bash
cd ../frontend

# Install dependency
npm install

# Buat file environment
echo "VITE_API_BASE_URL=http://localhost:8000/api" > .env
```

### 5. Jalankan Aplikasi

**Backend** (Terminal 1):

```bash
cd backend
composer run dev
# Atau manual:
# php artisan serve
```

**Frontend** (Terminal 2):

```bash
cd frontend
npm run dev
```

Akses aplikasi di: **http://localhost:5173**
Backend API berjalan di: **http://localhost:8000/api**

---

### 🐳 Alternatif: Jalankan Backend dengan Docker

```bash
cd backend

# Build dan jalankan container
docker build -t wealthwise-api .
docker run -p 8000:80 \
  -e APP_KEY=base64:xxxx \
  -e GROQ_API_KEY=gsk_xxxx \
  -e DB_CONNECTION=sqlite \
  wealthwise-api
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable            | Contoh Nilai                     | Keterangan                                                                   |
| ------------------- | -------------------------------- | ---------------------------------------------------------------------------- |
| `APP_KEY`           | `base64:...`                     | Digenerate otomatis dengan `artisan key:generate`                            |
| `APP_URL`           | `http://localhost:8000`          | URL backend                                                                  |
| `DB_CONNECTION`     | `sqlite` / `pgsql`               | Driver database                                                              |
| `DATABASE_URL`      | `postgresql://user:pass@host/db` | (Opsional) connection string untuk Postgres (mis. Neon), menggantikan `DB_*` |
| `GROQ_API_KEY`      | `gsk_xxx...`                     | **Wajib** untuk fitur AI (OCR, Chatbot, Insights)                            |
| `MAIL_MAILER`       | `smtp`                           | Driver pengiriman email                                                      |
| `MAIL_HOST`         | `smtp.gmail.com`                 | SMTP host pengirim email (mis. Gmail SMTP atau Brevo)                        |
| `MAIL_PORT`         | `587`                            | SMTP port                                                                    |
| `MAIL_USERNAME`     | `xxxxxxxx`                       | SMTP username                                                                |
| `MAIL_PASSWORD`     | `xxxxxxxx`                       | SMTP password / API key                                                      |
| `MAIL_FROM_ADDRESS` | `noreply@wealthwise.com`         | Alamat pengirim email verifikasi                                             |
| `MAIL_FROM_NAME`    | `WealthWise`                     | Nama pengirim email                                                          |

### Frontend (`frontend/.env`)

| Variable            | Contoh Nilai                | Keterangan                            |
| ------------------- | --------------------------- | ------------------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | Base URL untuk request ke backend API |

---

## 📁 Struktur Proyek

```
WealthWise/
├── backend/
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── VerificationController.php
│   │   │   ├── AccountController.php
│   │   │   ├── TransactionController.php
│   │   │   ├── CategoryController.php
│   │   │   ├── FinancialStatsController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── StatisticsController.php
│   │   │   ├── ReceiptScanController.php
│   │   │   ├── FinancialHealthController.php
│   │   │   ├── FinancialGoalController.php
│   │   │   └── ProfileController.php
│   │   ├── Services/
│   │   │   ├── FinancialHealthService.php
│   │   │   ├── FinancialStatsService.php
│   │   │   └── TransactionService.php
│   │   └── Models/
│   │       ├── User.php
│   │       ├── Account.php
│   │       ├── Transaction.php
│   │       ├── Category.php
│   │       ├── FinancialGoal.php
│   │       └── Insight.php
│   └── routes/api.php
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── landingpage/
        │   ├── auth/
        │   ├── dashboard/
        │   ├── account/
        │   ├── transactions/
        │   ├── categories/
        │   ├── smartplanning/
        │   ├── statistics/
        │   ├── financial-health/
        │   ├── notification/
        │   └── profile/
        └── components/
```

---

## 🔗 API Endpoints Utama

#### Autentikasi

| Method | Endpoint                 | Fitur                                |
| ------ | ------------------------ | ------------------------------------ |
| `POST` | `/api/register`          | Registrasi user baru                 |
| `POST` | `/api/login`             | Login & dapatkan token               |
| `POST` | `/api/logout`            | Logout (hapus token)                 |
| `GET`  | `/api/user`              | Data user yang sedang login          |
| `POST` | `/api/email/verify-code` | Verifikasi email dengan kode 6-digit |
| `POST` | `/api/email/resend-code` | Kirim ulang kode verifikasi          |

#### Akun & Transaksi

| Method           | Endpoint                         | Fitur                           |
| ---------------- | -------------------------------- | ------------------------------- |
| `GET/POST`       | `/api/accounts`                  | List & tambah akun              |
| `GET`            | `/api/accounts/total`            | Total saldo semua akun          |
| `GET/PUT/DELETE` | `/api/accounts/{id}`             | Detail, update, hapus akun      |
| `GET`            | `/api/transactions`              | List transaksi                  |
| `POST`           | `/api/transactions/add`          | Tambah transaksi                |
| `GET/PUT/DELETE` | `/api/transactions/{id}`         | Detail, update, hapus transaksi |
| `POST`           | `/api/transactions/receipt/scan` | scan struk                      |

#### Kategori & Statistik

| Method           | Endpoint               | Fitur                          |
| ---------------- | ---------------------- | ------------------------------ |
| `GET/POST`       | `/api/categories`      | List & tambah kategori         |
| `GET/PUT/DELETE` | `/api/categories/{id}` | Detail, update, hapus kategori |
| `GET`            | `/api/stats/summary`   | Ringkasan statistik keuangan   |
| `GET`            | `/api/dashboard`       | Ringkasan dashboard            |
| `GET`            | `/api/statistics`      | Data statistik & grafik        |

#### AI & Financial Health

| Method | Endpoint                     | Fitur                               |
| ------ | ---------------------------- | ----------------------------------- |
| `GET`  | `/api/financial-health`      | Skor kesehatan + AI Insights harian |
| `POST` | `/api/financial-health/chat` | Chatbot finansial                   |
| `POST` | `/api/receipt/scan`          | OCR — scan struk dengan AI          |

#### Smart Planning & Profil

| Method           | Endpoint                | Fitur                         |
| ---------------- | ----------------------- | ----------------------------- |
| `GET/POST`       | `/api/goals`            | List & tambah target keuangan |
| `GET/PUT/DELETE` | `/api/goals/{id}`       | Detail, update, hapus target  |
| `PUT`            | `/api/goals/{id}/funds` | Tambah/kurangi dana target    |
| `GET/PUT`        | `/api/profile`          | Lihat & update profil         |
| `PUT`            | `/api/profile/password` | Ganti password                |

---

## 👥 Tim Pengembang

> Dibuat sebagai Tugas Besar Mata Kuliah **Aplikasi Berbasis Platform** — Semester 6

| Nama                                  | NIM          |
| ------------------------------------- | ------------ |
| Dhafin Ghiffary                       | 103012300348 |
| Fransiskus Harris Berliandu           | 103012330401 |
| Alif Ihsan                            | 103012330079 |
| Mohammad Narendra Rasendriya Narayana | 103012300209 |
| Syauqi Nurfikri Rahman                | 103012300299 |
| Yudha Setiawan Wicaksono              | 103012300480 |

---

<div align="center">

**WealthWise** — _Cerdas Mengelola, Bijak Merencanakan_ 💚

</div>
