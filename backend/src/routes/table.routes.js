// src/routes/table.routes.js

import express from "express";
import {
  getTables,
  getTable,
  getTablesByZoneId,
  getAvailableTablesByZoneId,
  getTablesByStatusQuery,
  addTable,
  editTable,
  patchTable,
  removeTable,
  updateStatus,
} from "../controllers/table.controller.js";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import {
  validateTableMiddleware,
  validatePartialTableMiddleware,
  validateTableStatusMiddleware,
} from "../validators/table.validator.js";

const router = express.Router();

// ============================================================
// RUTAS PÚBLICAS
// ============================================================

/**
 * GET /api/tables/public
 * Obtener todas las mesas
 */
router.get("/public", getTables);

/**
 * GET /api/tables/public/:id
 * Obtener una mesa por ID
 */
router.get("/public/:id", getTable);

/**
 * GET /api/tables/public/zone/:zoneId
 * Obtener mesas de una zona
 */
router.get("/public/zone/:zoneId", getTablesByZoneId);

/**
 * GET /api/tables/public/zone/:zoneId/available
 * Obtener mesas disponibles de una zona
 */
router.get("/public/zone/:zoneId/available", getAvailableTablesByZoneId);

/**
 * GET /api/tables/public/status
 * Obtener mesas por estado
 */
router.get("/public/status", getTablesByStatusQuery);

// ============================================================
// RUTAS PROTEGIDAS - ADMIN Y CUSTOMER (LECTURA)
// ============================================================

/**
 * GET /api/tables
 * Obtener todas las mesas (ADMIN, CUSTOMER)
 */
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "customer"),
  getTables
);

/**
 * GET /api/tables/:id
 * Obtener una mesa por ID (ADMIN, CUSTOMER)
 */
router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin", "customer"),
  getTable
);

// ============================================================
// RUTAS PROTEGIDAS - SOLO ADMIN (ESCRITURA)
// ============================================================

/**
 * POST /api/tables
 * Crear nueva mesa (ADMIN)
 */
router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  validateTableMiddleware,
  addTable
);

/**
 * PUT /api/tables/:id
 * Actualizar mesa completamente (ADMIN)
 */
router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  validateTableMiddleware,
  editTable
);

/**
 * PATCH /api/tables/:id
 * Actualizar mesa parcialmente (ADMIN)
 */
router.patch(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  validatePartialTableMiddleware,
  patchTable
);

/**
 * DELETE /api/tables/:id
 * Eliminar mesa (ADMIN)
 */
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  removeTable
);

// ============================================================
// RUTAS PROTEGIDAS - CAMBIAR ESTADO (ADMIN Y CUSTOMER)
// ============================================================

/**
 * PATCH /api/tables/:id/status
 * Cambiar estado de mesa (ADMIN, CUSTOMER)
 */
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("admin"),
  validateTableStatusMiddleware,
  updateStatus
);

export default router;
