const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    color: { type: String, default: '#5CC8FF' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);
