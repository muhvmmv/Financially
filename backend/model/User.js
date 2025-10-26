const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  static async create(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (email, password_hash) 
       VALUES ($1, $2) RETURNING id, email, created_at`,
      [email, hashedPassword]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1', 
      [email]
    );
    return result.rows[0];
  }

  static async setBankConnected(userId, connected) {
    await db.query(
      'UPDATE users SET bank_connected = $1 WHERE id = $2',
      [connected, userId]
    );
  }

  static async isBankConnected(userId) {
    const result = await db.query(
      'SELECT bank_connected FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0]?.bank_connected || false;
  }
}

module.exports = User;
