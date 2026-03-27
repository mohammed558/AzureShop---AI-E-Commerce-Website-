const express = require('express');
const multer = require('multer');
const { speechToText } = require('../services/speechService');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/speech/to-text
// Form-data: audio file (WAV)
router.post('/to-text', upload.single('audio'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Audio file is required' });
    const text = await speechToText(req.file.buffer);
    res.json({ text });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

