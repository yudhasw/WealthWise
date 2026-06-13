<div align="center">

# 💰 WealthWise — Backend API

### _Laravel REST API untuk WealthWise (AI-Powered Personal Finance Manager)_

[![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![Groq](https://img.shields.io/badge/Groq_AI-LLaMA-F55036?style=for-the-badge&logo=meta&logoColor=white)](https://groq.com)

</div>

---

## 🛠️ Tech Stack

| Teknologi               | Versi | Kegunaan                          |
| ------------------------ | ----- | ---------------------------------- |
| **PHP**                  | 8.2   | Runtime bahasa                     |
| **Laravel**               | 12    | Framework backend                  |
| **Laravel Sanctum**       | 4.0   | API Authentication (token-based)   |
| **SQLite / PostgreSQL**   | —     | Database                           |
| **Guzzle HTTP**           | —     | HTTP client untuk Groq API         |
| **L5-Swagger**            | —     | Dokumentasi API (OpenAPI)          |
| **Groq API**              | —     | OCR, Chatbot & Daily Insights AI   |

---

## 🚀 Cara Instalasi

> Pastikan sudah terinstall: **PHP 8.2+**, **Composer**, **Node.js 18+**, dan **Git**

### 1. Clone Repository

```bash
git clone <url-repo> WealthWise
cd WealthWise/backend
```

### 2. Install Dependency

```bash
composer install
npm install
```

### 3. Konfigurasi Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit file `.env` dan isi variabel berikut sesuai kebutuhan (lihat tabel di bawah).

### 4. Setup Database

```bash
# Buat file database SQLite (jika menggunakan SQLite)
touch database/database.sqlite

# Jalankan migrasi
php artisan migrate
```

### 5. Jalankan Server

```bash
composer run dev
```

Command di atas menjalankan `php artisan serve`, queue listener, log viewer (`pail`), dan `npm run dev` secara bersamaan.

Atau jalankan manual:

```bash
php artisan serve
```

API akan berjalan di: **http://localhost:8000/api**

---

## ⚙️ Environment Variables Penting

| Variable        | Contoh Nilai             | Keterangan                                          |
| ---------------- | ------------------------- | ----------------------------------------------------- |
| `APP_KEY`         | `base64:...`               | Digenerate otomatis dengan `php artisan key:generate` |
| `APP_URL`         | `http://localhost:8000`    | URL backend                                            |
| `DB_CONNECTION`   | `sqlite`                    | Driver database (`sqlite` atau `pgsql`)                |
| `GROQ_API_KEY`    | `gsk_xxx...`                | **Wajib** untuk fitur AI (OCR, Chatbot, Insights)      |
| `MAIL_*`          | —                           | Konfigurasi SMTP untuk verifikasi email                |
| `L5_SWAGGER_CONST_HOST` | `http://localhost:8000` | Host yang digunakan dokumentasi API                    |

> 🔑 Dapatkan Groq API Key gratis di [console.groq.com](https://console.groq.com)

---

## 📖 Dokumentasi API

Setelah server berjalan, dokumentasi API (Swagger/OpenAPI) dapat diakses di:

```
http://localhost:8000/api/documentation
```

Untuk regenerate dokumentasi setelah menambah/mengubah anotasi:

```bash
php artisan l5-swagger:generate
```

---

## 🧪 Testing

```bash
composer test
```

---

## 🐳 Alternatif: Jalankan dengan Docker

```bash
docker build -t wealthwise-api .
docker run -p 8000:80 \
  -e APP_KEY=base64:xxxx \
  -e GROQ_API_KEY=gsk_xxxx \
  -e DB_CONNECTION=sqlite \
  wealthwise-api
```
