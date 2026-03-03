// Escalation Route: POST /escalation/create
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createTicket } = require('../controllers/escalationController');

router.post('/create', authenticate, createTicket);

module.exports = router;
