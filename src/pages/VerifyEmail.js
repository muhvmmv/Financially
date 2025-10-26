import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PieChart, CheckCircle, XCircle, Mail } from "lucide-react";
import axios from 'axios';
await new Promise(resolve => setTimeout(resolve, 1000));

export default function VerifyEmail() {
  const { token } = useParams();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const hasVerified = useRef(false); // Prevent double verification

  useEffect(() => {
    const verifyEmail = async () => {
      // Prevent multiple verifications
      if (hasVerified.current) {
        console.log('🛑 Verification already attempted, skipping...');
        return;
      }
      
      hasVerified.current = true;
      
      if (!token) {
        setError('No verification token provided');
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔄 Starting email verification...');
        const response = await axios.get(`http://localhost:5000/api/auth/verify-email/${token}`);
        
        if (response.data.success) {
          setMessage(response.data.message);
          console.log('✅ Verification successful');
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (err) {
        console.error('❌ Verification error:', err.response?.data);
        setError(err.response?.data?.message || 'Error verifying email');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setError('No verification token provided');
      setIsLoading(false);
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md animate-fade-in">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PieChart className="text-blue-900 w-8 h-8" />
            <span className="font-display text-2xl font-bold text-blue-900">Financially</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-blue-900">Email Verification</h2>
        </div>
        
        <div className="p-8 text-center">
          {isLoading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
              <p className="text-blue-700">Verifying your email...</p>
              <p className="text-sm text-blue-600">Please wait while we activate your account.</p>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
              <div className="space-y-2">
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-medium"
                >
                  Back to Login
                </Link>
                <br />
                <Link 
                  to="/resend-verification" 
                  className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Resend Verification Email
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div className="rounded-md bg-green-50 p-4">
                <div className="text-sm text-green-700">{message}</div>
                <p className="text-sm text-green-600 mt-2">Redirecting to login...</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-blue-900 text-blue-200 p-4 text-center text-sm">
          <div className="flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" />
            <span>Email Verification • Your account security</span>
          </div>
        </div>
      </div>
    </div>
  );
}