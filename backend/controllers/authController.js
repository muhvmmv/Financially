const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ==================== AUTHENTICATION FUNCTIONS ====================

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    console.log('🔍 Starting signup process for:', email);

    // Create pending registration
    const pendingRegistration = await createPendingRegistration(name, email, password);

    console.log('✅ Pending registration created, sending verification email');

    // Send verification email
    try {
      const verificationUrl = await sendVerificationEmail(email, pendingRegistration.verification_token);

      const response = {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.'
      };

      // Only include verification URL in development
      if (process.env.NODE_ENV !== 'production' && verificationUrl) {
        response.verificationUrl = verificationUrl;
      }

      res.status(201).json(response);

    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      // Delete the pending registration if email fails
      await pool.query('DELETE FROM pending_registrations WHERE id = $1', [pendingRegistration.id]);
      res.status(500).json({ 
        message: 'Error sending verification email. Please try again.' 
      });
    }

  } catch (err) {
    console.error('SIGNUP ERROR:', err);
    if (err.message === 'Email already in use') {
      res.status(400).json({ message: 'Email already in use' });
    } else {
      res.status(500).json({ message: 'Signup failed', error: err.message });
    }
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1', 
      [email]
    );
    const user = userResult.rows[0];

    if (!user) {
      // Check if there's a pending registration for this email
      const pendingResult = await pool.query(
        'SELECT * FROM pending_registrations WHERE email = $1',
        [email]
      );
      
      if (pendingResult.rows.length > 0) {
        return res.status(400).json({ 
          message: 'Please verify your email before logging in.',
          emailNotVerified: true,
          email: email
        });
      }

      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate token and login
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({ 
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

exports.logout = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

// ==================== EMAIL VERIFICATION FUNCTIONS ====================

const createPendingRegistration = async (name, email, password) => {
  try {
    console.log('🔍 Starting pending registration for:', email);
    
    // Check if email already exists in users or pending registrations
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    const pendingCheck = await pool.query(
      'SELECT * FROM pending_registrations WHERE email = $1',
      [email]
    );

    console.log('🔍 Existing users:', userCheck.rows.length);
    console.log('🔍 Existing pending registrations:', pendingCheck.rows.length);

    if (userCheck.rows.length > 0 || pendingCheck.rows.length > 0) {
      throw new Error('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    console.log('🔍 Generated token (first 10 chars):', verificationToken.substring(0, 10));

    // Save to pending registrations
    const result = await pool.query(
      `INSERT INTO pending_registrations (full_name, email, password_hash, verification_token, verification_expiry) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, verification_token`,
      [name, email, hashedPassword, verificationToken, verificationExpiry]
    );

    console.log('✅ Pending registration created in database');
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error creating pending registration:', error);
    throw error;
  }
};

const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;

    console.log('📧 SENDING REAL EMAIL TO:', email);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - Financially',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #f59e0b, #eab308); padding: 20px; text-align: center;">
            <h2 style="color: #1e3a8a; margin: 0;">Financially</h2>
            <p style="color: #1e3a8a; margin: 5px 0 0 0;">Email Verification</p>
          </div>
          <div style="padding: 20px;">
            <p>Welcome to Financially! Please verify your email address to complete your registration.</p>
            <p>Click the link below to verify your email and activate your account (valid for 24 hours):</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(to right, #f59e0b, #eab308); 
                        color: #1e3a8a; 
                        padding: 12px 24px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;">
                Verify Email & Complete Registration
              </a>
            </div>
            <p>If you didn't create an account, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">Muhammad Nasirdeen</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ REAL EMAIL SENT SUCCESSFULLY TO:', email);
    return null;

  } catch (error) {
    console.error('❌ FAILED TO SEND EMAIL:', error);
    throw error;
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  
  console.log('🔍 VERIFICATION ATTEMPT STARTED');
  console.log('🔍 Token received (first 20 chars):', token.substring(0, 20));

  try {
    // Find pending registration by valid verification token
    const pendingResult = await pool.query(
      'SELECT * FROM pending_registrations WHERE verification_token = $1 AND verification_expiry > $2',
      [token, Date.now()]
    );

    console.log('🔍 Found pending registrations:', pendingResult.rows.length);

    if (pendingResult.rows.length === 0) {
      console.log('❌ No valid pending registration found');
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired verification token' 
      });
    }

    const pendingRegistration = pendingResult.rows[0];
    console.log('✅ Valid pending registration found:', pendingRegistration.email);

    // Check if user already exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [pendingRegistration.email]
    );

    if (userCheck.rows.length > 0) {
      console.log('⚠️ User already exists, cleaning up pending registration');
      await pool.query(
        'DELETE FROM pending_registrations WHERE id = $1',
        [pendingRegistration.id]
      );
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered. Please log in instead.' 
      });
    }

    console.log('✅ Creating user account...');

    // Create user in main users table
    const userResult = await pool.query(
      `INSERT INTO users (full_name, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, full_name, email, created_at`,
      [pendingRegistration.full_name, pendingRegistration.email, pendingRegistration.password_hash]
    );

    const user = userResult.rows[0];

    // Delete from pending registrations
    await pool.query(
      'DELETE FROM pending_registrations WHERE id = $1',
      [pendingRegistration.id]
    );

    console.log('✅ USER REGISTRATION COMPLETED:', user.email);

    res.status(200).json({ 
      success: true,
      message: 'Email verified successfully! Your account has been created. You can now log in.',
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error verifying email', 
      error: error.message 
    });
  }
};

exports.resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const pendingResult = await pool.query(
      'SELECT * FROM pending_registrations WHERE email = $1',
      [email]
    );

    if (pendingResult.rows.length === 0) {
      return res.status(400).json({ 
        message: 'No pending registration found for this email.' 
      });
    }

    const pendingRegistration = pendingResult.rows[0];
    const verificationUrl = await sendVerificationEmail(email, pendingRegistration.verification_token);

    const response = {
      message: 'Verification email sent successfully.'
    };

    // Only include verification URL in development
    if (process.env.NODE_ENV !== 'production' && verificationUrl) {
      response.verificationUrl = verificationUrl;
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ 
      message: 'Error sending verification email', 
      error: error.message 
    });
  }
};

// ==================== PASSWORD RESET FUNCTIONS ====================

// ==================== PASSWORD RESET FUNCTIONS ====================

const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    console.log('📧 STEP 5.1: Starting to send password reset email');
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    console.log('📧 STEP 5.2: Reset URL generated:', resetUrl);
    console.log('📧 STEP 5.3: Sending to email:', email);
    console.log('📧 STEP 5.4: Using email user:', process.env.EMAIL_USER);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your Password - Financially',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #f59e0b, #eab308); padding: 20px; text-align: center;">
            <h2 style="color: #1e3a8a; margin: 0;">Financially</h2>
            <p style="color: #1e3a8a; margin: 5px 0 0 0;">Password Reset</p>
          </div>
          <div style="padding: 20px;">
            <p>You have requested to reset your password for your Financially account.</p>
            <p>Click the link below to reset your password (valid for 1 hour):</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(to right, #f59e0b, #eab308); 
                        color: #1e3a8a; 
                        padding: 12px 24px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>If you did not request a password reset, please ignore this email.</p>
            <p style="word-break: break-all; background: #f8fafc; padding: 10px; border-radius: 5px; border: 1px solid #e5e7eb;">
              <strong>Reset Link:</strong><br>
              ${resetUrl}
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">Muhammad Nasirdeen</p>
          </div>
        </div>
      `
    };

    console.log('📧 STEP 5.5: About to send mail with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    await transporter.sendMail(mailOptions);
    console.log('✅ STEP 5.6: PASSWORD RESET EMAIL SENT SUCCESSFULLY TO:', email);
    return null;

  } catch (error) {
    console.error('❌ STEP 5.6 FAILED: FAILED TO SEND PASSWORD RESET EMAIL');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Full error:', error);
    throw error;
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    console.log('🔐 STEP 1: Forgot password request for:', email);

    // Check if user exists
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    const user = userResult.rows[0];

    console.log('🔐 STEP 2: User found:', !!user);

    // For security, don't reveal if email exists
    if (!user) {
      console.log('⚠️ User not found, but returning success for security');
      return res.status(200).json({ 
        message: 'If an account with that email exists, a reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    console.log('🔐 STEP 3: Generated reset token for:', email);

    // Save token to database
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
      [resetToken, resetTokenExpiry, email]
    );

    console.log('🔐 STEP 4: Reset token saved to database');

    // Send password reset email
    try {
      console.log('🔐 STEP 5: Attempting to send password reset email');
      await sendPasswordResetEmail(email, resetToken);
      console.log('🔐 STEP 6: Password reset email sent successfully');
      
      res.status(200).json({ 
        message: 'If an account with that email exists, a reset link has been sent.'
      });
      
    } catch (emailError) {
      console.error('❌ STEP 5 FAILED: Failed to send password reset email:', emailError);
      console.error('❌ Full error details:', emailError.message);
      console.error('❌ Error stack:', emailError.stack);
      
      // Clear the reset token if email fails
      await pool.query(
        'UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE email = $1',
        [email]
      );
      res.status(500).json({ 
        message: 'Error sending reset email. Please try again.' 
      });
    }

  } catch (err) {
    console.error('❌ MAIN CATCH: Password reset request error:', err);
    console.error('❌ Full error details:', err.message);
    console.error('❌ Error stack:', err.stack);
    res.status(500).json({ 
      message: 'Error processing request', 
      error: err.message 
    });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    console.log('🔐 Reset password attempt with token');

    // Find user by valid reset token
    const userResult = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > $2',
      [token, Date.now()]
    );
    const user = userResult.rows[0];

    if (!user) {
      console.log('❌ Invalid or expired reset token');
      return res.status(400).json({ 
        message: 'Invalid or expired reset token. Please request a new reset link.' 
      });
    }

    console.log('✅ Valid reset token found for user:', user.email);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    console.log('✅ Password reset successfully for user:', user.email);

    res.status(200).json({ 
      message: 'Password reset successfully. You can now log in with your new password.' 
    });
  } catch (err) {
    console.error('❌ Password reset error:', err);
    res.status(500).json({ 
      message: 'Error resetting password', 
      error: err.message 
    });
  }
};

exports.verifyResetToken = async (req, res) => {
  const { token } = req.params;

  try {
    console.log('🔐 Verifying reset token');

    const userResult = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > $2',
      [token, Date.now()]
    );
    const user = userResult.rows[0];

    if (!user) {
      console.log('❌ Invalid or expired reset token');
      return res.status(400).json({ 
        message: 'Invalid or expired reset token. Please request a new reset link.' 
      });
    }

    console.log('✅ Reset token is valid for user:', user.email);

    res.status(200).json({ 
      message: 'Token is valid', 
      email: user.email 
    });
  } catch (err) {
    console.error('❌ Token verification error:', err);
    res.status(500).json({ 
      message: 'Error verifying token', 
      error: err.message 
    });
  }
};