const Transaction = require('../model/Transaction');

exports.getTransactions = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const transactions = await Transaction.findByUserId(req.user.id, parseInt(limit));
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { name, category, amount, type, date, account_id } = req.body;
    
    if (!name || !category || !amount || !type || !date) {
      return res.status(400).json({ error: 'Name, category, amount, type, and date are required' });
    }
    
    const transaction = await Transaction.create(req.user.id, {
      name,
      category,
      amount: parseFloat(amount),
      type,
      date,
      account_id
    });
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, amount, type, date, account_id } = req.body;
    
    const transaction = await Transaction.update(id, {
      name,
      category,
      amount: parseFloat(amount),
      type,
      date,
      account_id
    });
    
    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    await Transaction.delete(id);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

exports.getMonthlyStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const currentMonth = month || currentDate.getMonth() + 1;
    const currentYear = year || currentDate.getFullYear();
    
    const stats = await Transaction.getMonthlyStats(req.user.id, currentMonth, currentYear);
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch monthly stats' });
  }
};

exports.getSpendingByCategory = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const currentMonth = month || currentDate.getMonth() + 1;
    const currentYear = year || currentDate.getFullYear();
    
    const spending = await Transaction.getSpendingByCategory(req.user.id, currentMonth, currentYear);
    res.json(spending);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch spending by category' });
  }
}; 