const db = require('../config/db');

class Account {
  static async create(userId, accountData) {
    const { name, bank, balance, type, plaid_account_id } = accountData;
    const result = await db.query(
      'INSERT INTO accounts (user_id, name, bank, balance, type, plaid_account_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, name, bank, balance, type, plaid_account_id]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await db.query(
      'SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async update(id, accountData) {
    const { name, bank, balance, type, plaid_account_id } = accountData;
    const result = await db.query(
      'UPDATE accounts SET name = $1, bank = $2, balance = $3, type = $4, plaid_account_id = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [name, bank, balance, type, plaid_account_id, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM accounts WHERE id = $1', [id]);
  }

  static async getTotalBalance(userId) {
    const result = await db.query(
      'SELECT SUM(balance) as total_balance FROM accounts WHERE user_id = $1',
      [userId]
    );
    return result.rows[0].total_balance || 0;
  }

  static async deleteAllForUser(userId) {
    await db.query('DELETE FROM accounts WHERE user_id = $1', [userId]);
  }
}

module.exports = Account;
