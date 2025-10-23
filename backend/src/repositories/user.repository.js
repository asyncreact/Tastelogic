// src/repositories/user.repository.js
import { pool } from "../config/db.js";

export class UserRepository {
  // =========================
  // 🔍 Buscar usuario por email
  // =========================
  static async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
  }

  // =========================
  // 🔍 Buscar usuario por token de verificación
  // =========================
  static async findByToken(token) {
    const result = await pool.query(
      "SELECT * FROM users WHERE verification_token = $1",
      [token]
    );
    return result.rows[0];
  }

  // =========================
  // 🧾 Crear nuevo usuario con expiración del token de verificación
  // =========================
  static async createUser({ name, email, password, verification_token }) {
    const query = `
      INSERT INTO users (name, email, password, verification_token, verification_expires_at)
      VALUES ($1, $2, $3, $4, NOW() + INTERVAL '24 HOURS')
      RETURNING id, name, email, role, is_verified;
    `;
    const result = await pool.query(query, [name, email, password, verification_token]);
    return result.rows[0];
  }

  // =========================
  // ✅ Verificar cuenta (solo si el token está vigente)
  //    - Limpia el token si se usa o si ya expiró
  // =========================
  static async verifyAccount(token) {
    // 1️⃣ Limpia tokens vencidos primero
    await pool.query(`
      UPDATE users
      SET verification_token = NULL,
          verification_expires_at = NULL
      WHERE verification_expires_at < NOW();
    `);

    // 2️⃣ Verifica el token válido y lo limpia
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

  // =========================
  // 🚪 Incrementar token_version (cerrar sesión global)
  // =========================
  static async incrementTokenVersion(userId) {
    const query = `
      UPDATE users
      SET token_version = token_version + 1
      WHERE id = $1
    `;
    await pool.query(query, [userId]);
  }

  // =========================
  // 🔑 Establecer token de restablecimiento con expiración
  // =========================
  static async setResetToken(userId, token) {
    const query = `
      UPDATE users
      SET reset_token = $1,
          reset_token_expires_at = NOW() + INTERVAL '1 HOUR'
      WHERE id = $2
    `;
    await pool.query(query, [token, userId]);
  }

  // =========================
  // 🔍 Buscar usuario por token de restablecimiento válido
  //    - Limpia tokens expirados automáticamente
  // =========================
  static async findByResetToken(token) {
    // 1️⃣ Limpia tokens vencidos antes de verificar
    await pool.query(`
      UPDATE users
      SET reset_token = NULL,
          reset_token_expires_at = NULL
      WHERE reset_token_expires_at < NOW();
    `);

    // 2️⃣ Busca token válido
    const query = `
      SELECT *
      FROM users
      WHERE reset_token = $1
        AND reset_token_expires_at > NOW()
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0];
  }

  // =========================
  // 🔒 Actualizar contraseña, limpiar tokens y cerrar sesiones activas
  // =========================
  static async updatePassword(userId, hashedPassword) {
    const query = `
      UPDATE users
      SET password = $1,
          reset_token = NULL,
          reset_token_expires_at = NULL,
          token_version = token_version + 1  -- 🔹 Invalida todos los JWT antiguos
      WHERE id = $2
    `;
    await pool.query(query, [hashedPassword, userId]);
  }


  // =========================
  // 🧹 Limpiar token de restablecimiento después de usarlo
  // =========================
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
