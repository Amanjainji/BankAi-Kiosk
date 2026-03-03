// Account Routes: balance, mini-statement, block-card
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');
const { getBalance, getMiniStatement, blockCard } = require('../controllers/accountController');

router.use(authenticate);
router.use(auditMiddleware);

router.get('/balance', getBalance);
router.get('/mini-statement', getMiniStatement);
router.post('/block-card', blockCard);

module.exports = router;
