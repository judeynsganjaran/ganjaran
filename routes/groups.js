const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const upload = require('../middleware/upload');
const { toDataUri } = upload;

router.get('/class/:classId', async (req, res) => {
  try {
    const groups = await Group.find({ classId: req.params.classId }).populate('members');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cipta kumpulan (multipart: name, classId, members = JSON string array, leaderId, photo)
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { name, classId, leaderId, color } = req.body;
    let members = req.body.members || [];
    if (typeof members === 'string') {
      try { members = JSON.parse(members); } catch { members = members ? [members] : []; }
    }
    if (!name || !classId) return res.status(400).json({ error: 'Nama kumpulan & kelas diperlukan' });

    const photo = req.file ? toDataUri(req.file) : '';
    const group = await Group.create({
      name,
      classId,
      members,
      leaderId: leaderId || null,
      photo,
      color: color || undefined
    });
    const populated = await group.populate('members');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Kemaskini kumpulan (nama / ahli / ketua / gambar)
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const { name, leaderId, color } = req.body;
    let members = req.body.members;
    if (typeof members === 'string') {
      try { members = JSON.parse(members); } catch { members = members ? [members] : undefined; }
    }

    const update = {};
    if (name) update.name = name;
    if (members) update.members = members;
    if (color) update.color = color;
    if (leaderId !== undefined) update.leaderId = leaderId || null;
    if (req.file) update.photo = toDataUri(req.file);

    const group = await Group.findByIdAndUpdate(req.params.id, update, { new: true }).populate('members');
    if (!group) return res.status(404).json({ error: 'Kumpulan tidak dijumpai' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tambah/kurang mata BONUS kumpulan secara manual (berasingan dari mata ahli)
router.patch('/:id/point', async (req, res) => {
  try {
    const { delta } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Kumpulan tidak dijumpai' });
    group.bonusPoints = Math.max(0, group.bonusPoints + (delta || 1));
    await group.save();
    const populated = await group.populate('members');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: 'Kumpulan berjaya dipadam' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
