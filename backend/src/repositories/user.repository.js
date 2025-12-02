// src/repositories/user.repository.js

import { pool } from "../config/db.js";

/* Valida que un ID sea un número positivo válido */
const validateId = (id) => {
  const numId = Number(id);
  return isNaN(numId) || numId <= 0 ? null : numId;
};

/* Valida que un email tenga un formato correcto */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new Error("Email inválido");
  }
  return email.toLowerCase();
};

/* Maneja errores comunes de PostgreSQL */
const handleDatabaseError = (error) => {
  if (error.code === "23505") {
    throw new Error("Este registro ya existe (violación de unicidad)");
  }
  if (error.code === "23503") {
    throw new Error("Referencia a un registro que no existe");
  }
  throw error;
};

/* Busca un usuario por ID */
export const getUserById = async (id) => {
  try {
    const user_id = validateId(id);
    if (!user_id) throw new Error("ID de usuario inválido");

    const query = `
      SELECT id, name, email, role, is_verified
      FROM users
      WHERE id = $1;
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error al buscar usuario por ID:", error);
    throw error;
  }
};

/* Busca un usuario por email */
export const getUserByEmail = async (email) => {
  try {
    validateEmail(email);
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error al buscar usuario por email:", error);
    throw error;
  }
};

/* Busca un usuario por token de verificación */
export const getUserByToken = async (token) => {
  try {
    if (!token || typeof token !== "string") {
      throw new Error("Token inválido");
    }
    const result = await pool.query(
      "SELECT * FROM users WHERE verification_token = $1",
      [token]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error al buscar usuario por token:", error);
    throw error;
  }
};

/* Busca un usuario por token de reseteo de contraseña */
export const getUserByResetToken = async (token) => {
  try {
    if (!token || typeof token !== "string") {
      throw new Error("Token inválido");
    }

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
        AND reset_token_expires_at > NOW();
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error al buscar usuario por reset token:", error);
    throw error;
  }
};

/* Crea un nuevo usuario */
export const createUser = async ({
  name,
  email,
  password,
  verification_token,
}) => {
  try {
    if (!name || typeof name !== "string") {
      throw new Error("Nombre inválido");
    }
    validateEmail(email);
    if (!password || typeof password !== "string") {
      throw new Error("Contraseña inválida");
    }
    if (!verification_token || typeof verification_token !== "string") {
      throw new Error("Token de verificación inválido");
    }

    const query = `
      INSERT INTO users (name, email, password, verification_token, verification_expires_at)
      VALUES ($1, $2, $3, $4, NOW() + INTERVAL '24 HOURS')
      RETURNING id, name, email, role, is_verified;
    `;

    const result = await pool.query(query, [
      name.trim(),
      email,
      password,
      verification_token,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Error al crear usuario:", error);
    handleDatabaseError(error);
  }
};

/* Verifica la cuenta de un usuario usando su token (idempotente) */
export const verifyUserAccount = async (token) => {
  try {
    if (!token || typeof token !== "string") {
      throw new Error("Token inválido");
    }

    await pool.query(`
      UPDATE users
      SET verification_token = NULL,
          verification_expires_at = NULL
      WHERE verification_expires_at < NOW();
    `);

    const searchQuery = `
      SELECT id, name, email, role, is_verified, verification_token, verification_expires_at
      FROM users
      WHERE verification_token = $1;
    `;
    const searchResult = await pool.query(searchQuery, [token]);

    if (searchResult.rows.length === 0) {
      return null;
    }

    const user = searchResult.rows[0];

    if (user.is_verified) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: true,
      };
    }

    if (
      user.verification_expires_at &&
      new Date(user.verification_expires_at) < new Date()
    ) {
      return null;
    }

    const updateQuery = `
      UPDATE users
      SET is_verified = TRUE,
          verification_token = NULL,
          verification_expires_at = NULL,
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, email, role, is_verified;
    `;
    const updateResult = await pool.query(updateQuery, [user.id]);
    return updateResult.rows[0];
  } catch (error) {
    console.error("Error al verificar cuenta:", error);
    throw error;
  }
};

/* Establece un token de reseteo de contraseña */
export const setResetToken = async (userId, token) => {
  try {
    const user_id = validateId(userId);
    if (!user_id) throw new Error("ID de usuario inválido");
    if (!token || typeof token !== "string") {
      throw new Error("Token inválido");
    }

    const query = `
      UPDATE users
      SET reset_token = $1,
          reset_token_expires_at = NOW() + INTERVAL '1 HOUR'
      WHERE id = $2;
    `;

    await pool.query(query, [token, user_id]);
  } catch (error) {
    console.error("Error al establecer reset token:", error);
    throw error;
  }
};

/* Limpia el token de reseteo de contraseña */
export const clearResetToken = async (userId) => {
  try {
    const user_id = validateId(userId);
    if (!user_id) throw new Error("ID de usuario inválido");

    const query = `
      UPDATE users
      SET reset_token = NULL,
          reset_token_expires_at = NULL
      WHERE id = $1;
    `;

    await pool.query(query, [user_id]);
  } catch (error) {
    console.error("Error al limpiar reset token:", error);
    throw error;
  }
};

/* Actualiza la contraseña de un usuario */
export const updateUserPassword = async (userId, hashedPassword) => {
  try {
    const user_id = validateId(userId);
    if (!user_id) throw new Error("ID de usuario inválido");
    if (!hashedPassword || typeof hashedPassword !== "string") {
      throw new Error("Contraseña inválida");
    }

    const query = `
      UPDATE users
      SET password = $1,
          reset_token = NULL,
          reset_token_expires_at = NULL,
          token_version = token_version + 1
      WHERE id = $2;
    `;

    await pool.query(query, [hashedPassword, user_id]);
  } catch (error) {
    console.error("Error al actualizar contraseña:", error);
    throw error;
  }
};

/* Incrementa la versión del token de un usuario (invalida todos los tokens antiguos) */
export const incrementTokenVersion = async (userId) => {
  try {
    const user_id = validateId(userId);
    if (!user_id) throw new Error("ID de usuario inválido");

    const query = `
      UPDATE users
      SET token_version = token_version + 1
      WHERE id = $1;
    `;

    await pool.query(query, [user_id]);
  } catch (error) {
    console.error("Error al incrementar versión de token:", error);
    throw error;
  }
};

/* Lista usuarios con filtro opcional por rol */
export const getUsers = async ({ role } = {}) => {
  try {
    let query = `
      SELECT id, name, email, role, is_verified
      FROM users
    `;
    const params = [];

    if (role) {
      query += " WHERE role = $1";
      params.push(role);
    }

    query += " ORDER BY id ASC;";

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    throw error;
  }
};
