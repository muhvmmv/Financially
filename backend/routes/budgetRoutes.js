const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const budgetController = require('../controllers/budgetController');

// Protected routes (require valid JWT)
router.get('/', authenticate, budgetController.getBudgets);
router.post('/', authenticate, budgetController.createBudget);
router.put('/:id', authenticate, budgetController.updateBudget);
router.delete('/:id', authenticate, budgetController.deleteBudget);

module.exports = router; 