// src/routes/user.routes.js
import { Router } from "express";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import { listUsers } from "../controllers/user.controller.js";

const router = Router();

/* RUTA PROTEGIDA DE ADMINISTRACIÓN DE USUARIOS */
router.get("/", authenticate, authorizeRoles("admin"), listUsers);

export default router;
