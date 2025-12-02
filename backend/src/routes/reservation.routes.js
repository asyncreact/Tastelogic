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
  getMyActiveReservation,
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

/* RUTAS PÚBLICAS DE DISPONIBILIDAD */
router.get("/public/available-tables", getAvailableTables);

router.post(
  "/public/check-availability",
  validateCheckAvailabilityMiddleware,
  checkAvailability
);

/* RUTAS AUTENTICADAS ESPECÍFICAS (ANTES DE /:reservation_id) */
router.get(
  "/me/active",
  authenticate,
  authorizeRoles("customer"),
  getMyActiveReservation
);

router.get(
  "/available-tables",
  authenticate,
  authorizeRoles("admin", "customer"),
  getAvailableTables
);

router.post(
  "/check-availability",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateCheckAvailabilityMiddleware,
  checkAvailability
);

/* RUTAS PROTEGIDAS CRUD DE RESERVAS */
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

/* RUTAS ESPECIALES POR ID DE RESERVA (ESTADO Y CANCELACIÓN) */
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

/* RUTAS CRUD POR ID DE RESERVA */
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

router.delete(
  "/:reservation_id",
  authenticate,
  authorizeRoles("admin"),
  removeReservation
);

export default router;
