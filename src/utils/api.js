class ApiService {
  constructor() {
    // Use environment variable with fallback for production
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'https://financially-production.up.railway.app/api';
    console.log('🚀 API Service Initialized:', this.baseURL);
  }

  // Generic request method with comprehensive error handling
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    console.log(`📤 API Request: ${options.method || 'GET'} ${url}`);

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
        // Handle specific HTTP status codes
        switch (response.status) {
          case 401:
            console.warn('🛑 Authentication failed, redirecting to login...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            throw new Error('Session expired. Please login again.');
          
          case 403:
            throw new Error('Access forbidden');
          
          case 404:
            throw new Error('Resource not found');
          
          case 500:
            throw new Error('Server error. Please try again later.');
          
          default:
            throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
        }
      }

      console.log(`✅ API Success: ${options.method || 'GET'} ${endpoint}`);
      return data;

    } catch (error) {
      console.error(`❌ API Error: ${options.method || 'GET'} ${endpoint}`, error.message);
      
      // Don't throw for navigation-related errors
      if (error.message.includes('Session expired')) {
        return; // Let the redirect happen
      }
      
      throw error;
    }
  }

  // ==================== AUTHENTICATION ====================
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials
    });
  }

  async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: userData
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  async verifyEmail(token) {
    return this.request(`/auth/verify-email/${token}`, {
      method: 'GET'
    });
  }

  async resendVerification(email) {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      body: { email }
    });
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: { email }
    });
  }

  async resetPassword(token, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword }
    });
  }

  async verifyResetToken(token) {
    return this.request(`/auth/verify-reset-token/${token}`, {
      method: 'GET'
    });
  }

  // ==================== PLAID BANK INTEGRATION ====================
  async createPlaidLinkToken() {
    return this.request('/accounts/plaid/create-link-token', {
      method: 'POST'
    });
  }

  async exchangePlaidToken(publicToken) {
    return this.request('/accounts/plaid/exchange-token', {
      method: 'POST',
      body: { public_token: publicToken }
    });
  }

  async syncTransactions() {
    return this.request('/accounts/plaid/sync-transactions', {
      method: 'POST'
    });
  }

  async getBankConnectionStatus() {
    return this.request('/accounts/bank-connection-status', {
      method: 'GET'
    });
  }

  // ==================== ACCOUNTS ====================
  async getAccounts() {
    return this.request('/accounts/accounts', {
      method: 'GET'
    });
  }

  async createAccount(accountData) {
    return this.request('/accounts/accounts', {
      method: 'POST',
      body: accountData
    });
  }

  async updateAccount(id, accountData) {
    return this.request(`/accounts/accounts/${id}`, {
      method: 'PUT',
      body: accountData
    });
  }

  async deleteAccount(id) {
    return this.request(`/accounts/accounts/${id}`, {
      method: 'DELETE'
    });
  }

  async getProfile() {
    return this.request('/accounts/profile', {
      method: 'GET'
    });
  }

  async updatePassword(passwordData) {
    return this.request('/accounts/update-password', {
      method: 'PUT',
      body: passwordData
    });
  }

  // ==================== TRANSACTIONS ====================
  async getTransactions(limit = 50) {
    return this.request(`/transactions?limit=${limit}`, {
      method: 'GET'
    });
  }

  async createTransaction(transactionData) {
    return this.request('/transactions', {
      method: 'POST',
      body: transactionData
    });
  }

  async updateTransaction(id, transactionData) {
    return this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: transactionData
    });
  }

  async deleteTransaction(id) {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE'
    });
  }

  async getMonthlyStats(month, year) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    
    return this.request(`/transactions/stats/monthly?${params.toString()}`, {
      method: 'GET'
    });
  }

  async getSpendingByCategory(month, year) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    
    return this.request(`/transactions/stats/categories?${params.toString()}`, {
      method: 'GET'
    });
  }

  // ==================== BUDGETS ====================
  async getBudgets(month, year) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    
    return this.request(`/budgets?${params.toString()}`, {
      method: 'GET'
    });
  }

  async createBudget(budgetData) {
    return this.request('/budgets', {
      method: 'POST',
      body: budgetData
    });
  }

  async updateBudget(id, budgetData) {
    return this.request(`/budgets/${id}`, {
      method: 'PUT',
      body: budgetData
    });
  }

  async deleteBudget(id) {
    return this.request(`/budgets/${id}`, {
      method: 'DELETE'
    });
  }

  // ==================== ALERTS ====================
  async getAlerts() {
    return this.request('/alerts', {
      method: 'GET'
    });
  }

  async createAlert(alertData) {
    return this.request('/alerts', {
      method: 'POST',
      body: alertData
    });
  }

  async updateAlert(id, alertData) {
    return this.request(`/alerts/${id}`, {
      method: 'PUT',
      body: alertData
    });
  }

  async deleteAlert(id) {
    return this.request(`/alerts/${id}`, {
      method: 'DELETE'
    });
  }

  // ==================== DASHBOARD ====================
  async getDashboardData() {
    return this.request('/dashboard/data', {
      method: 'GET'
    });
  }

  // ==================== HEALTH CHECK ====================
  async healthCheck() {
    return this.request('/health', {
      method: 'GET'
    });
  }
}

// Create a singleton instance
const apiService = new ApiService();
export default apiService;