const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const Student = require('../models/Student');
const Group = require('../models/Group');
const SpinImage = require('../models/SpinImage');
const upload = require('../middleware/upload');
const { toDataUri } = upload;

// ===== KELAS =====

router.get('/', async (req, res) => {
  try {
    const classes = await Class.find().sort({ createdAt: -1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Nama kelas diperlukan' });
    const newClass = await Class.create({ name, color });
    res.status(201).json(newClass);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, color } = req.body;
    const updated = await Class.findByIdAndUpdate(
      req.params.id,
      { ...(name && { name }), ...(color && { color }) },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Kelas tidak dijumpai' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const classId = req.params.id;
    await SpinImage.deleteMany({ classId });
    await Student.deleteMany({ classId });
    await Group.deleteMany({ classId });
    await Class.findByIdAndDelete(classId);
    res.json({ message: 'Kelas dan data berkaitan berjaya dipadam' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== MURID =====

router.get('/:classId/students', async (req, res) => {
  try {
    const students = await Student.find({ classId: req.params.classId }).sort({ name: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  '/:classId/students',
  upload.fields([{ name: 'photo', maxCount: 1 }]),
  async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'Nama murid diperlukan' });
      const photo = req.files?.photo ? toDataUri(req.files.photo[0]) : '';
      const student = await Student.create({ name, classId: req.params.classId, photo });
      res.status(201).json(student);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.put(
  '/students/:studentId',
  upload.fields([{ name: 'photo', maxCount: 1 }]),
  async (req, res) => {
    try {
      const { name } = req.body;
      const existing = await Student.findById(req.params.studentId);
      if (!existing) return res.status(404).json({ error: 'Murid tidak dijumpai' });

      const update = {};
      if (name) update.name = name;
      if (req.files?.photo) update.photo = toDataUri(req.files.photo[0]);

      const student = await Student.findByIdAndUpdate(req.params.studentId, update, { new: true });
      res.json(student);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete('/students/:studentId', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.studentId);
    await Group.updateMany({}, { $pull: { members: req.params.studentId } });
    res.json({ message: 'Murid berjaya dipadam' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
