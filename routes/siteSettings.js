const express = require('express');
const router = express.Router();
const SiteSettings = require('../models/SiteSettings');
const upload = require('../middleware/upload');
const { toDataUri } = upload;

router.get('/', async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', upload.single('logo'), async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});
    const { siteName } = req.body;
    if (siteName !== undefined && siteName.trim()) settings.siteName = siteName.trim();
    if (req.file) settings.logoUrl = toDataUri(req.file);
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
