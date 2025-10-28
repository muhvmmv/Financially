import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { PieChart, Eye, EyeOff, Mail, Lock } from "lucide-react";
import axios from 'axios';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
      
    // In the handleSubmit function, add this after the catch block:
    } catch (err) {
    if (err.response?.data?.emailNotVerified) {
    // Redirect to resend verification page with email pre-filled
    navigate('/resend-verification', { 
      state: { email: err.response.data.email } 
    });
    return;
  }
  setError(err.response?.data?.message || 'Login failed');
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
          <h2 className="font-display text-2xl font-bold text-blue-900">Welcome Back</h2>
        </div>
        
        <div className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="text-red-500 text-center">{error}</div>}
            
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
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">Forgot password?</Link>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-400 text-blue-900 font-bold text-lg hover:from-yellow-600 hover:to-yellow-500 transition shadow-md"
            >
              Login to Dashboard
            </button>
          </form>
          
          <p className="text-center mt-8 text-blue-700">
            Don't have an account?{" "}
            <Link to="/signup" className="text-yellow-600 font-bold hover:text-yellow-700 underline">
              Sign up
            </Link>
          </p>
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