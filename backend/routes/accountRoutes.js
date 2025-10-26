const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const accountController = require('../controllers/accountController');

// plaid routes
router.post('/plaid/create-link-token', authenticate, accountController.createPlaidLinkToken);
router.post('/plaid/exchange-token', authenticate, accountController.exchangePlaidToken);
router.post('/plaid/sync-transactions', authenticate, accountController.syncTransactions);


// Protected routes (require valid JWT)
router.get('/profile', authenticate, accountController.getProfile);
router.put('/update-password', authenticate, accountController.updatePassword);

// Account management routes
router.get('/accounts', authenticate, accountController.getAccounts);
router.post('/accounts', authenticate, accountController.createAccount);
router.put('/accounts/:id', authenticate, accountController.updateAccount);
router.delete('/accounts/:id', authenticate, accountController.deleteAccount);

// Bank connection routes
router.post('/connect-bank', authenticate, accountController.connectBank);
router.get('/bank-connection-status', authenticate, accountController.getBankConnectionStatus);

module.exports = router;