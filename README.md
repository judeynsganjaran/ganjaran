# 🌈 Sistem Ganjaran Bahasa Melayu

Sistem ganjaran interaktif untuk guru prasekolah — Leaderboard bintang + sticker, Kumpulan, Pengurusan Kelas, Spin Wheel & Hadiah.

## ✨ Ciri-ciri
- **Pengurusan Kelas** — cipta/sunting kelas, urus murid (nama + gambar), urus set gambar spin wheel
- **Kumpulan** — gambar kumpulan, ketua kumpulan, senarai ahli + mata masing-masing, mata bonus manual kumpulan
- **Leaderboard** — individu (bintang besar + tahap semasa + sticker unlock) & kumpulan (circle progress)
- **Spin Wheel** — tekan pada gambar untuk spin, animasi rawak gempak + skrin penuh
- **Hadiah** — urus poster hadiah besar & sticker untuk setiap tahap bintang

## 🛠️ Teknologi
- Backend: Node.js + Express
- Database: MongoDB (Atlas) — **semua gambar disimpan terus dalam MongoDB (base64), bukan cakera server**
- Frontend: HTML, CSS (Fredoka/Baloo 2 font), Vanilla JS
- Deploy: Render + GitHub

### 🖼️ Kenapa gambar tak hilang lagi bila redeploy?
Sebelum ini gambar disimpan atas cakera server Render (`public/uploads`), yang bersifat **sementara** — hilang setiap kali server restart/redeploy. Sekarang semua gambar (foto murid, set spin wheel, sticker, poster) **disimpan terus dalam MongoDB** sebagai teks base64. Oleh sebab MongoDB Atlas adalah pangkalan data luaran yang berasingan dari server Render, gambar akan **kekal selamanya** walau berapa kali pun cikgu redeploy atau update code.

> Nota: had saiz setiap gambar ialah 4MB (cukup untuk foto/sticker biasa).

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
4. **Network Access** → tambah `0.0.0.0/0`
5. **Connect** → **Drivers** → salin connection string
6. Tampal dalam `.env` sebagai `MONGODB_URI`

---

## 3️⃣ Push ke GitHub

```bash
git add .
git commit -m "Gambar kekal dalam MongoDB, kumpulan lengkap, papar tahap murid"
git push
```

---

## 4️⃣ Deploy ke Render

1. [render.com](https://render.com) → **New +** → **Web Service**
2. Sambungkan repo GitHub anda
3. **Build Command:** `npm install` | **Start Command:** `npm start`
4. Tambah Environment Variable: `MONGODB_URI`
5. Create Web Service — tunggu deploy (~2-3 minit)

---

## 👨‍👩‍👧‍👦 Cara guna Kumpulan

1. Pilih kelas → **Cipta Kumpulan Baru**
2. Isi nama, upload gambar kumpulan (pilihan), tick ahli-ahli
3. Pilih **Ketua Kumpulan** dari senarai ahli yang di-tick
4. Kad kumpulan akan tunjuk: gambar, ketua (👑), senarai ahli + mata masing-masing, dan **jumlah bintang kumpulan** (mata ahli + mata bonus)
5. Guna butang ➕➖ untuk tambah/kurang **mata bonus** kumpulan secara manual

## 🎁 Cara guna Hadiah & Sticker

1. **Hadiah** → upload poster besar
2. Untuk setiap 12 tahap, tetapkan nama, nilai bintang minimum, dan upload sticker PNG
3. Di **Leaderboard → Individu**, tahap semasa murid dipaparkan, dan sticker unlock automatik bila bintang cukup

## 🎡 Cara guna Spin Wheel

1. **Pengurusan Kelas** → pilih kelas → "Set Gambar Spin Wheel" → upload banyak gambar sekali gus
2. **Spin Wheel** → pilih kelas → tekan terus pada gambar untuk spin
3. Guna butang **Skrin Penuh** untuk paparan lebih besar

## 📁 Struktur Fail

```
project/
├── server.js
├── config/db.js
├── models/          # Class, Student, Group, SpinImage, RewardTier, RewardSettings
├── routes/          # API endpoints
├── middleware/upload.js
└── public/
    ├── index.html / kelas.html / kumpulan.html / leaderboard.html / spin.html / hadiah.html
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
| GET | `/api/groups/class/:classId` | Kumpulan ikut kelas |
| POST/PUT | `/api/groups` `/api/groups/:id` | Cipta/sunting kumpulan (nama, gambar, ahli, ketua) |
| PATCH | `/api/groups/:id/point` | Tambah/kurang mata bonus kumpulan |
| GET | `/api/leaderboard/individu/:classId` | Leaderboard individu |
| GET | `/api/leaderboard/kumpulan/:classId` | Leaderboard kumpulan |
| PATCH | `/api/leaderboard/student/:id/point` | Tambah/kurang bintang murid |
| GET/POST | `/api/spin-images/:classId` | Set gambar spin wheel |
| GET | `/api/reward-tiers` | Senarai 12 tahap bintang & sticker |
| PUT | `/api/reward-tiers/:id` | Kemaskini tahap |
| GET/PUT | `/api/reward-tiers/settings/poster` | Poster hadiah besar |

Selamat mengajar! 🎉📚
