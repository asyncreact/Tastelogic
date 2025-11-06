// src/routes/auth.routes.js

import { Router } from "express";
import {
  register,
  verify,
  login,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import {
  validateRegisterMiddleware,
  validateLoginMiddleware,
  validateResetPasswordMiddleware,
} from "../validators/auth.validator.js";
import { authLimiter, emailLimiter } from "../middleware/rateLimit.middleware.js";
import { successResponse } from "../utils/response.js";

const router = Router();

/* FLUJO DE AUTENTICACIÓN PÚBLICA */

router.post("/register", validateRegisterMiddleware, register);
router.get("/verify/:token", verify);
router.post("/login", authLimiter, validateLoginMiddleware, login);
router.post("/forgot-password", emailLimiter, forgotPassword);
router.post("/reset-password/:token", validateResetPasswordMiddleware, resetPassword);

/* AUTENTICACIÓN PROTEGIDA */

router.post("/logout", authenticate, logout);

/* INFORMACIÓN DEL USUARIO - PROTEGIDA */

router.get("/me", authenticate, (req, res) => {
  const { password, verification_token, token_version, reset_token, reset_token_expires_at, ...userSafe } = req.user;

  return successResponse(res, "Perfil del usuario autenticado", {
    user: userSafe,
  });
});

router.get("/admin", authenticate, authorizeRoles("admin"), (req, res) => {
  const { password, verification_token, token_version, reset_token, reset_token_expires_at, ...userSafe } = req.user;

  return successResponse(res, `Bienvenido administrador: ${req.user.name}`, {
    user: userSafe,
  });
});

export default router;
