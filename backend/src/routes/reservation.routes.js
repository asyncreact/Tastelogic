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

router.get("/public/available-tables", getAvailableTables);
router.post(
  "/check-availability",
  validateCheckAvailabilityMiddleware,
  checkAvailability
);

/* ESTADÍSTICAS - SOLO ADMIN */

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

/* CRUD DE RESERVAS */

router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateReservationFilters,
  listReservations
);

router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateReservationCreate,
  addReservation
);

router.get(
  "/:reservation_id",
  authenticate,
  authorizeRoles("admin", "customer"),
  showReservation
);

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

/* ACCIONES ESPECIALES */

router.patch(
  "/:reservation_id/status",
  authenticate,
  authorizeRoles("admin"),
  validateReservationStatusUpdate,
  updateStatus
);

router.patch(
  "/:reservation_id/cancel",
  authenticate,
  authorizeRoles("admin", "customer"),
  cancelReservationHandler
);

router.delete(
  "/:reservation_id",
  authenticate,
  authorizeRoles("admin"),
  removeReservation
);

export default router;
