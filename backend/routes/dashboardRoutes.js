const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// Protected routes (require valid JWT)
router.get('/data', authenticate, dashboardController.getDashboardData);

module.exports = router; 