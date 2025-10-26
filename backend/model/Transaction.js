const db = require('../config/db');

class Transaction {
  static async create(userId, transactionData) {
    const { name, category, amount, type, date, account_id, plaid_transaction_id } = transactionData;
    const result = await db.query(
      'INSERT INTO transactions (user_id, name, category, amount, type, date, account_id, plaid_transaction_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [userId, name, category, amount, type, date, account_id, plaid_transaction_id]
    );
    return result.rows[0];
  }

  static async findByUserId(userId, limit = 10) {
    const result = await db.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC LIMIT $2',
      [userId, limit]
    );
    return result.rows;
  }

  static async getMonthlyStats(userId, month, year) {
    const result = await db.query(
      `SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
        COUNT(*) as total_transactions
       FROM transactions 
       WHERE user_id = $1 AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3`,
      [userId, month, year]
    );
    return result.rows[0];
  }

  static async getSpendingByCategory(userId, month, year) {
    const result = await db.query(
      `SELECT category, SUM(amount) as total_amount, COUNT(*) as transaction_count
       FROM transactions 
       WHERE user_id = $1 AND type = 'expense' 
       AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3
       GROUP BY category 
       ORDER BY total_amount DESC`,
      [userId, month, year]
    );
    return result.rows;
  }

  static async getSpendingByMonth(userId, months = 6) {
    // Returns spending for the last N months, grouped by month and year
    const result = await db.query(
      `SELECT 
        EXTRACT(YEAR FROM date) as year,
        EXTRACT(MONTH FROM date) as month,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
       FROM transactions
       WHERE user_id = $1
       GROUP BY year, month
       ORDER BY year DESC, month DESC
       LIMIT $2`,
      [userId, months]
    );
    return result.rows;
  }

  static async update(id, transactionData) {
    const { name, category, amount, type, date, account_id } = transactionData;
    const result = await db.query(
      'UPDATE transactions SET name = $1, category = $2, amount = $3, type = $4, date = $5, account_id = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [name, category, amount, type, date, account_id, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM transactions WHERE id = $1', [id]);
  }
}

module.exports = Transaction; 