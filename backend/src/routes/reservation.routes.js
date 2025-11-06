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

// Rutas públicas sin autenticación
router.get("/public/available-tables", getAvailableTables);

// Rutas de estadísticas (solo admin)
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

// Ruta para verificar disponibilidad (público)
router.post(
  "/check-availability",
  validateCheckAvailabilityMiddleware,
  checkAvailability
);

// Obtener todas las reservas (filtrado por rol)
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateReservationFilters,
  listReservations
);

// Crear nueva reserva (cliente o admin)
router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateReservationCreate,
  addReservation
);

// Obtener una reserva específica (propietario o admin)
router.get(
  "/:reservation_id",
  authenticate,
  authorizeRoles("admin", "customer"),
  showReservation
);

// Actualizar reserva (propietario o admin)
router.put(
  "/:reservation_id",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateReservationUpdate,
  editReservation
);

router.patch(
  "/:reservation_id",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateReservationUpdate,
  editReservation
);

// Cambiar estado (solo admin)
router.patch(
  "/:reservation_id/status",
  authenticate,
  authorizeRoles("admin"),
  validateReservationStatusUpdate,
  updateStatus
);

// Cancelar reserva (propietario o admin)
router.patch(
  "/:reservation_id/cancel",
  authenticate,
  authorizeRoles("admin", "customer"),
  cancelReservationHandler
);

// Eliminar reserva (solo admin)
router.delete(
  "/:reservation_id",
  authenticate,
  authorizeRoles("admin"),
  removeReservation
);

export default router;
