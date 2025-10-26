import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from './pages/Index';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import Transactions from './pages/Transactions';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useEffect } from 'react';
import Budgets from './pages/Budgets';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword'; // Add this import
import ResetPassword from './pages/ResetPassword'; // Add this import
import VerifyEmail from './pages/VerifyEmail';
import ResendVerification from './pages/ResendVerification';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/transactions/add" element={<ProtectedRoute><AddTransaction /></ProtectedRoute>} />
        <Route path="/budgets" element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/add" element={<ProtectedRoute><AddTransaction /></ProtectedRoute>} />
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />
        <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} /> {/* Add this */}
        <Route path="/reset-password/:token" element={<AuthRoute><ResetPassword /></AuthRoute>} /> {/* Add this */}
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
      </Routes>
    </Router>
  );
}

// Protected route for authenticated users
function ProtectedRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('token');
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Auth route for non-authenticated users
function AuthRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('token');
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default App;