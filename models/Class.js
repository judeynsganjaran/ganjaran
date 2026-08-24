const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    color: { type: String, default: '#FF6FA5' } // warna tema kelas untuk UI
  },
  { timestamps: true }
);

module.exports = mongoose.model('Class', classSchema);
