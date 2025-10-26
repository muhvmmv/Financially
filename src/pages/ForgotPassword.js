import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Mail, ArrowLeft } from "lucide-react";
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetLink, setResetLink] = useState(''); // Add this state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    setResetLink(''); // Reset the link

    try {
      const response = await axios.post('http://localhost:5000/api/password/forgot-password', {
        email
      });
      
      setMessage(response.data.message);
      // Store the reset link if it exists (for development)
      if (response.data.resetLink) {
        setResetLink(response.data.resetLink);
      }
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md animate-fade-in">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PieChart className="text-blue-900 w-8 h-8" />
            <span className="font-display text-2xl font-bold text-blue-900">Financially</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-blue-900">Reset Your Password</h2>
          <p className="text-blue-800 mt-2">We'll send you a reset link</p>
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
              <label className="block mb-2 text-blue-900 font-semibold">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-700 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-blue-400 transition"
                  placeholder="you@email.com"
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-400 text-blue-900 font-bold text-lg hover:from-yellow-600 hover:to-yellow-500 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
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