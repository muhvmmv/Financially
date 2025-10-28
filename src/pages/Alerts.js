import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { 
  Bell, 
  Plus,
  Settings,
  AlertTriangle,
  CheckCircle,
  X,
  DollarSign,
  TrendingUp
} from 'lucide-react';

function Alerts() {
  const [user, setUser] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'budget_exceeded',
    threshold: '',
    category: '',
    message: '',
    enabled: true
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
        // Fetch real alerts
        const alertsResponse = await axios.get('http://localhost:5000/api/alerts', { headers });
        setAlerts(alertsResponse.data);
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
      const newAlert = {
        ...formData,
        threshold: formData.threshold || null,
        message: getAlertMessage(formData.type, formData.category, formData.threshold)
      };
      const res = await axios.post('http://localhost:5000/api/alerts', newAlert, { headers });
      setAlerts([res.data, ...alerts]);
      setFormData({
        type: 'budget_exceeded',
        threshold: '',
        category: '',
        message: '',
        enabled: true
      });
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to add alert', err);
      alert('Failed to add alert. Please try again.');
    }
  };

  const getAlertTitle = (type) => {
    switch (type) {
      case 'budget_exceeded': return 'Budget Alert';
      case 'low_balance': return 'Low Balance Alert';
      case 'unusual_spending': return 'Unusual Spending';
      default: return 'Custom Alert';
    }
  };

  const getAlertMessage = (type, category, threshold) => {
    switch (type) {
      case 'budget_exceeded': return `You have exceeded your ${category} budget by ${threshold}%`;
      case 'low_balance': return `Your account balance is below $${threshold}`;
      case 'unusual_spending': return `Unusual spending pattern detected in ${category}`;
      default: return 'Custom alert message';
    }
  };

  const toggleAlert = async (alertId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const alert = alerts.find(a => a.id === alertId);
      const updated = { ...alert, enabled: !alert.enabled };
      const res = await axios.put(`http://localhost:5000/api/alerts/${alertId}`, updated, { headers });
      setAlerts(alerts.map(a => a.id === alertId ? res.data : a));
    } catch (err) {
      alert('Failed to update alert.');
    }
  };

  const deleteAlert = async (alertId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`http://localhost:5000/api/alerts/${alertId}`, { headers });
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (err) {
      alert('Failed to delete alert.');
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
    'Other'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-blue-900">Loading alerts...</div>
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
            <h1 className="text-2xl font-bold text-blue-900">Alerts & Notifications</h1>
            <p className="text-blue-700">Manage your financial alerts and notifications</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Alert</span>
          </button>
        </header>
        {/* Content */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Alert Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-blue-700 font-medium">Total Alerts</div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bell className="text-blue-600 w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-900">{alerts.length}</div>
                <div className="text-sm text-gray-600 mt-1">Configured alerts</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-blue-700 font-medium">Active Alerts</div>
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="text-green-600 w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {alerts.filter(alert => alert.enabled).length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Currently enabled</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-blue-700 font-medium">Recent Triggers</div>
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <AlertTriangle className="text-orange-600 w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-600">{alerts.length}</div>
                <div className="text-sm text-gray-600 mt-1">This week</div>
              </div>
            </div>
            {/* Alerts List */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Your Alerts</h2>
              </div>
              <div className="p-6">
                {alerts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Bell className="text-gray-400 w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts configured</h3>
                    <p className="text-gray-600 mb-4">Create your first alert to stay informed about your finances</p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Alert
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            alert.enabled ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            {alert.enabled ? (
                              <CheckCircle className="text-green-600 w-5 h-5" />
                            ) : (
                              <Bell className="text-gray-400 w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-gray-900">{getAlertTitle(alert.type)}</h3>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleAlert(alert.id)}
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    alert.enabled 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {alert.enabled ? 'Active' : 'Inactive'}
                                </button>
                                <button
                                  onClick={() => deleteAlert(alert.id)}
                                  className="p-1 text-gray-400 hover:text-red-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{alert.message}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{alert.category}</span>
                              <span>•</span>
                              <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                            </div>
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
        {/* Add Alert Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Alert</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alert Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="budget_exceeded">Budget Exceeded</option>
                    <option value="low_balance">Low Balance</option>
                    <option value="unusual_spending">Unusual Spending</option>
                  </select>
                </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Threshold</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">
                      {formData.type === 'budget_exceeded' ? '%' : '$'}
                    </span>
                    <input
                      type="number"
                      value={formData.threshold}
                      onChange={(e) => setFormData({...formData, threshold: e.target.value})}
                      placeholder={formData.type === 'budget_exceeded' ? '85' : '500'}
                      step="1"
                      min="0"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({...formData, enabled: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="enabled" className="text-sm text-gray-700">
                    Enable this alert immediately
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Alert
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

export default Alerts; 