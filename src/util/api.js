// Use your Railway backend URL
const API_BASE_URL = 'https://financially-production.up.railway.app/api';

// Generic API request function
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  
  console.log('🚀 Making API request to:', url); // Debug log

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add authorization header if token exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    console.log('📥 Response status:', response.status);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      
      throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }

    console.log('✅ API request successful');
    return data;

  } catch (error) {
    console.error('❌ API request failed:', error.message);
    throw error;
  }
};

// Authentication API calls
export const login = async (credentials) => {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: credentials
  });
};

export const signup = async (userData) => {
  return apiRequest('/auth/signup', {
    method: 'POST',
    body: userData
  });
};

export const verifyEmail = async (token) => {
  return apiRequest(`/auth/verify-email/${token}`, {
    method: 'GET'
  });
};

export const forgotPassword = async (email) => {
  return apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: { email }
  });
};

export const resetPassword = async (token, newPassword) => {
  return apiRequest('/auth/reset-password', {
    method: 'POST',
    body: { token, newPassword }
  });
};

// Plaid Bank Integration
export const createPlaidLinkToken = async () => {
  return apiRequest('/accounts/plaid/create-link-token', {
    method: 'POST'
  });
};

export const exchangePlaidToken = async (publicToken) => {
  return apiRequest('/accounts/plaid/exchange-token', {
    method: 'POST',
    body: { public_token: publicToken }
  });
};

export const syncTransactions = async () => {
  return apiRequest('/accounts/plaid/sync-transactions', {
    method: 'POST'
  });
};

// Accounts
export const getAccounts = async () => {
  return apiRequest('/accounts/accounts', {
    method: 'GET'
  });
};

export const getProfile = async () => {
  return apiRequest('/accounts/profile', {
    method: 'GET'
  });
};

// Transactions
export const getTransactions = async (limit = 50) => {
  return apiRequest(`/transactions?limit=${limit}`, {
    method: 'GET'
  });
};

export const createTransaction = async (transactionData) => {
  return apiRequest('/transactions', {
    method: 'POST',
    body: transactionData
  });
};

// Budgets
export const getBudgets = async (month, year) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (year) params.append('year', year);
  
  return apiRequest(`/budgets?${params.toString()}`, {
    method: 'GET'
  });
};

// Dashboard
export const getDashboardData = async () => {
  return apiRequest('/dashboard/data', {
    method: 'GET'
  });
};

// Health check
export const healthCheck = async () => {
  return apiRequest('/health', {
    method: 'GET'
  });
};