const mongoose = require('mongoose');

const spinImageSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    imageUrl: { type: String, required: true },
    originalName: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SpinImage', spinImageSchema);
