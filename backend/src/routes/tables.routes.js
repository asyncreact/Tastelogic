// src/routes/tables.routes.js

import express from "express";
import {
  getZones,
  getZone,
  addZone,
  editZone,
  patchZone,
  removeZone,
  getTables,
  getTable,
  addTable,
  editTable,
  patchTable,
  removeTable,
} from "../controllers/tables.controller.js";

import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import { upload } from "../config/multer.js";

// 🆕 VALIDATORS
import {
  validateZoneMiddleware,
  validateTableMiddleware,
  validatePartialZoneMiddleware,
  validatePartialTableMiddleware,
} from "../validators/tables.validator.js";

import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

// ============================================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================================

/**
 * GET /api/tables/public/zones
 * Obtener todas las zonas públicas
 */
router.get("/public/zones", getZones);

/**
 * GET /api/tables/public/zones/:id
 * Obtener una zona pública específica
 */
router.get("/public/zones/:id", getZone);

/**
 * GET /api/tables/public/tables
 * Obtener todas las mesas públicas
 */
router.get("/public/tables", getTables);

/**
 * GET /api/tables/public/tables/:id
 * Obtener una mesa pública específica
 */
router.get("/public/tables/:id", getTable);

// ============================================================
// RUTAS PROTEGIDAS - Zonas (Admin)
// ============================================================

/**
 * GET /api/tables/zones
 * Obtener todas las zonas (admin)
 */
router.get(
  "/zones",
  authenticate,
  authorizeRoles("admin", "customer"),
  getZones
);

/**
 * GET /api/tables/zones/:id
 * Obtener una zona específica (admin)
 */
router.get(
  "/zones/:id",
  authenticate,
  authorizeRoles("admin", "customer"),
  getZone
);

/**
 * POST /api/tables/zones
 * Crear nueva zona (admin only)
 * Body: { name, description?, location?, is_active? }
 */
router.post(
  "/zones",
  authenticate,
  authorizeRoles("admin"),
  validateZoneMiddleware,
  addZone
);

/**
 * PUT /api/tables/zones/:id
 * Actualizar zona completa (admin only)
 * Body: { name, description?, location?, is_active? }
 */
router.put(
  "/zones/:id",
  authenticate,
  authorizeRoles("admin"),
  validateZoneMiddleware,
  editZone
);

/**
 * PATCH /api/tables/zones/:id
 * Actualizar zona parcialmente (admin only)
 * Body: Cualquier campo opcional
 */
router.patch(
  "/zones/:id",
  authenticate,
  authorizeRoles("admin"),
  validatePartialZoneMiddleware,
  patchZone
);

/**
 * DELETE /api/tables/zones/:id
 * Eliminar zona (admin only)
 */
router.delete(
  "/zones/:id",
  authenticate,
  authorizeRoles("admin"),
  removeZone
);

/**
 * POST /api/tables/zones/upload
 * Subir imagen de zona (admin only)
 */
router.post(
  "/zones/upload",
  authenticate,
  authorizeRoles("admin"),
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return errorResponse(res, 400, "No se proporcionó ningún archivo");
      }

      const imageUrl = `${
        process.env.BACKEND_URL || "http://localhost:4000"
      }/uploads/zones/${req.file.filename}`;

      return successResponse(res, "Imagen subida correctamente", {
        url: imageUrl,
        image_url: imageUrl,
        filename: req.file.filename,
      });
    } catch (error) {
      console.error("Error al subir imagen:", error);
      res.status(500).json({
        success: false,
        message: "Error al subir la imagen",
      });
    }
  }
);

// ============================================================
// RUTAS PROTEGIDAS - Mesas (Admin)
// ============================================================

/**
 * GET /api/tables
 * Obtener todas las mesas (admin)
 */
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "customer"),
  getTables
);

/**
 * GET /api/tables/:id
 * Obtener una mesa específica (admin)
 */
router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin", "customer"),
  getTable
);

/**
 * POST /api/tables
 * Crear nueva mesa (admin only)
 * Body: { zone_id?, table_number, capacity, status?, is_active? }
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
 * Actualizar mesa completa (admin only)
 * Body: { zone_id?, table_number, capacity, status?, is_active? }
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
 * Actualizar mesa parcialmente (admin only)
 * Body: Cualquier campo opcional
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
 * Eliminar mesa (admin only)
 */
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  removeTable
);

export default router;
