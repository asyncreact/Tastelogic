import express from "express";
import {
  getZones,
  getActiveZonesController,
  getZone,
  addZone,
  editZone,
  patchZone,
  removeZone,
  uploadImage,
} from "../controllers/zone.controller.js";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import { upload } from "../config/multer.js";
import {
  validateZoneMiddleware,
  validatePartialZoneMiddleware,
} from "../validators/zone.validator.js";

const router = express.Router();

router.get("/public", getZones);
router.get("/public/active", getActiveZonesController);
router.get("/public/:id", getZone);

router.get(
  "/",
  authenticate,
  authorizeRoles("admin"),
  getZones
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  getZone
);

router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  upload.single("image"),
  validateZoneMiddleware,
  addZone
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  upload.single("image"),
  validateZoneMiddleware,
  editZone
);

router.patch(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  upload.single("image"),
  validatePartialZoneMiddleware,
  patchZone
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  removeZone
);

router.post(
  "/upload-image",
  authenticate,
  authorizeRoles("admin"),
  upload.single("image"),
  uploadImage
);

export default router;
