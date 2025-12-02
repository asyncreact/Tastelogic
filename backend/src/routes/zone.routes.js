// src/routes/zone.routes.js

import express from "express";
import {
  listZone,
  showZone,
  addZone,
  editZone,
  removeZone,
} from "../controllers/zone.controller.js";

import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import { upload } from "../config/multer.js";
import {
  validateZoneCreate,
  validateZoneUpdate,
} from "../validators/zone.validator.js";

const router = express.Router();

/* RUTAS PÚBLICAS DE ZONAS */
router.get("/public", listZone);
router.get("/public/active", listZone);
router.get("/public/:zone_id", showZone);

/* RUTAS PROTEGIDAS SOLO ADMIN (CRUD DE ZONAS) */
router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  upload.single("image"),
  validateZoneCreate,
  addZone
);

router.get("/", authenticate, authorizeRoles("admin"), listZone);

router.get("/:zone_id", authenticate, authorizeRoles("admin"), showZone);

router.put(
  "/:zone_id",
  authenticate,
  authorizeRoles("admin"),
  upload.single("image"),
  validateZoneUpdate,
  editZone
);

router.patch(
  "/:zone_id",
  authenticate,
  authorizeRoles("admin"),
  upload.single("image"),
  validateZoneUpdate,
  editZone
);

router.delete("/:zone_id", authenticate, authorizeRoles("admin"), removeZone);

export default router;
