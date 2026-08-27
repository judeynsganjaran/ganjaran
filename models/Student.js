const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    photo: { type: String, default: '' },  // gambar murid (pengurusan kelas)
    points: { type: Number, default: 0 }   // jumlah bintang = jumlah point
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
