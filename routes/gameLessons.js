const express = require('express');
const router = express.Router();
const GameLessonSet = require('../models/GameLessonSet');

// API untuk ciri "Game Arab" - kandungan pelajaran (topik + perkataan)
// boleh diedit di /game-arab-admin.html, disimpan dalam MongoDB yang sama
// dengan Sistem Ganjaran BM (koleksi berasingan: gamelessonsets).

// GET /api/game-lessons - senarai ringkas semua set pelajaran (skrin pilih misi)
router.get('/', async (req, res) => {
  try {
    const lessons = await GameLessonSet.find({}, 'name description words tembakQuestions').sort({ createdAt: 1 });
    const summary = lessons.map((l) => ({
      _id: l._id,
      name: l.name,
      description: l.description,
      wordCount: l.words.length,
      tembakQuestionCount: l.tembakQuestions.length,
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

// ------------------------------------------------------------------
// SOALAN TEMBAK (Mod Tembak A/B/C/D) - tempat edit BERASINGAN drpd "words".
// Setiap soalan ada 4 pilihan (options[0..3] = label A/B/C/D ikut turutan)
// dengan tepat SATU ditanda correct:true.
// ------------------------------------------------------------------

function validateOptions(options) {
  if (!Array.isArray(options) || options.length !== 4) return 'Perlukan tepat 4 pilihan (A/B/C/D).';
  if (options.some((o) => !o || !String(o.text || '').trim())) return 'Semua 4 pilihan mesti diisi.';
  if (options.filter((o) => o.correct).length !== 1) return 'Tandakan SATU sahaja pilihan yang betul.';
  return null;
}

// POST /api/game-lessons/:id/tembak-questions - tambah satu Soalan Tembak
router.post('/:id/tembak-questions', async (req, res) => {
  try {
    const { soalan, options } = req.body;
    if (!soalan || !soalan.trim()) return res.status(400).json({ error: 'Soalan diperlukan.' });
    const optErr = validateOptions(options);
    if (optErr) return res.status(400).json({ error: optErr });
    const lesson = await GameLessonSet.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Set pelajaran tidak dijumpai.' });
    lesson.tembakQuestions.push({
      soalan: soalan.trim(),
      options: options.map((o) => ({ text: o.text.trim(), correct: !!o.correct })),
    });
    await lesson.save();
    res.status(201).json(lesson);
  } catch (err) {
    res.status(400).json({ error: 'Gagal tambah Soalan Tembak.', detail: err.message });
  }
});

// PUT /api/game-lessons/:id/tembak-questions/:qId - edit satu Soalan Tembak
router.put('/:id/tembak-questions/:qId', async (req, res) => {
  try {
    const { soalan, options } = req.body;
    const lesson = await GameLessonSet.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Set pelajaran tidak dijumpai.' });
    const q = lesson.tembakQuestions.id(req.params.qId);
    if (!q) return res.status(404).json({ error: 'Soalan Tembak tidak dijumpai.' });
    if (options !== undefined) {
      const optErr = validateOptions(options);
      if (optErr) return res.status(400).json({ error: optErr });
      q.options = options.map((o) => ({ text: o.text.trim(), correct: !!o.correct }));
    }
    if (soalan !== undefined) {
      if (!soalan.trim()) return res.status(400).json({ error: 'Soalan diperlukan.' });
      q.soalan = soalan.trim();
    }
    await lesson.save();
    res.json(lesson);
  } catch (err) {
    res.status(400).json({ error: 'Gagal kemaskini Soalan Tembak.', detail: err.message });
  }
});

// DELETE /api/game-lessons/:id/tembak-questions/:qId - padam satu Soalan Tembak
router.delete('/:id/tembak-questions/:qId', async (req, res) => {
  try {
    const lesson = await GameLessonSet.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Set pelajaran tidak dijumpai.' });
    lesson.tembakQuestions.id(req.params.qId).deleteOne();
    await lesson.save();
    res.json(lesson);
  } catch (err) {
    res.status(400).json({ error: 'Gagal padam Soalan Tembak.', detail: err.message });
  }
});

module.exports = router;
