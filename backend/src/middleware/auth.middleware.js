import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "../config/db.js";

dotenv.config();

// ===================================
// 🔐 Middleware: Autenticación JWT
// ===================================
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 🔸 1. Verifica que venga un token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const err = new Error("No autorizado: token requerido");
      err.status = 401;
      throw err;
    }

    const token = authHeader.split(" ")[1];
    let decoded;

    // 🔸 2. Verifica la validez del JWT
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        const err = new Error("Tu sesión ha caducado. Inicia sesión nuevamente.");
        err.status = 401;
        throw err;
      }
      if (error.name === "JsonWebTokenError") {
        const err = new Error("Token inválido o manipulado.");
        err.status = 401;
        throw err;
      }
      throw error;
    }

    // 🔸 3. Busca el usuario asociado al token
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.id]);
    const user = result.rows[0];

    if (!user) {
      const err = new Error("Token inválido: usuario no encontrado");
      err.status = 401;
      throw err;
    }

    // 🔸 4. Verifica la versión del token (logout / password reset)
    if (
      decoded.token_version !== undefined &&
      decoded.token_version !== user.token_version
    ) {
      const err = new Error("Token inválido o sesión cerrada previamente");
      err.status = 401;
      throw err;
    }

    // ✅ 5. Todo correcto → adjuntamos el usuario
    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Error en middleware de autenticación:", err.message);
    next(err); // 🚀 Delegamos al errorHandler global
  }
};

// ===================================
// 🛡️ Middleware: Autorización por roles
// ===================================
export const authorizeRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    try {
      // 🔸 Asegura que el usuario esté autenticado
      if (!req.user) {
        const err = new Error("No autorizado: usuario no autenticado");
        err.status = 401;
        throw err;
      }

      // 🔸 Verifica que tenga un rol permitido
      if (!rolesPermitidos.includes(req.user.role)) {
        const err = new Error(`Acceso denegado. Rol requerido: ${rolesPermitidos.join(", ")}`);
        err.status = 403;
        throw err;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
