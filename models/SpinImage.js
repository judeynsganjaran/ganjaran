const mongoose = require('mongoose');

const spinImageSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    imageUrl: { type: String, required: true }, // URL gambar dalam Google Cloud Storage
    originalName: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SpinImage', spinImageSchema);
