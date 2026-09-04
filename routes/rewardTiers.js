const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const RewardTier = require('../models/RewardTier');
const RewardSettings = require('../models/RewardSettings');
const upload = require('../middleware/upload');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');

function removeLocalFile(fileUrl) {
  try {
    if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;
    const filePath = path.join(uploadDir, path.basename(fileUrl));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error('Gagal padam fail lokal:', err.message);
  }
}

// Tahap lalai (default) - guru boleh ubah nama/nilai bintang & upload sticker sendiri kemudian
const DEFAULT_TIERS = [
  { levelNumber: 1, name: 'Tahap 1', minStars: 0 },
  { levelNumber: 2, name: 'Tahap 2', minStars: 4 },
  { levelNumber: 3, name: 'Tahap 3', minStars: 8 },
  { levelNumber: 4, name: 'Tahap 4', minStars: 11 },
  { levelNumber: 5, name: 'Tahap 5', minStars: 14 },
  { levelNumber: 6, name: 'Tahap 6', minStars: 17 },
  { levelNumber: 7, name: 'Tahap 7', minStars: 20 },
  { levelNumber: 8, name: 'Tahap 8', minStars: 23 },
  { levelNumber: 9, name: 'Tahap 9', minStars: 26 },
  { levelNumber: 10, name: 'Tahap 10', minStars: 29 },
  { levelNumber: 11, name: 'Tahap 11', minStars: 32 },
  { levelNumber: 12, name: 'Tahap 12', minStars: 44 }
];

// Dapatkan semua tahap (auto-cipta 12 tahap lalai kali pertama jika kosong)
router.get('/', async (req, res) => {
  try {
    let tiers = await RewardTier.find().sort({ levelNumber: 1 });
    if (tiers.length === 0) {
      tiers = await RewardTier.insertMany(DEFAULT_TIERS);
      tiers = tiers.sort((a, b) => a.levelNumber - b.levelNumber);
    }
    res.json(tiers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Kemaskini satu tahap: nama / nilai bintang / upload sticker PNG
router.put('/:id', upload.single('sticker'), async (req, res) => {
  try {
    const { name, minStars } = req.body;
    const existing = await RewardTier.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Tahap tidak dijumpai' });

    const update = {};
    if (name !== undefined) update.name = name;
    if (minStars !== undefined) update.minStars = Number(minStars);
    if (req.file) {
      update.stickerUrl = `/uploads/${req.file.filename}`;
      removeLocalFile(existing.stickerUrl);
    }

    const tier = await RewardTier.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(tier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== POSTER HADIAH (gambar besar) =====

router.get('/settings/poster', async (req, res) => {
  try {
    let settings = await RewardSettings.findOne();
    if (!settings) settings = await RewardSettings.create({});
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings/poster', upload.single('poster'), async (req, res) => {
  try {
    let settings = await RewardSettings.findOne();
    if (!settings) settings = await RewardSettings.create({});
    if (req.file) {
      removeLocalFile(settings.posterUrl);
      settings.posterUrl = `/uploads/${req.file.filename}`;
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
