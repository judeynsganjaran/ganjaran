# 🌈 Sistem Ganjaran Bahasa Melayu

Sistem ganjaran interaktif untuk guru prasekolah — Leaderboard bintang + sticker, Kumpulan, Pengurusan Kelas, Spin Wheel & Hadiah.

## ✨ Ciri-ciri
- **Pengurusan Kelas** — cipta/sunting kelas, urus murid (nama + gambar), urus set gambar spin wheel
- **Kumpulan** — bina kumpulan murid ikut kelas
- **Leaderboard** — individu (bintang + sticker unlock) & kumpulan (circle progress)
- **Spin Wheel** — tekan pada gambar untuk spin, animasi rawak gempak + skrin penuh
- **Hadiah** — urus poster hadiah besar & sticker untuk setiap tahap bintang (guru upload sticker sendiri)

## 🛠️ Teknologi
- Backend: Node.js + Express
- Database: MongoDB (Atlas)
- Storan Gambar: Disk server (folder `public/uploads`)
- Upload gambar: Multer
- Frontend: HTML, CSS (Fredoka/Baloo 2 font), Vanilla JS
- Deploy: Render + GitHub

---

## 1️⃣ Setup Tempatan (Local)

```bash
npm install
cp .env.example .env
# edit .env - masukkan MONGODB_URI anda
npm run dev
```

Buka `http://localhost:3000`

---

## 2️⃣ Setup MongoDB Atlas (Percuma)

1. Daftar di [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Cipta **Cluster** percuma (M0)
3. **Database Access** → cipta user + password
4. **Network Access** → tambah `0.0.0.0/0` (benarkan semua IP, untuk Render)
5. **Connect** → **Drivers** → salin connection string
6. Tampal dalam `.env` sebagai `MONGODB_URI`

---

## 3️⃣ Push ke GitHub

```bash
git add .
git commit -m "Update: sticker system, hadiah page, spin wheel baharu"
git push
```

---

## 4️⃣ Deploy ke Render

1. [render.com](https://render.com) → **New +** → **Web Service**
2. Sambungkan repo GitHub anda
3. **Build Command:** `npm install` | **Start Command:** `npm start`
4. Tambah Environment Variable: `MONGODB_URI`
5. Create Web Service — tunggu deploy (~2-3 minit)

### ⚠️ Nota tentang gambar upload (Render Free Tier)
Gambar (foto murid, set spin wheel, sticker, poster) akan **hilang** bila server restart/redeploy (ephemeral disk). Untuk kegunaan harian ia okay — upload semula bila perlu.

---

## 🎁 Cara guna Hadiah & Sticker

1. Pergi **Hadiah** → upload **poster besar** (gambar yang tunjuk semua sticker & tahap)
2. Untuk setiap 12 tahap (kad kecil), tetapkan:
   - **Nama tahap** (contoh: "Tahap 1")
   - **Nilai bintang minimum** (contoh: 0, 4, 8, 11...)
   - **Upload sticker PNG** (guna PNG latar belakang telus supaya kelihatan kemas)
3. Klik **Simpan** pada setiap kad
4. Di **Leaderboard → Individu**, sticker akan **unlock automatik** bila bilangan bintang murid capai nilai minimum tahap tersebut

## ⭐ Cara guna Leaderboard Individu

- Setiap murid ada butang ➕/➖ untuk tambah/kurang bintang
- Grid 12 kotak (6 lajur x 2 baris) tunjuk sticker yang sudah/belum unlock (🔒 = belum capai)

## 🎡 Cara guna Spin Wheel

1. Pergi **Pengurusan Kelas** → pilih kelas → "Set Gambar Spin Wheel" → upload banyak gambar sekali gus
2. Pergi **Spin Wheel** → pilih kelas → **tekan terus pada gambar** untuk mula spin
3. Guna butang **Skrin Penuh** untuk paparan lebih besar semasa mengajar

## 📁 Struktur Fail

```
project/
├── server.js
├── config/db.js
├── models/                # Class, Student, Group, SpinImage, RewardTier, RewardSettings
├── routes/                # API endpoints
├── middleware/upload.js
└── public/
    ├── index.html
    ├── kelas.html
    ├── kumpulan.html
    ├── leaderboard.html
    ├── spin.html
    ├── hadiah.html
    ├── css/style.css
    └── js/
```

## 🔌 API Endpoints Ringkas

| Method | Endpoint | Fungsi |
|---|---|---|
| GET/POST | `/api/classes` | Senarai / cipta kelas |
| PUT/DELETE | `/api/classes/:id` | Sunting / padam kelas |
| GET/POST | `/api/classes/:classId/students` | Murid dalam kelas |
| PUT/DELETE | `/api/classes/students/:id` | Sunting / padam murid |
| GET/POST | `/api/groups` | Kumpulan |
| GET | `/api/leaderboard/individu/:classId` | Leaderboard individu |
| GET | `/api/leaderboard/kumpulan/:classId` | Leaderboard kumpulan |
| PATCH | `/api/leaderboard/student/:id/point` | Tambah/kurang bintang |
| GET | `/api/spin-images/:classId` | Set gambar spin wheel ikut kelas |
| POST | `/api/spin-images/:classId/upload` | Upload banyak gambar sekaligus |
| DELETE | `/api/spin-images/:id` | Padam satu gambar spin |
| GET | `/api/reward-tiers` | Senarai 12 tahap bintang & sticker |
| PUT | `/api/reward-tiers/:id` | Kemaskini tahap (nama/nilai/sticker) |
| GET/PUT | `/api/reward-tiers/settings/poster` | Poster hadiah besar |

Selamat mengajar! 🎉📚
