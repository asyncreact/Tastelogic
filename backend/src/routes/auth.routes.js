// src/routes/auth.routes.js
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import { authLimiter, emailLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

// =============================
// 🔓 Rutas públicas con seguridad
// =============================

// Registro (puedes agregar rate-limit si hay mucho tráfico)
router.post("/register", AuthController.register);

// Verificación de cuenta
router.get("/verify/:token", AuthController.verify);

// Login con protección anti fuerza bruta
router.post("/login", authLimiter, AuthController.login);

// Cerrar sesión requiere autenticación
router.post("/logout", authenticate, AuthController.logout);

// Recuperar contraseña — aplica límite de envío de correos
router.post("/forgot-password", emailLimiter, AuthController.forgotPassword);

// Restablecer contraseña (sin límite, llega desde correo)
router.post("/reset-password/:token", AuthController.resetPassword);

// =============================
// 🔐 Rutas protegidas
// =============================

// Perfil del usuario autenticado (customer o admin)
router.get("/me", authenticate, (req, res) => {
  const { password, verification_token, token_version, ...userSafe } = req.user;

  res.json({
    message: "Perfil del usuario autenticado",
    user: userSafe,
  });
});

// Solo accesible para administradores
router.get("/admin", authenticate, authorizeRoles("admin"), (req, res) => {
  const { password, verification_token, token_version, ...userSafe } = req.user;

  res.json({
    message: `Bienvenido administrador: ${req.user.name}`,
    user: userSafe,
  });
});

export default router;
