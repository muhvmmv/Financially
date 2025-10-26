import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { 
  CreditCard, 
  DollarSign, 
  Calendar,
  Tag,
  Plus,
  ArrowLeft
} from 'lucide-react';

function AddTransaction() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    account_id: ''
  });
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndAccounts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch user profile
        const userResponse = await axios.get('http://localhost:5000/api/accounts/profile', { headers });
        setUser(userResponse.data);

        // Fetch accounts
        const accountsResponse = await axios.get('http://localhost:5000/api/accounts/accounts', { headers });
        setAccounts(accountsResponse.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchUserAndAccounts();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.post('http://localhost:5000/api/transactions', formData, { headers });
      
      // Reset form
      setFormData({
        name: '',
        amount: '',
        category: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        account_id: ''
      });

      alert('Transaction added successfully!');
      navigate('/transactions');
    } catch (err) {
      console.error('Failed to add transaction', err);
      alert('Failed to add transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Food & Dining',
    'Shopping',
    'Transportation',
    'Entertainment',
    'Healthcare',
    'Housing',
    'Utilities',
    'Education',
    'Travel',
    'Income',
    'Investment',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar user={user} handleLogout={handleLogout} />
      
      {/* Main Content */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/transactions')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Transactions</span>
            </button>
          </div>
          <h1 className="text-2xl font-bold text-blue-900">Add Transaction</h1>
        </header>

        {/* Form Content */}
        <div className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Plus className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">New Transaction</h2>
                  <p className="text-gray-600">Add a new income or expense transaction</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Transaction Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="expense"
                        checked={formData.type === 'expense'}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="mr-2"
                      />
                      <span className="text-red-600 font-medium">Expense</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="income"
                        checked={formData.type === 'income'}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="mr-2"
                      />
                      <span className="text-green-600 font-medium">Income</span>
                    </label>
                  </div>
                </div>

                {/* Transaction Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Grocery shopping, Salary deposit"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Account */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
                  <select
                    value={formData.account_id}
                    onChange={(e) => setFormData({...formData, account_id: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select an account (optional)</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} - ${account.balance}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/transactions')}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Adding...' : 'Add Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddTransaction;
