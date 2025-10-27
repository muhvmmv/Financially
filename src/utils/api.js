// src/utils/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchApi = async (url, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    credentials: 'include', // If using cookies/auth
    headers: {
      ...options.headers,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
};

export const login = (email, password) => fetchApi('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

export const signup = (email, password, ...data) => fetchApi('/auth/signup', {
  method: 'POST',
  body: JSON.stringify({ email, password, ...data })
});

export const forgotPassword = (email) => fetchApi('/auth/forgot-password', {
  method: 'POST',
  body: JSON.stringify({ email })
});

// Add other endpoints (e.g., bank connection) as needed