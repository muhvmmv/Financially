const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const transactionController = require('../controllers/transactionController');

// Protected routes (require valid JWT)
router.get('/', authenticate, transactionController.getTransactions);
router.post('/', authenticate, transactionController.createTransaction);
router.put('/:id', authenticate, transactionController.updateTransaction);
router.delete('/:id', authenticate, transactionController.deleteTransaction);

// Analytics routes
router.get('/stats/monthly', authenticate, transactionController.getMonthlyStats);
router.get('/stats/categories', authenticate, transactionController.getSpendingByCategory);

module.exports = router; 