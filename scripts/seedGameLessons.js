// Skrip untuk isi MongoDB dengan set pelajaran contoh untuk Game Arab
// (16 perkataan asal). Jalankan: npm run seed:game
require('dotenv').config();
const mongoose = require('mongoose');
const GameLessonSet = require('../models/GameLessonSet');

const seedData = {
  name: 'Alatan Bilik Darjah',
  description: 'Kosa kata Bahasa Arab untuk alatan dan tempat di sekitar sekolah.',
  words: [
    { melayu: 'Penyapu', arab: 'مِكْنَسَة', icon: '🧹' },
    { melayu: 'Tong sampah', arab: 'سَلَّة', icon: '🗑️' },
    { melayu: 'Beg', arab: 'حَقِيبَة', icon: '🎒' },
    { melayu: 'Meja', arab: 'مَكْتَب', icon: '🪑' },
    { melayu: 'Pembaris', arab: 'مِسْطَرَة', icon: '📏' },
    { melayu: 'Pemadam', arab: 'مِمْحَاة', icon: '🧽' },
    { melayu: 'Papan putih', arab: 'سَبُّورَة', icon: '🖊️' },
    { melayu: 'Kerusi', arab: 'كُرْسِيّ', icon: '🪑' },
    { melayu: 'Kertas', arab: 'وَرَقَة', icon: '📄' },
    { melayu: 'Pen', arab: 'قَلَم', icon: '🖊️' },
    { melayu: 'Kelas', arab: 'فَصْل', icon: '🏫' },
    { melayu: 'Tandas', arab: 'مَرْحَاض', icon: '🚻' },
    { melayu: 'Perpustakaan', arab: 'مَكْتَبَة', icon: '📚' },
    { melayu: 'Tempat solat', arab: 'مَكَانُ الصَّلَاة', icon: '🕌' },
    { melayu: 'Padang', arab: 'مَلْعَب', icon: '⚽' },
    { melayu: 'Kantin', arab: 'مَطْعَم', icon: '🍽️' },
  ],
};

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI tiada dalam .env. Sila setkan dahulu.');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await GameLessonSet.findOne({ name: seedData.name });
  if (existing) {
    console.log(`Set pelajaran "${seedData.name}" sudah wujud. Tiada perubahan dibuat.`);
  } else {
    const created = await GameLessonSet.create(seedData);
    console.log(`Berjaya cipta set pelajaran "${created.name}" dengan ${created.words.length} perkataan.`);
  }
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Gagal seed data:', err);
  process.exit(1);
});
