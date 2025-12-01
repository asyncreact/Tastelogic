// src/routes/table.routes.js

import express from "express";
import {
  listTable,
  showTable,
  addTable,
  editTable,
  removeTable,
} from "../controllers/table.controller.js";

import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import {
  validateTableCreate,
  validateTableUpdate,
} from "../validators/table.validator.js";

const router = express.Router();

// Rutas públicas sin autenticación
router.get("/public/all", listTable);
router.get("/public/available", listTable);

// Rutas protegidas con autenticación

// Crear mesa
router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  validateTableCreate,
  addTable
);

// Listar mesas (panel)
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "customer"),
  listTable
);

// Obtener mesa por ID
router.get(
  "/:table_id",
  authenticate,
  authorizeRoles("admin", "customer"),
  showTable
);

// Actualizar mesa (PUT)
router.put(
  "/:table_id",
  authenticate,
  authorizeRoles("admin"),
  validateTableUpdate,
  editTable
);

// Actualizar mesa (PATCH)
router.patch(
  "/:table_id",
  authenticate,
  authorizeRoles("admin"),
  validateTableUpdate,
  editTable
);

// Eliminar mesa
router.delete(
  "/:table_id",
  authenticate,
  authorizeRoles("admin"),
  removeTable
);

export default router;
