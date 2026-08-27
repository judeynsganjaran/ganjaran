# 🌈 Sistem Ganjaran Bahasa Melayu

Sistem ganjaran interaktif untuk guru prasekolah — Leaderboard bintang, Kumpulan, Pengurusan Kelas & Spin Wheel dengan animasi gempak!

## ✨ Ciri-ciri
- **Pengurusan Kelas** — cipta/sunting kelas, urus murid (nama + gambar)
- **Kumpulan** — bina kumpulan murid ikut kelas
- **Leaderboard** — individu (progress bar + bintang bertingkat) & kumpulan (circle progress)
- **Spin Wheel** — upload set gambar landscape (bulk) ikut kelas, animasi rawak gempak (bunyi kling, zoom, confetti, emoji celebrasi)

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
5. **Connect** → **Drivers** → salin connection string, contoh:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/sistem_ganjaran?retryWrites=true&w=majority
   ```
6. Tampal dalam `.env` sebagai `MONGODB_URI`

---

## 3️⃣ Push ke GitHub

```bash
git init
git add .
git commit -m "Sistem Ganjaran BM - initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

> ⚠️ Fail `.env` **tidak** akan di-push (sudah dalam `.gitignore`) — ini penting untuk keselamatan.

---

## 4️⃣ Deploy ke Render

1. Daftar/log masuk di [render.com](https://render.com)
2. **New +** → **Web Service**
3. Sambungkan repo GitHub anda
4. Tetapan:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Tambah **Environment Variable**:
   - Key: `MONGODB_URI`
   - Value: (connection string Atlas anda)
6. Klik **Create Web Service** — tunggu deploy siap (~2-3 minit)
7. Laman anda akan hidup di `https://nama-app-anda.onrender.com`

### ⚠️ Nota penting tentang gambar upload (Render Free Tier)
Render free tier menggunakan **ephemeral disk** — fail yang diupload (`public/uploads`) akan **hilang** bila server restart/redeploy. Untuk kegunaan harian di kelas ia berfungsi baik — cuma gambar (foto murid & set gambar spin wheel) perlu diupload semula selepas setiap redeploy/restart server.

> 💡 Kalau nanti cikgu nak selesaikan ini secara kekal (gambar tak hilang langsung), boleh tanya semula — ada penyelesaian guna storan awan yang lebih mudah setup.

---

## 📁 Struktur Fail

```
project/
├── server.js              # Entry point Express
├── config/db.js           # Sambungan MongoDB
├── models/                # Schema Mongoose (Class, Student, Group, SpinImage)
├── routes/                # API endpoints
├── middleware/upload.js   # Multer upload gambar (disk storage)
└── public/
    ├── index.html          # Dashboard utama
    ├── kelas.html          # Pengurusan Kelas
    ├── kumpulan.html       # Kumpulan
    ├── leaderboard.html    # Leaderboard
    ├── spin.html           # Spin Wheel
    ├── css/style.css       # Tema ceria prasekolah
    ├── uploads/            # Gambar yang diupload (sementara, Render free tier)
    └── js/                 # Logik setiap halaman
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
| GET | `/api/spin-images/:classId` | Senarai set gambar spin wheel ikut kelas |
| POST | `/api/spin-images/:classId/upload` | Upload BANYAK gambar sekaligus (bulk) |
| DELETE | `/api/spin-images/:id` | Padam satu gambar spin |
| DELETE | `/api/spin-images/class/:classId/clear` | Kosongkan semua gambar spin kelas |

## 🎡 Cara guna Spin Wheel

1. Pergi **Pengurusan Kelas** → pilih kelas → scroll ke bahagian **"Set Gambar Spin Wheel"**
2. Klik **Upload Gambar** → pilih banyak fail gambar sekali gus (gambar landscape yang dah ada muka & nama murid tertulis)
3. Pergi ke **Spin Wheel** → pilih kelas → tekan **Mula Spin!**
4. Sistem akan pilih SATU gambar secara rawak dari set yang diupload tadi, dengan animasi kocok + bunyi + confetti

Selamat mengajar! 🎉📚
