require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');

// Route imports
const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const alertRoutes = require('./routes/alertRoutes');
// REMOVED: passwordRoutes and emailVerificationRoutes

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alerts', alertRoutes);
// REMOVED: app.use('/api/password', passwordRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Add this after your other middleware in server.js
app.use((req, res, next) => {
  console.log('🌐 INCOMING REQUEST:', {
    method: req.method,
    url: req.url,
    path: req.path,
    body: req.body,
    timestamp: new Date().toISOString()
  });
  next();
});

// Add this right after your other routes in server.js
app.get('/api/test', (req, res) => {
  console.log('✅ TEST ROUTE HIT - Backend is working!');
  res.json({ message: 'Backend is working!', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`PostgreSQL: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  
  console.log('🔧 Environment check:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
});