const Account = require('../model/Account');
const Transaction = require('../model/Transaction');
const Budget = require('../model/Budget');
const db = require('../config/db');
const User = require('../model/User');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Check if user has connected their bank
    const bankConnected = await User.isBankConnected(userId);
    if (!bankConnected) {
      return res.json({ bankConnected: false });
    }

    // Check if new tables exist
    const tablesExist = await checkTablesExist();
    if (tablesExist) {
      // Use real data from new tables
      return await getRealDashboardData(userId, currentMonth, currentYear, res);
    } else {
      // If tables don't exist, return empty dashboard
      return res.json({ bankConnected: true, netWorth: 0, income: 0, expenses: 0, savingsRate: 0, accounts: [], transactions: [], budgets: [], spendingByCategory: [] });
    }
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

async function checkTablesExist() {
  try {
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('accounts', 'transactions', 'budgets')
    `);
    return result.rows.length === 3;
  } catch (error) {
    return false;
  }
}

async function getRealDashboardData(userId, currentMonth, currentYear, res) {
  // Get accounts
  const accounts = await Account.findByUserId(userId);
  const totalBalance = await Account.getTotalBalance(userId);

  // Get monthly transaction stats
  const monthlyStats = await Transaction.getMonthlyStats(userId, currentMonth, currentYear);

  // Get recent transactions
  const recentTransactions = await Transaction.findByUserId(userId, 5);

  // Get budgets with spending data
  const budgets = await Budget.findByUserId(userId, currentMonth, currentYear);

  // Get spending by category
  const spendingByCategory = await Transaction.getSpendingByCategory(userId, currentMonth, currentYear);

  // Get spending by month for the last 6 months
  const spendingByMonth = await Transaction.getSpendingByMonth(userId, 6);

  // Calculate net worth (total balance)
  const netWorth = totalBalance;

  // Calculate savings rate
  const income = monthlyStats.total_income || 0;
  const expenses = monthlyStats.total_expenses || 0;
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

  // Calculate total spending for category percentages
  const totalSpending = spendingByCategory.reduce((sum, cat) => sum + parseFloat(cat.total_amount), 0);

  // Add percentage to spending by category
  const spendingWithPercentages = spendingByCategory.map(cat => ({
    ...cat,
    percentage: totalSpending > 0 ? Math.round((parseFloat(cat.total_amount) / totalSpending) * 100) : 0
  }));

  res.json({
    netWorth,
    income,
    expenses,
    savingsRate,
    accounts,
    transactions: recentTransactions,
    budgets,
    spendingByCategory: spendingWithPercentages,
    spendingByMonth
  });
}

async function getSampleDashboardData(userId, res) {
  // Sample data for when tables don't exist
  const sampleData = {
    netWorth: 278378,
    income: 24050,
    expenses: 9228,
    savingsRate: 62,
    accounts: [
      { id: 1, name: 'Checking Account', bank: 'Chase', balance: 12560.45, type: 'bank' },
      { id: 2, name: 'Savings Account', bank: 'Bank of America', balance: 34520.89, type: 'bank' },
      { id: 3, name: 'Investment Portfolio', bank: 'Fidelity', balance: 138500.32, type: 'investment' },
      { id: 4, name: 'Credit Card', bank: 'American Express', balance: -4520.67, type: 'credit' },
    ],
    transactions: [
      { id: 1, name: 'Amazon Purchase', category: 'Shopping', date: '2025-01-15', amount: -89.99, type: 'expense' },
      { id: 2, name: 'Salary Deposit', category: 'Income', date: '2025-01-10', amount: 4500.00, type: 'income' },
      { id: 3, name: 'Whole Foods', category: 'Groceries', date: '2025-01-08', amount: -124.50, type: 'expense' },
      { id: 4, name: 'Netflix Subscription', category: 'Entertainment', date: '2025-01-05', amount: -15.99, type: 'expense' },
      { id: 5, name: 'Stock Dividend', category: 'Investment', date: '2025-01-01', amount: 230.45, type: 'income' },
    ],
    budgets: [
      { id: 1, category: 'Housing', spent_amount: 1200, limit_amount: 1500, progress_percentage: 80 },
      { id: 2, category: 'Food', spent_amount: 485, limit_amount: 600, progress_percentage: 81 },
      { id: 3, category: 'Transportation', spent_amount: 320, limit_amount: 400, progress_percentage: 80 },
      { id: 4, category: 'Entertainment', spent_amount: 150, limit_amount: 200, progress_percentage: 75 },
    ],
    spendingByCategory: [
      { category: 'Shopping', total_amount: 2425.92, percentage: 42 },
      { category: 'Groceries', total_amount: 485.18, percentage: 28 },
      { category: 'Dining & Drinks', total_amount: 161.73, percentage: 15 },
      { category: 'Fitness', total_amount: 97.04, percentage: 8 },
      { category: 'Subscriptions', total_amount: 64.49, percentage: 7 },
    ]
  };

  res.json(sampleData);
} 