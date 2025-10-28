// src/routes/auth.routes.js
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import { authLimiter, emailLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

router.post("/register", AuthController.register);

router.get("/verify/:token", AuthController.verify);

router.post("/login", authLimiter, AuthController.login);

router.post("/logout", authenticate, AuthController.logout);

router.post("/forgot-password", emailLimiter, AuthController.forgotPassword);

router.post("/reset-password/:token", AuthController.resetPassword);

router.get("/me", authenticate, (req, res) => {
  const { password, verification_token, token_version, ...userSafe } = req.user;

  res.json({
    message: "Perfil del usuario autenticado",
    user: userSafe,
  });
});

router.get("/admin", authenticate, authorizeRoles("admin"), (req, res) => {
  const { password, verification_token, token_version, ...userSafe } = req.user;

  res.json({
    message: `Bienvenido administrador: ${req.user.name}`,
    user: userSafe,
  });
});

export default router;
