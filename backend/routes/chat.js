const express = require('express');
const { getChatReply } = require('../services/chatService');

const router = express.Router();

// POST /api/chat/message
// Body: { message: "best laptop under 50000", history: [{role, content}] }
router.post('/message', async (req, res, next) => {
  try {
    const { message, history } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const reply = await getChatReply(message.trim(), history || []);
    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
