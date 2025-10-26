import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaidLink } from 'react-plaid-link';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { 
  User,   
  Shield, 
  Edit,
  Save,
  X,
  Bell,
  Lock,
  Globe,
  CreditCard,
  Unlink,
  Plus
} from 'lucide-react';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [accounts, setAccounts] = useState([]);
  const [linkToken, setLinkToken] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    privacyMode: false,
    dataSharing: true,
    autoSync: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get('http://localhost:5000/api/accounts/profile', { headers });
        setUser(response.data);
        setFormData({
          name: response.data.name || '',
          email: response.data.email || ''
        });

        // Fetch connected accounts
        try {
          const accountsResponse = await axios.get('http://localhost:5000/api/accounts/accounts', { headers });
          setAccounts(accountsResponse.data);
        } catch (err) {
          console.error('Failed to fetch accounts', err);
          // Only show real connected accounts, no mock data
          setAccounts([]);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Fetch Plaid link token for bank connection
  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.post('http://localhost:5000/api/accounts/plaid/create-link-token', {}, { headers });
        setLinkToken(res.data.link_token);
      } catch (err) {
        console.error('Failed to fetch Plaid link token', err);
      }
    };
    fetchLinkToken();
  }, []);

  const onPlaidSuccess = useCallback(async (public_token, metadata) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post('http://localhost:5000/api/accounts/plaid/exchange-token', { public_token }, { headers });
      
      // Refresh accounts after successful connection
      const accountsResponse = await axios.get('http://localhost:5000/api/accounts/accounts', { headers });
      setAccounts(accountsResponse.data);
      
      alert('Bank account connected successfully!');
    } catch (err) {
      console.error('Failed to connect bank account', err);
      alert('Failed to connect bank account. Please try again.');
    }
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      // Add API call to update profile here
      setEditing(false);
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  const handleSettingsChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleConnectBank = () => {
    if (ready && linkToken) {
      open();
    } else {
      alert('Bank connection is not ready. Please try again in a moment.');
    }
  };

  const handleDisconnectAccount = async (accountId) => {
    if (window.confirm('Are you sure you want to disconnect this account? This will remove all associated transaction data.')) {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        // Add API call to disconnect account here
        setAccounts(accounts.filter(account => account.id !== accountId));
        alert('Account disconnected successfully');
      } catch (err) {
        console.error('Failed to disconnect account', err);
        alert('Failed to disconnect account. Please try again.');
      }
    }
  };

  const getAccountTypeIcon = (accountType) => {
    switch (accountType) {
      case 'checking':
        return <CreditCard className="w-5 h-5" />;
      case 'savings':
        return <Globe className="w-5 h-5" />;
      case 'credit':
        return <CreditCard className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getAccountTypeColor = (accountType) => {
    switch (accountType) {
      case 'checking':
        return 'bg-blue-100 text-blue-600';
      case 'savings':
        return 'bg-green-100 text-green-600';
      case 'credit':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-blue-900">Loading profile...</div>
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
            <h1 className="text-2xl font-bold text-blue-900">Profile & Settings</h1>
            <p className="text-blue-700">Manage your account and preferences</p>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Tabs */}
            <div className="mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'settings'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Settings
                </button>
              </div>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm border">
                {/* Profile Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-900">
                          {user?.name ? user.name.charAt(0) : 'U'}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">{user?.name || 'User'}</h2>
                        <p className="text-gray-600">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditing(!editing)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                      <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
                    </button>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="px-6 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Personal Information
                      </h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          {editing ? (
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="text-gray-900">{user?.name || 'Not set'}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          {editing ? (
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="text-gray-900">{user?.email}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                          <p className="text-gray-900">
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Account Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Account Information
                      </h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                          <p className="text-gray-900">Premium Member</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                          <p className="text-gray-900">Today</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  {editing && (
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Connected Accounts */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Connected Accounts
                      </h3>
                      <button 
                        onClick={handleConnectBank}
                        disabled={!ready || !linkToken}
                        className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Connect Bank</span>
                      </button>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    {accounts.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                          <CreditCard className="text-gray-400 w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts connected</h3>
                        <p className="text-gray-600 mb-4">Connect your bank accounts to start tracking your finances</p>
                        <button 
                          onClick={handleConnectBank}
                          disabled={!ready || !linkToken}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Connect Your First Account
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {accounts.map((account) => (
                          <div key={account.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAccountTypeColor(account.account_type)}`}>
                                {getAccountTypeIcon(account.account_type)}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{account.name}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span>{account.bank}</span>
                                  <span>•</span>
                                  <span className="capitalize">{account.account_type}</span>
                                  <span>•</span>
                                  <span>Last sync: {new Date(account.last_sync).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="font-medium text-gray-900">${account.balance.toLocaleString()}</div>
                                <div className="text-sm text-gray-600">Current Balance</div>
                              </div>
                              <button
                                onClick={() => handleDisconnectAccount(account.id)}
                                className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Unlink className="w-4 h-4" />
                                <span>Disconnect</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notifications
                    </h3>
                  </div>
                  <div className="px-6 py-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive updates via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.emailNotifications}
                          onChange={(e) => handleSettingsChange('emailNotifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Push Notifications</p>
                        <p className="text-sm text-gray-600">Get instant alerts on your device</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.pushNotifications}
                          onChange={(e) => handleSettingsChange('pushNotifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">SMS Notifications</p>
                        <p className="text-sm text-gray-600">Receive text message alerts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.smsNotifications}
                          onChange={(e) => handleSettingsChange('smsNotifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Privacy & Security */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Privacy & Security
                    </h3>
                  </div>
                  <div className="px-6 py-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Privacy Mode</p>
                        <p className="text-sm text-gray-600">Hide sensitive financial data</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacyMode}
                          onChange={(e) => handleSettingsChange('privacyMode', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Data Sharing</p>
                        <p className="text-sm text-gray-600">Allow anonymous data for improvements</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.dataSharing}
                          onChange={(e) => handleSettingsChange('dataSharing', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Account Preferences */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Account Preferences
                    </h3>
                  </div>
                  <div className="px-6 py-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Auto Sync</p>
                        <p className="text-sm text-gray-600">Automatically sync with your bank</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoSync}
                          onChange={(e) => handleSettingsChange('autoSync', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile; 