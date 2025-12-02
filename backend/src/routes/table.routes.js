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

/* RUTAS PÚBLICAS DE MESAS (SIN AUTENTICACIÓN) */
router.get("/public/all", listTable);
router.get("/public/available", listTable);

/* RUTAS PROTEGIDAS DE MESAS (PANEL) */

router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  validateTableCreate,
  addTable
);

router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "customer"),
  listTable
);

router.get(
  "/:table_id",
  authenticate,
  authorizeRoles("admin", "customer"),
  showTable
);

router.put(
  "/:table_id",
  authenticate,
  authorizeRoles("admin"),
  validateTableUpdate,
  editTable
);

router.patch(
  "/:table_id",
  authenticate,
  authorizeRoles("admin"),
  validateTableUpdate,
  editTable
);

router.delete(
  "/:table_id",
  authenticate,
  authorizeRoles("admin"),
  removeTable
);

export default router;
