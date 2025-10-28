import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { usePlaidLink } from 'react-plaid-link';
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  PieChart, 
  TrendingUp, 
  CreditCard, 
  DollarSign, 
  Users, 
  Bell, 
  ChevronDown, 
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  LogOut,
  RefreshCw
} from 'lucide-react';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Dashboard() {
  const [linkToken, setLinkToken] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    netWorth: 0,
    income: 0,
    expenses: 0,
    savingsRate: 0,
    accounts: [],
    transactions: [],
    budgets: [],
    spendingByCategory: []
  });
  const [bankConnected, setBankConnected] = useState(true);
  const navigate = useNavigate();
  const [spendingMonths, setSpendingMonths] = useState(6);
  const [alertsCount, setAlertsCount] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`
        };

        // Fetch user profile
        const userResponse = await axios.get('http://localhost:5000/api/accounts/profile', { headers });
        setUser(userResponse.data);

        // Fetch dashboard data
        const dashboardResponse = await axios.get('http://localhost:5000/api/dashboard/data', { headers });
        setDashboardData(dashboardResponse.data);
        setBankConnected(dashboardResponse.data.bankConnected !== false);
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
    if (!bankConnected) fetchLinkToken();
  }, [bankConnected]);
  const onPlaidSuccess = useCallback(async (public_token, metadata) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post('http://localhost:5000/api/accounts/plaid/exchange-token', { public_token }, { headers });
      // Refetch dashboard data
      setLoading(true);
      const dashboardResponse = await axios.get('http://localhost:5000/api/dashboard/data', { headers });
      setDashboardData(dashboardResponse.data);
      setBankConnected(true);
    } catch (err) {
      alert('Failed to connect bank.');
    } finally {
      setLoading(false);
    }
  }, []);
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
  });
  
  console.log('linkToken:', linkToken, 'ready:', ready);
  
  useEffect(() => {
    // Fetch alert count for badge
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get('http://localhost:5000/api/alerts', { headers });
        setAlertsCount(res.data.length || 0);
      } catch (err) {
        setAlertsCount(0);
      }
    };
    fetchAlerts();
  }, []);
  
  const handleSyncTransactions = async () => {
    try {
      setSyncing(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.post('http://localhost:5000/api/accounts/plaid/sync-transactions', {}, { headers });
      
      // Refetch dashboard data
      const dashboardResponse = await axios.get('http://localhost:5000/api/dashboard/data', { headers });
      setDashboardData(dashboardResponse.data);
      
      alert('Transactions synced successfully!');
    } catch (err) {
      console.error('Failed to sync transactions', err);
      alert('Failed to sync transactions. Please try again.');
    } finally {
      setSyncing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-blue-900">Loading your financial dashboard...</div>
      </div>
    );
  }

  if (!bankConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-2xl text-blue-900 mb-6 font-bold">Connect bank to get started</div>
        <button
          onClick={() => open()}
          disabled={!ready || !linkToken}
          className="px-6 py-3 bg-blue-900 text-yellow-400 rounded-lg font-bold text-lg hover:bg-blue-800 transition"
        >
          Connect Bank
        </button>
      </div>
    );
  }

  // Color mapping for spending categories
  const categoryColors = [
    'from-yellow-500 to-yellow-400',
    'from-blue-500 to-blue-400',
    'from-green-500 to-green-400',
    'from-purple-500 to-purple-400',
    'from-red-500 to-red-400',
    'from-indigo-500 to-indigo-400',
    'from-pink-500 to-pink-400',
    'from-orange-500 to-orange-400'
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar user={user} handleLogout={handleLogout} />
      
      {/* Main Content */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-blue-900">Financial Dashboard</h1>
            <p className="text-blue-700">Your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              className="p-2 rounded-full hover:bg-gray-100 relative" 
              onClick={() => navigate('/alerts')}
            >
              <Bell className="text-blue-900 w-5 h-5" />
              {alertsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                  {alertsCount}
                </span>
              )}
            </button>
            
            <button 
              className={`p-2 rounded-full hover:bg-gray-100 ${syncing ? 'animate-spin' : ''}`}
              onClick={handleSyncTransactions}
              disabled={syncing}
              title="Sync transactions from bank"
            >
              <RefreshCw className="text-blue-900 w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 flex items-center justify-center">
                  <span className="font-bold text-blue-900">
                    {user?.name ? user.name.charAt(0) : 'U'}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-blue-900">
                    {user?.name || 'User'}
                  </div>
                </div>
                <ChevronDown className="text-blue-700 w-4 h-4" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <div className="text-blue-700 font-medium">Net Worth</div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <PieChart className="text-blue-900 w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-900">${dashboardData.netWorth.toLocaleString()}</div>
            <div className="text-green-500 text-sm mt-1 flex items-center">
              <ArrowUpRight className="w-4 h-4 mr-1" /> 12.5% from last month
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <div className="text-blue-700 font-medium">Income</div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="text-blue-900 w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-green-500">${dashboardData.income.toLocaleString()}</div>
            <div className="text-blue-700 text-sm mt-1">Monthly income</div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <div className="text-blue-700 font-medium">Expenses</div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <CreditCard className="text-blue-900 w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-500">${dashboardData.expenses.toLocaleString()}</div>
            <div className="text-blue-700 text-sm mt-1">Monthly expenses</div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <div className="text-blue-700 font-medium">Savings Rate</div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="text-blue-900 w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-900">{dashboardData.savingsRate}%</div>
            <div className="text-blue-700 text-sm mt-1">Of monthly income</div>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Spending Chart */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg text-blue-900">Spending Analysis</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={spendingMonths}
                    onChange={e => setSpendingMonths(Number(e.target.value))}
                    className="text-blue-700 text-sm border border-blue-200 rounded px-2 py-1"
                  >
                    <option value={3}>Last 3 months</option>
                    <option value={6}>Last 6 months</option>
                    <option value={12}>Last 12 months</option>
                  </select>
                  <ChevronDown className="w-4 h-4 ml-1 text-blue-700" />
                </div>
              </div>
              <div className="h-64 flex items-end justify-between">
                {(dashboardData.spendingByMonth || [])
                  .slice(0, spendingMonths)
                  .reverse()
                  .map((item, index) => (
                  <div key={index} className="flex flex-col items-center w-1/6">
                    <div className="flex justify-center items-end h-40 w-full">
                      <div 
                        className="w-3/4 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-md"
                        style={{ height: `${Math.min((item.total_expenses / Math.max(...dashboardData.spendingByMonth.map(m => Number(m.total_expenses) || 1)), 1) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-blue-700 mt-2">
                      {monthNames[(item.month - 1)]} {item.year}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent Transactions */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg text-blue-900">Recent Transactions</h2>
                <button 
                  onClick={() => navigate('/transactions')}
                  className="text-blue-700 text-sm hover:text-blue-900 transition-colors"
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {dashboardData.transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">No recent transactions</div>
                    <button 
                      onClick={() => navigate('/transactions')}
                      className="text-blue-700 text-sm hover:text-blue-900 transition-colors"
                    >
                      View All Transactions
                    </button>
                  </div>
                ) : (
                  dashboardData.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <ArrowDownRight className="text-green-500 w-5 h-5" />
                          ) : (
                            <ArrowUpRight className="text-red-500 w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-blue-900">{transaction.name}</div>
                          <div className="text-sm text-blue-700">{transaction.category} • {new Date(transaction.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className={`font-medium ${
                        transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-4">
            {/* Budgets */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg text-blue-900">Budget Overview</h2>
                <button 
                  onClick={() => navigate('/budgets')}
                  className="text-blue-700 text-sm hover:text-blue-900 transition-colors"
                >
                  Edit Budgets
                </button>
              </div>
              
              <div className="space-y-5">
                {dashboardData.budgets.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="text-gray-500 mb-2">No budgets set</div>
                    <button 
                      onClick={() => navigate('/budgets')}
                      className="text-blue-700 text-sm hover:text-blue-900 transition-colors"
                    >
                      Create Budget
                    </button>
                  </div>
                ) : (
                  dashboardData.budgets.map((budget, index) => (
                    <div key={budget.id}>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="text-blue-700">{budget.category}</span>
                        <span className="text-blue-900 font-medium">${budget.spent_amount || 0} / ${budget.limit_amount}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(budget.progress_percentage || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Spending by Category */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
              <h2 className="font-bold text-lg text-blue-900 mb-6">Spending by Category</h2>
              
              <div className="space-y-4">
                {dashboardData.spendingByCategory.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-blue-700">{item.category}</span>
                      <span className="text-blue-900 font-medium">${parseFloat(item.total_amount).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${categoryColors[index % categoryColors.length]}`} 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Net Worth */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-xl p-5">
              <h2 className="font-bold text-lg mb-1">Net Worth</h2>
              <p className="text-blue-300 mb-4">Total assets minus liabilities</p>
              
              <div className="text-3xl font-bold mb-4">${dashboardData.netWorth.toLocaleString()}</div>
              
              <div className="flex justify-between text-sm">
                <div>
                  <div className="text-blue-300">Assets</div>
                  <div className="font-medium">${dashboardData.netWorth.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-blue-300">Liabilities</div>
                  <div className="font-medium">$0</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}