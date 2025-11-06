// src/routes/table.routes.js

import express from "express";
import {
  listTable,
  showTable,
  addTable,
  editTable,
  removeTable,
  showTableWithOrder,
  tableStats,
} from "../controllers/table.controller.js";

import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import {
  validateTableCreate,
  validateTableUpdate,
} from "../validators/table.validator.js";

const router = express.Router();

/* PÚBLICAS - SIN AUTENTICACIÓN */

router.get("/public/all", listTable);
router.get("/public/available", listTable);

/* PROTEGIDAS - CON AUTENTICACIÓN */

/* CRUD BÁSICO */

router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  validateTableCreate,
  addTable
);

router.get("/", authenticate, authorizeRoles("admin", "customer"), listTable);

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

/* INFORMACIÓN EN TIEMPO REAL */

router.get(
  "/:table_id/with-order",
  authenticate,
  authorizeRoles("admin", "customer"),
  showTableWithOrder
);

/* ESTADÍSTICAS */

router.get(
  "/dashboard/statistics",
  authenticate,
  authorizeRoles("admin"),
  tableStats
);

export default router;
