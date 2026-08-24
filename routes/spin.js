const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Dapatkan senarai murid (dengan spinPhoto) ikut kelas untuk spin wheel
router.get('/:classId', async (req, res) => {
  try {
    const students = await Student.find({ classId: req.params.classId }).select('name photo spinPhoto');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
