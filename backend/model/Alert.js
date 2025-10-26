const db = require('../config/db');

class Alert {
  static async create(userId, alertData) {
    const { type, category, threshold, message, enabled } = alertData;
    const result = await db.query(
      'INSERT INTO alerts (user_id, type, category, threshold, message, enabled) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, type, category, threshold, message, enabled]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await db.query(
      'SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async update(id, alertData) {
    const { type, category, threshold, message, enabled } = alertData;
    const result = await db.query(
      'UPDATE alerts SET type = $1, category = $2, threshold = $3, message = $4, enabled = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [type, category, threshold, message, enabled, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM alerts WHERE id = $1', [id]);
  }
}

module.exports = Alert; 