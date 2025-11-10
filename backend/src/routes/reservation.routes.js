// src/routes/reservation.routes.js

import express from "express";
import {
  listReservations,
  showReservation,
  getAvailableTables,
  checkAvailability,
  addReservation,
  editReservation,
  updateStatus,
  cancelReservationHandler,
  removeReservation,
  reservationStats,
  reservationStatsByDate,
  reservationStatsByZone,
  reservationStatsByStatus,
} from "../controllers/reservation.controller.js";

import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import {
  validateReservationCreate,
  validateReservationUpdate,
  validateReservationStatusUpdate,
  validateCheckAvailabilityMiddleware,
  validateReservationFilters,
} from "../validators/reservation.validator.js";

const router = express.Router();

/* RUTAS PÚBLICAS */

// Mesas disponibles (pública)
router.get("/public/available-tables", getAvailableTables);

// Verificar disponibilidad (pública)
router.post(
  "/public/check-availability",
  validateCheckAvailabilityMiddleware,
  checkAvailability
);

/* ESTADÍSTICAS - SOLO ADMIN (Deben ir antes de /:reservation_id) */

router.get(
  "/statistics/general",
  authenticate,
  authorizeRoles("admin"),
  reservationStats
);

router.get(
  "/statistics/by-date",
  authenticate,
  authorizeRoles("admin"),
  reservationStatsByDate
);

router.get(
  "/statistics/by-zone",
  authenticate,
  authorizeRoles("admin"),
  reservationStatsByZone
);

router.get(
  "/statistics/by-status",
  authenticate,
  authorizeRoles("admin"),
  reservationStatsByStatus
);

/* RUTAS AUTENTICADAS CON NOMBRES ESPECÍFICOS (Antes de /:reservation_id) */

// Mesas disponibles (autenticada) - alternativa
router.get(
  "/available-tables",
  authenticate,
  authorizeRoles("admin", "customer"),
  getAvailableTables
);

// Verificar disponibilidad (autenticada) - alternativa
router.post(
  "/check-availability",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateCheckAvailabilityMiddleware,
  checkAvailability
);

/* CRUD DE RESERVAS */

// Listar reservas
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateReservationFilters,
  listReservations
);

// Crear reserva
router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateReservationCreate,
  addReservation
);

/* ACCIONES ESPECIALES CON :reservation_id (Deben ir ANTES de GET /:reservation_id) */

// Actualizar estado
router.patch(
  "/:reservation_id/status",
  authenticate,
  authorizeRoles("admin"),
  validateReservationStatusUpdate,
  updateStatus
);

// Cancelar reserva
router.patch(
  "/:reservation_id/cancel",
  authenticate,
  authorizeRoles("admin", "customer"),
  cancelReservationHandler
);

/* RUTAS CON PARÁMETRO :reservation_id (Al final) */

// Obtener reserva por ID
router.get(
  "/:reservation_id",
  authenticate,
  authorizeRoles("admin", "customer"),
  showReservation
);

// Actualizar reserva (PUT)
router.put(
  "/:reservation_id",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateReservationUpdate,
  editReservation
);

// Actualizar reserva (PATCH)
router.patch(
  "/:reservation_id",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateReservationUpdate,
  editReservation
);

// Eliminar reserva
router.delete(
  "/:reservation_id",
  authenticate,
  authorizeRoles("admin"),
  removeReservation
);

export default router;
