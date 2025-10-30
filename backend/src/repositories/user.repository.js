// src/repositories/user.repository.js
import { pool } from "../config/db.js";

export class UserRepository {
  static async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
  }

  static async findByToken(token) {
    const result = await pool.query(
      "SELECT * FROM users WHERE verification_token = $1",
      [token]
    );
    return result.rows[0];
  }

  static async createUser({ name, email, password, verification_token }) {
    const query = `
      INSERT INTO users (name, email, password, verification_token, verification_expires_at)
      VALUES ($1, $2, $3, $4, NOW() + INTERVAL '24 HOURS')
      RETURNING id, name, email, role, is_verified;
    `;
    const result = await pool.query(query, [name, email, password, verification_token]);
    return result.rows[0];
  }

  static async verifyAccount(token) {
    await pool.query(`
      UPDATE users
      SET verification_token = NULL,
          verification_expires_at = NULL
      WHERE verification_expires_at < NOW();
    `);

    const query = `
      UPDATE users
      SET is_verified = TRUE,
          verification_token = NULL,
          verification_expires_at = NULL
      WHERE verification_token = $1
        AND verification_expires_at > NOW()
      RETURNING id, name, email, role, is_verified;
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0];
  }

  static async incrementTokenVersion(userId) {
    const query = `
      UPDATE users
      SET token_version = token_version + 1
      WHERE id = $1
    `;
    await pool.query(query, [userId]);
  }

  static async setResetToken(userId, token) {
    const query = `
      UPDATE users
      SET reset_token = $1,
          reset_token_expires_at = NOW() + INTERVAL '1 HOUR'
      WHERE id = $2
    `;
    await pool.query(query, [token, userId]);
  }

  static async findByResetToken(token) {
    await pool.query(`
      UPDATE users
      SET reset_token = NULL,
          reset_token_expires_at = NULL
      WHERE reset_token_expires_at < NOW();
    `);

    const query = `
      SELECT *
      FROM users
      WHERE reset_token = $1
        AND reset_token_expires_at > NOW()
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0];
  }

  static async updatePassword(userId, hashedPassword) {
    const query = `
      UPDATE users
      SET password = $1,
          reset_token = NULL,
          reset_token_expires_at = NULL,
          token_version = token_version + 1
      WHERE id = $2
    `;
    await pool.query(query, [hashedPassword, userId]);
  }

  static async clearResetToken(userId) {
    const query = `
      UPDATE users
      SET reset_token = NULL,
          reset_token_expires_at = NULL
      WHERE id = $1
    `;
    await pool.query(query, [userId]);
  }
}
