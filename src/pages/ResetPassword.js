import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PieChart, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import axios from 'axios';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [email, setEmail] = useState('');

  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/password/verify-reset-token/${token}`);
        setIsTokenValid(true);
        setEmail(response.data.email);
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired reset link');
        setIsTokenValid(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/password/reset-password', {
        token,
        newPassword
      });

      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTokenValid && error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <PieChart className="text-blue-900 w-8 h-8" />
              <span className="font-display text-2xl font-bold text-blue-900">Financially</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-blue-900">Invalid Reset Link</h2>
          </div>
          
          <div className="p-8 text-center">
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="text-sm text-red-700">{error}</div>
            </div>
            <Link 
              to="/forgot-password" 
              className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md animate-fade-in">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PieChart className="text-blue-900 w-8 h-8" />
            <span className="font-display text-2xl font-bold text-blue-900">Financially</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-blue-900">Create New Password</h2>
          <p className="text-blue-800 mt-2">Enter your new password for {email}</p>
        </div>
        
        <div className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            
            {message && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="text-sm text-green-700">{message}</div>
              </div>
            )}
            
            <div className="relative">
              <label className="block mb-2 text-blue-900 font-semibold">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-700 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-blue-400 transition"
                  placeholder="********"
                  required
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="block mb-2 text-blue-900 font-semibold">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-700 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-blue-400 transition"
                  placeholder="********"
                  required
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-400 text-blue-900 font-bold text-lg hover:from-yellow-600 hover:to-yellow-500 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          
          <div className="text-center mt-6">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
        
        <div className="bg-blue-900 text-blue-200 p-4 text-center text-sm">
          <div className="flex items-center justify-center gap-2">
            <span>256-bit SSL encryption • Your data is always secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}