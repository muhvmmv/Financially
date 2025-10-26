import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { 
  TrendingUp, 
  Plus,
  Edit,
  Trash2,
  DollarSign,
} from 'lucide-react';

function Budgets() {
  const [user, setUser] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
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

        // Fetch budgets
        const budgetsResponse = await axios.get('http://localhost:5000/api/budgets', { headers });
        setBudgets(budgetsResponse.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (editingBudget) {
        // Update existing budget
        await axios.put(`http://localhost:5000/api/budgets/${editingBudget.id}`, formData, { headers });
      } else {
        // Create new budget
        await axios.post('http://localhost:5000/api/budgets', formData, { headers });
      }
      
      // Refresh budgets
      const budgetsResponse = await axios.get('http://localhost:5000/api/budgets', { headers });
      setBudgets(budgetsResponse.data);
      
      // Reset form
      setFormData({
        category: '',
        limit: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });
      setShowAddForm(false);
      setEditingBudget(null);
    } catch (err) {
      console.error('Failed to save budget', err);
      alert('Failed to save budget. Please try again.');
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      limit: budget.limit_amount.toString(),
      month: budget.month,
      year: budget.year
    });
    setShowAddForm(true);
  };

  const handleDelete = async (budgetId) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`http://localhost:5000/api/budgets/${budgetId}`, { headers });
      
      // Refresh budgets
      const budgetsResponse = await axios.get('http://localhost:5000/api/budgets', { headers });
      setBudgets(budgetsResponse.data);
      
      alert('Budget deleted successfully!');
    } catch (err) {
      console.error('Failed to delete budget', err);
      alert('Failed to delete budget. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingBudget(null);
    setFormData({
      category: '',
      limit: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    });
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
    'Other'
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-blue-900">Loading budgets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar user={user} handleLogout={handleLogout} />
      
      {/* Main Content */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Budget Management</h1>
            <p className="text-blue-700">Set and track your monthly spending limits</p>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Budget</span>
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Budget Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-blue-700 font-medium">Total Budget</div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <DollarSign className="text-blue-600 w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  ${budgets.reduce((sum, budget) => sum + parseFloat(budget.limit_amount || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mt-1">This month</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-blue-700 font-medium">Spent</div>
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <TrendingUp className="text-red-600 w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  ${budgets.reduce((sum, budget) => sum + parseFloat(budget.spent_amount || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mt-1">This month</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-blue-700 font-medium">Remaining</div>
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="text-green-600 w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  ${(budgets.reduce((sum, budget) => sum + parseFloat(budget.limit_amount || 0), 0) - 
                     budgets.reduce((sum, budget) => sum + parseFloat(budget.spent_amount || 0), 0)).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mt-1">This month</div>
              </div>
            </div>

            {/* Budget List */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Monthly Budgets</h2>
              </div>
              
              <div className="p-6">
                {budgets.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="text-gray-400 w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets set</h3>
                    <p className="text-gray-600 mb-4">Create your first budget to start tracking your spending</p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Budget
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {budgets.map((budget) => (
                      <div key={budget.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900">{budget.category}</h3>
                            <div className="flex items-center gap-2">
                              <button 
                                className="p-1 text-gray-400 hover:text-blue-600"
                                onClick={() => handleEdit(budget)}
                                title="Edit budget"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                className="p-1 text-gray-400 hover:text-red-600"
                                onClick={() => handleDelete(budget.id)}
                                title="Delete budget"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>${budget.spent_amount || 0} / ${budget.limit_amount}</span>
                            <span>{Math.round((budget.spent_amount || 0) / budget.limit_amount * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                (budget.spent_amount || 0) / budget.limit_amount > 0.9 
                                  ? 'bg-red-500' 
                                  : (budget.spent_amount || 0) / budget.limit_amount > 0.7 
                                    ? 'bg-yellow-500' 
                                    : 'bg-green-500'
                              }`}
                              style={{ 
                                width: `${Math.min((budget.spent_amount || 0) / budget.limit_amount * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Budget Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingBudget ? 'Edit Budget' : 'Add New Budget'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Limit</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.limit}
                      onChange={(e) => setFormData({...formData, limit: e.target.value})}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                    <select
                      value={formData.month}
                      onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {months.map((month, index) => (
                        <option key={index + 1} value={index + 1}>{month}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                      min={new Date().getFullYear() - 1}
                      max={new Date().getFullYear() + 1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingBudget ? 'Update Budget' : 'Add Budget'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Budgets; 