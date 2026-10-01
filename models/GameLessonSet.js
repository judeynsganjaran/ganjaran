const mongoose = require('mongoose');

// Model untuk ciri "Game Arab" (Cyber Sky Arabic - permainan pengesanan
// tangan untuk kosa kata Bahasa Arab). Diasingkan namanya (GameLessonSet)
// daripada model sedia ada (Class, Student, Group, dll) supaya tidak
// bercampur dengan data Sistem Ganjaran BM, walaupun guna MongoDB yang sama.

// Satu perkataan dalam senarai kosa kata
const GameWordSchema = new mongoose.Schema(
  {
    melayu: { type: String, required: true, trim: true }, // cth: "Penyapu"
    arab: { type: String, required: true, trim: true }, // cth: "مِكْنَسَة"
    icon: { type: String, default: '📦', trim: true }, // emoji/ikon ringkas untuk drone
  },
  { _id: true, timestamps: false }
);

// Satu set/topik pelajaran (cth: "Alatan Bilik Darjah", "Haiwan", "Warna")
const GameLessonSetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    // Tiada had bilangan soalan/perkataan - guru boleh tambah seberapa banyak
    // yang diperlukan untuk satu topik/aktiviti.
    words: {
      type: [GameWordSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GameLessonSet', GameLessonSetSchema);
