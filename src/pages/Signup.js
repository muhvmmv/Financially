import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { PieChart, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import axios from 'axios';

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);


const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setMessage('');
  setIsLoading(true);

  // Validation
  if (password !== confirmPassword) {
    setError('Passwords do not match');
    setIsLoading(false);
    return;
  }

  if (password.length < 6) {
    setError('Password must be at least 6 characters long');
    setIsLoading(false);
    return;
  }

  try {
    const response = await axios.post('http://localhost:5000/api/auth/signup', {
      name,
      email,
      password
    });
    
    // Show success message
    setMessage(response.data.message);
    
    // Clear form
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    
  } catch (err) {
    setError(err.response?.data?.message || 'Signup failed');
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
          <h2 className="font-display text-2xl font-bold text-blue-900">Create Account</h2>
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
                  <p className="text-xs text-green-600 mt-2">
                    Please check your email inbox (and spam folder) for the verification link.
                  </p>
                </div>
              )}
            
            <div className="relative">
              <label className="block mb-2 text-blue-900 font-semibold">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-700 w-5 h-5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-blue-400 transition"
                  placeholder="Hammad Gwaska"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
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
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="relative">
              <label className="block mb-2 text-blue-900 font-semibold">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-700 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-blue-400 transition"
                  placeholder="********"
                  required
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-700"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-blue-600 mt-1">Must be at least 6 characters long</p>
            </div>

            <div className="relative">
              <label className="block mb-2 text-blue-900 font-semibold">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-700 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-blue-400 transition"
                  placeholder="********"
                  required
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-400 text-blue-900 font-bold text-lg hover:from-yellow-600 hover:to-yellow-500 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-900"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          <p className="text-center mt-8 text-blue-700">
            Already have an account?{" "}
            <Link to="/login" className="text-yellow-600 font-bold hover:text-yellow-700 underline">
              Log in
            </Link>
          </p>

          {message && (
            <div className="text-center mt-4">
              <Link 
                to="/resend-verification" 
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Need another verification email?
              </Link>
            </div>
          )}
        </div>
        
        <div className="bg-blue-900 text-blue-200 p-4 text-center text-sm">
          <div className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            <span>256-bit SSL encryption • Your data is always secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}