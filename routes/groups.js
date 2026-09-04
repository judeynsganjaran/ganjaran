const express = require('express');
const router = express.Router();
const Group = require('../models/Group');

router.get('/class/:classId', async (req, res) => {
  try {
    const groups = await Group.find({ classId: req.params.classId }).populate('members');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, classId, members, color } = req.body;
    if (!name || !classId) return res.status(400).json({ error: 'Nama kumpulan & kelas diperlukan' });
    const group = await Group.create({ name, classId, members: members || [], color });
    const populated = await group.populate('members');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, members, color } = req.body;
    const update = {};
    if (name) update.name = name;
    if (members) update.members = members;
    if (color) update.color = color;
    const group = await Group.findByIdAndUpdate(req.params.id, update, { new: true }).populate('members');
    if (!group) return res.status(404).json({ error: 'Kumpulan tidak dijumpai' });
    res.json(group);
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
