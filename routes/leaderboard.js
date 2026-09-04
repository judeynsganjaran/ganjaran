const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Group = require('../models/Group');

router.get('/individu/:classId', async (req, res) => {
  try {
    const students = await Student.find({ classId: req.params.classId }).sort({ points: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/kumpulan/:classId', async (req, res) => {
  try {
    const groups = await Group.find({ classId: req.params.classId }).populate('members').populate('leaderId');
    const result = groups
      .map((g) => {
        const memberPoints = g.members.reduce((sum, m) => sum + (m.points || 0), 0);
        const totalPoints = memberPoints + (g.bonusPoints || 0);
        return {
          _id: g._id,
          name: g.name,
          color: g.color,
          photo: g.photo,
          leader: g.leaderId,
          members: g.members,
          memberPoints,
          bonusPoints: g.bonusPoints || 0,
          totalPoints
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/student/:id/point', async (req, res) => {
  try {
    const { delta } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Murid tidak dijumpai' });
    student.points = Math.max(0, student.points + (delta || 1));
    await student.save();
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
