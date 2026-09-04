const mongoose = require('mongoose');

const rewardTierSchema = new mongoose.Schema(
  {
    levelNumber: { type: Number, required: true }, // Tahap 1, 2, 3 ...
    name: { type: String, default: '' },            // nama tahap (pilihan)
    minStars: { type: Number, required: true },      // bilangan bintang minimum untuk unlock
    stickerUrl: { type: String, default: '' }         // gambar sticker (PNG telus)
  },
  { timestamps: true }
);

module.exports = mongoose.model('RewardTier', rewardTierSchema);
