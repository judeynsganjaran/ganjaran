const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const SpinImage = require('../models/SpinImage');
const upload = require('../middleware/upload');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');

function removeLocalFile(fileUrl) {
  try {
    if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;
    const filePath = path.join(uploadDir, path.basename(fileUrl));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error('Gagal padam fail lokal:', err.message);
  }
}

router.get('/:classId', async (req, res) => {
  try {
    const images = await SpinImage.find({ classId: req.params.classId }).sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:classId/upload', upload.array('images', 60), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Sila pilih sekurang-kurangnya satu gambar' });
    }
    const classId = req.params.classId;
    const uploadedDocs = await Promise.all(
      req.files.map((file) =>
        SpinImage.create({
          classId,
          imageUrl: `/uploads/${file.filename}`,
          originalName: file.originalname
        })
      )
    );
    res.status(201).json(uploadedDocs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const img = await SpinImage.findByIdAndDelete(req.params.id);
    if (img) removeLocalFile(img.imageUrl);
    res.json({ message: 'Gambar dipadam' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/class/:classId/clear', async (req, res) => {
  try {
    const images = await SpinImage.find({ classId: req.params.classId });
    images.forEach((img) => removeLocalFile(img.imageUrl));
    await SpinImage.deleteMany({ classId: req.params.classId });
    res.json({ message: 'Semua gambar dikosongkan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
