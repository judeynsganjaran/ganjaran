const express = require('express');
const router = express.Router();
const SpinImage = require('../models/SpinImage');
const upload = require('../middleware/upload');
const { uploadBufferToGCS, deleteFromGCS } = require('../config/gcs');

// Dapatkan semua gambar spin wheel untuk satu kelas
router.get('/:classId', async (req, res) => {
  try {
    const images = await SpinImage.find({ classId: req.params.classId }).sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload BANYAK gambar sekaligus (bulk) untuk satu kelas
router.post('/:classId/upload', upload.array('images', 60), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Sila pilih sekurang-kurangnya satu gambar' });
    }
    const classId = req.params.classId;

    const uploadedDocs = await Promise.all(
      req.files.map(async (file) => {
        const url = await uploadBufferToGCS(file.buffer, file.originalname, file.mimetype);
        return SpinImage.create({ classId, imageUrl: url, originalName: file.originalname });
      })
    );

    res.status(201).json(uploadedDocs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Padam satu gambar
router.delete('/:id', async (req, res) => {
  try {
    const img = await SpinImage.findByIdAndDelete(req.params.id);
    if (img) deleteFromGCS(img.imageUrl);
    res.json({ message: 'Gambar dipadam' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Padam SEMUA gambar untuk satu kelas (kosongkan set)
router.delete('/class/:classId/clear', async (req, res) => {
  try {
    const images = await SpinImage.find({ classId: req.params.classId });
    await Promise.all(images.map((img) => deleteFromGCS(img.imageUrl)));
    await SpinImage.deleteMany({ classId: req.params.classId });
    res.json({ message: 'Semua gambar dikosongkan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
