import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { 
  CreditCard, 
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign
} from 'lucide-react';

function Transactions() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
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

        // Fetch transactions
        const transactionsResponse = await axios.get('http://localhost:5000/api/transactions', { headers });
        setTransactions(transactionsResponse.data);
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

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

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

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-blue-900">Loading transactions...</div>
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
            <h1 className="text-2xl font-bold text-blue-900">Transactions</h1>
            <p className="text-blue-700">View and manage your financial transactions</p>
          </div>
          
          <button
            onClick={() => navigate('/transactions/add')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Transaction</span>
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-blue-700 font-medium">Total Transactions</div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <CreditCard className="text-blue-600 w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-900">{transactions.length}</div>
                <div className="text-sm text-gray-600 mt-1">All time</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-blue-700 font-medium">Total Income</div>
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <ArrowDownRight className="text-green-600 w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</div>
                <div className="text-sm text-gray-600 mt-1">All time</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-blue-700 font-medium">Total Expenses</div>
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <ArrowUpRight className="text-red-600 w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
                <div className="text-sm text-gray-600 mt-1">All time</div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setFilterCategory('all');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Transactions ({filteredTransactions.length})
                </h2>
              </div>
              
              <div className="p-6">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="text-gray-400 w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                    <p className="text-gray-600 mb-4">
                      {transactions.length === 0 
                        ? "You haven't added any transactions yet" 
                        : "Try adjusting your search or filters"
                      }
                    </p>
                    {transactions.length === 0 && (
                      <button
                        onClick={() => navigate('/transactions/add')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Your First Transaction
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {transaction.type === 'income' ? (
                              <ArrowDownRight className="text-green-600 w-5 h-5" />
                            ) : (
                              <ArrowUpRight className="text-red-600 w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{transaction.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(transaction.date).toLocaleDateString()}
                              </span>
                              <span>•</span>
                              <span>{transaction.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`font-bold text-lg ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Transactions; 