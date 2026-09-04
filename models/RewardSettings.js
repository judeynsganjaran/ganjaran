const mongoose = require('mongoose');

const rewardSettingsSchema = new mongoose.Schema(
  {
    posterUrl: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('RewardSettings', rewardSettingsSchema);
