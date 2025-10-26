const db = require('../config/db');

class Budget {
  static async create(userId, budgetData) {
    const { category, limit, month, year } = budgetData;
    const result = await db.query(
      'INSERT INTO budgets (user_id, category, limit_amount, month, year) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, category, limit, month, year]
    );
    return result.rows[0];
  }

  static async findByUserId(userId, month, year) {
    const result = await db.query(
      `SELECT b.*, 
        COALESCE(SUM(t.amount), 0) as spent_amount,
        CASE WHEN b.limit_amount > 0 THEN (COALESCE(SUM(t.amount), 0) / b.limit_amount * 100) ELSE 0 END as progress_percentage
       FROM budgets b
       LEFT JOIN transactions t ON b.user_id = t.user_id 
         AND b.category = t.category 
         AND t.type = 'expense'
         AND EXTRACT(MONTH FROM t.date) = b.month 
         AND EXTRACT(YEAR FROM t.date) = b.year
       WHERE b.user_id = $1 AND b.month = $2 AND b.year = $3
       GROUP BY b.id, b.category, b.limit_amount, b.month, b.year
       ORDER BY b.category`,
      [userId, month, year]
    );
    return result.rows;
  }

  static async update(id, budgetData) {
    const { category, limit, month, year } = budgetData;
    const result = await db.query(
      'UPDATE budgets SET category = $1, limit_amount = $2, month = $3, year = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [category, limit, month, year, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM budgets WHERE id = $1', [id]);
  }
}

module.exports = Budget; 