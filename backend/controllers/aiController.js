// =============================================================
// AI Chat Controller
// =============================================================
const { buildResponse } = require('../services/aiService');
const { createSession, getSession } = require('../models/session');
const { v4: uuidv4 } = require('uuid');

const chat = async (req, res) => {
  const { message, sessionId, language } = req.body;
  const { customerId } = req.user;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  // Create session if first message
  const sid = sessionId || uuidv4();
  if (!getSession(sid)) {
    createSession(sid, customerId, language || 'en');
  }

  try {
    const response = await buildResponse(message.trim(), customerId, sid, language);

    return res.json({
      success: true,
      sessionId: sid,
      ...response
    });
  } catch (err) {
    console.error('[AI Chat Error]', err);
    return res.status(500).json({ success: false, message: 'AI service temporarily unavailable' });
  }
};

module.exports = { chat };
