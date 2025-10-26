const Budget = require('../model/Budget');

exports.getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const currentMonth = month || currentDate.getMonth() + 1;
    const currentYear = year || currentDate.getFullYear();
    
    const budgets = await Budget.findByUserId(req.user.id, currentMonth, currentYear);
    res.json(budgets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const { category, limit, month, year } = req.body;
    
    if (!category || !limit || !month || !year) {
      return res.status(400).json({ error: 'Category, limit, month, and year are required' });
    }
    
    const budget = await Budget.create(req.user.id, {
      category,
      limit: parseFloat(limit),
      month: parseInt(month),
      year: parseInt(year)
    });
    
    res.status(201).json(budget);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, limit, month, year } = req.body;
    
    const budget = await Budget.update(id, {
      category,
      limit: parseFloat(limit),
      month: parseInt(month),
      year: parseInt(year)
    });
    
    res.json(budget);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    await Budget.delete(id);
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
}; 