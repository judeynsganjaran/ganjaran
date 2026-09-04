# 🌈 Sistem Ganjaran Bahasa Melayu

Sistem ganjaran interaktif untuk guru prasekolah — Leaderboard bintang + sticker, Kumpulan, Pengurusan Kelas, Spin Wheel, Hadiah & Tetapan Laman.

## ✨ Ciri-ciri
- **Pengurusan Kelas** — Senarai kelas (dengan bilangan murid), urus murid, **urus kumpulan** (cipta/sunting/padam), set gambar spin wheel, tetapan laman (nama & logo), eksport data (Word)
- **Kumpulan** — paparan kedudukan kumpulan (leaderboard), ketua kumpulan automatik di atas senarai ahli, **tambah mata bonus terus di sini (serta-merta)**
- **Leaderboard Murid** — senarai murid dengan bintang besar + tahap semasa + sticker unlock, **carian nama (scroll + kelip automatik)**, tambah/kurang bintang **serta-merta tanpa delay**
- **Spin Wheel** — tekan pada gambar untuk spin, animasi rawak gempak + skrin penuh
- **Hadiah** — urus poster hadiah besar & sticker untuk setiap tahap bintang

## 🛠️ Teknologi
- Backend: Node.js + Express
- Database: MongoDB (Atlas) — semua gambar disimpan terus dalam MongoDB (base64), kekal walau redeploy
- Eksport: pustaka `docx` untuk jana fail Word backup
- Frontend: HTML, CSS (Fredoka / Baloo 2 / Chewy font), Vanilla JS
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
4. **Network Access** → tambah `0.0.0.0/0`
5. **Connect** → **Drivers** → salin connection string
6. Tampal dalam `.env` sebagai `MONGODB_URI`

---

## 3️⃣ Push ke GitHub

```bash
git add .
git commit -m "Urus kumpulan pindah ke Pengurusan Kelas, tetapan laman, eksport Word"
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

## ⚙️ Cara guna Tetapan Laman

1. Pergi **Pengurusan Kelas** → kad **"⚙️ Tetapan Laman"** di bahagian atas
2. Tukar nama laman & upload logo sekolah
3. Klik **Simpan Tetapan** — nama & logo akan terus dipaparkan di navbar SEMUA halaman

## 📄 Cara guna Eksport Data (Backup)

1. Pergi **Pengurusan Kelas** → kad **"📄 Eksport Data (Backup)"**
2. Klik **Eksport Semua Data (Word)** — fail `.docx` akan dimuat turun terus, mengandungi semua kelas, murid, bintang & kumpulan

## 👨‍👩‍👧‍👦 Cara guna Kumpulan

1. **Pengurusan Kelas** → pilih kelas → bahagian **"Urus Kumpulan"**: cipta kumpulan, upload gambar, tick ahli, pilih ketua, sunting/padam
2. Halaman **Kumpulan** (breadcrumb) — papar kedudukan kumpulan (leaderboard), ketua kumpulan automatik di atas senarai ahli, dan boleh **tambah/kurang mata bonus terus di sini** secara serta-merta

## 🎁 Cara guna Hadiah & Sticker

1. **Hadiah** → upload poster besar
2. Untuk setiap 12 tahap, tetapkan nama, nilai bintang minimum, dan upload sticker PNG
3. Di **Leaderboard → Individu**, tahap semasa murid dipaparkan, sticker unlock automatik

## 🎡 Cara guna Spin Wheel

1. **Pengurusan Kelas** → pilih kelas → "Set Gambar Spin Wheel" → upload banyak gambar sekali gus
2. **Spin Wheel** → pilih kelas → tekan terus pada gambar untuk spin
3. Guna butang **Skrin Penuh** untuk paparan lebih besar

## 📁 Struktur Fail

```
project/
├── server.js
├── config/db.js
├── models/          # Class, Student, Group, SpinImage, RewardTier, RewardSettings, SiteSettings
├── routes/          # API endpoints (termasuk exportWord.js)
├── middleware/upload.js
└── public/
    ├── index.html / kelas.html / kumpulan.html / leaderboard.html / spin.html / hadiah.html
    ├── css/style.css
    └── js/          # termasuk site.js (papar nama/logo laman di semua halaman)
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
| GET | `/api/reward-tiers` | 12 tahap bintang & sticker |
| PUT | `/api/reward-tiers/:id` | Kemaskini tahap |
| GET/PUT | `/api/reward-tiers/settings/poster` | Poster hadiah besar |
| GET/PUT | `/api/site-settings` | Nama laman & logo |
| GET | `/api/export/word` | Muat turun backup semua data (.docx) |

Selamat mengajar! 🎉📚
