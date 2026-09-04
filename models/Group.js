const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    leaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
    photo: { type: String, default: '' },       // gambar kumpulan (base64 data URI)
    bonusPoints: { type: Number, default: 0 },   // mata tambahan manual untuk kumpulan
    color: { type: String, default: '#5CC8FF' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);
