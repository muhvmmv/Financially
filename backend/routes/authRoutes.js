const express = require('express');
const { 
  // Authentication
  login, 
  signup, 
  logout,
  
  // Email Verification
  verifyEmail,
  resendVerificationEmail,
  
  // Password Reset
  forgotPassword,
  resetPassword, 
  verifyResetToken
} = require('../controllers/authController');

const router = express.Router();

// ==================== AUTHENTICATION ROUTES ====================
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// ==================== EMAIL VERIFICATION ROUTES ====================
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// ==================== PASSWORD RESET ROUTES ====================
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-reset-token/:token', verifyResetToken);

module.exports = router;