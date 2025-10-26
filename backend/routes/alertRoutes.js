const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const authenticate = require('../middleware/auth');

router.get('/', authenticate, alertController.getAlerts);
router.post('/', authenticate, alertController.createAlert);
router.put('/:id', authenticate, alertController.updateAlert);
router.delete('/:id', authenticate, alertController.deleteAlert);

module.exports = router; 