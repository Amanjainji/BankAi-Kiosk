// Admin Routes: GET /admin/metrics, GET /admin/escalations
const express = require('express');
const router = express.Router();
const { getMetrics, getEscalations } = require('../controllers/adminController');

// In production: add admin authentication middleware
router.get('/metrics', getMetrics);
router.get('/escalations', getEscalations);

module.exports = router;
