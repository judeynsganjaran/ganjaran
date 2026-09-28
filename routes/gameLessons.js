const express = require('express');
const router = express.Router();
const GameLessonSet = require('../models/GameLessonSet');

// API untuk ciri "Game Arab" - kandungan pelajaran (topik + perkataan)
// boleh diedit di /game-arab-admin.html, disimpan dalam MongoDB yang sama
// dengan Sistem Ganjaran BM (koleksi berasingan: gamelessonsets).

// GET /api/game-lessons - senarai ringkas semua set pelajaran (skrin pilih misi)
router.get('/', async (req, res) => {
  try {
    const lessons = await GameLessonSet.find({}, 'name description words').sort({ createdAt: 1 });
    const summary = lessons.map((l) => ({
      _id: l._id,
      name: l.name,
      description: l.description,
      wordCount: l.words.length,
    }));
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Gagal ambil senarai pelajaran.', detail: err.message });
  }
});

// GET /api/game-lessons/:id - satu set pelajaran penuh (termasuk semua perkataan)
router.get('/:id', async (req, res) => {
  try {
    const lesson = await GameLessonSet.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Set pelajaran tidak dijumpai.' });
    res.json(lesson);
  } catch (err) {
    res.status(400).json({ error: 'ID tidak sah.', detail: err.message });
  }
});

// POST /api/game-lessons - cipta set pelajaran baharu
router.post('/', async (req, res) => {
  try {
    const { name, description, words } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Nama set pelajaran diperlukan.' });
    const lesson = await GameLessonSet.create({ name: name.trim(), description: description || '', words: words || [] });
    res.status(201).json(lesson);
  } catch (err) {
    res.status(400).json({ error: 'Gagal cipta set pelajaran.', detail: err.message });
  }
});

// PUT /api/game-lessons/:id - kemaskini nama/penerangan set pelajaran
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const update = {};
    if (name !== undefined) update.name = name.trim();
    if (description !== undefined) update.description = description;
    const lesson = await GameLessonSet.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!lesson) return res.status(404).json({ error: 'Set pelajaran tidak dijumpai.' });
    res.json(lesson);
  } catch (err) {
    res.status(400).json({ error: 'Gagal kemaskini set pelajaran.', detail: err.message });
  }
});

// DELETE /api/game-lessons/:id - padam keseluruhan set pelajaran
router.delete('/:id', async (req, res) => {
  try {
    const lesson = await GameLessonSet.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Set pelajaran tidak dijumpai.' });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: 'Gagal padam set pelajaran.', detail: err.message });
  }
});

// POST /api/game-lessons/:id/words - tambah satu perkataan baharu dalam set
router.post('/:id/words', async (req, res) => {
  try {
    const { melayu, arab, icon } = req.body;
    if (!melayu || !arab) return res.status(400).json({ error: 'Perkataan Melayu dan Arab diperlukan.' });
    const lesson = await GameLessonSet.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Set pelajaran tidak dijumpai.' });
    lesson.words.push({ melayu: melayu.trim(), arab: arab.trim(), icon: (icon || '📦').trim() });
    await lesson.save();
    res.status(201).json(lesson);
  } catch (err) {
    res.status(400).json({ error: 'Gagal tambah perkataan.', detail: err.message });
  }
});

// PUT /api/game-lessons/:id/words/:wordId - edit satu perkataan
router.put('/:id/words/:wordId', async (req, res) => {
  try {
    const { melayu, arab, icon } = req.body;
    const lesson = await GameLessonSet.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Set pelajaran tidak dijumpai.' });
    const word = lesson.words.id(req.params.wordId);
    if (!word) return res.status(404).json({ error: 'Perkataan tidak dijumpai.' });
    if (melayu !== undefined) word.melayu = melayu.trim();
    if (arab !== undefined) word.arab = arab.trim();
    if (icon !== undefined) word.icon = icon.trim();
    await lesson.save();
    res.json(lesson);
  } catch (err) {
    res.status(400).json({ error: 'Gagal kemaskini perkataan.', detail: err.message });
  }
});

// DELETE /api/game-lessons/:id/words/:wordId - padam satu perkataan
router.delete('/:id/words/:wordId', async (req, res) => {
  try {
    const lesson = await GameLessonSet.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Set pelajaran tidak dijumpai.' });
    lesson.words.id(req.params.wordId).deleteOne();
    await lesson.save();
    res.json(lesson);
  } catch (err) {
    res.status(400).json({ error: 'Gagal padam perkataan.', detail: err.message });
  }
});

module.exports = router;
