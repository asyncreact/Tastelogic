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

const router = express.Router();

router.get("/zones", authenticate, authorizeRoles("admin", "customer"), getZones);
router.get("/zones/:id", authenticate, authorizeRoles("admin", "customer"), getZone);
router.post("/zones", authenticate, authorizeRoles("admin"), addZone);
router.put("/zones/:id", authenticate, authorizeRoles("admin"), editZone);
router.patch("/zones/:id", authenticate, authorizeRoles("admin"), patchZone);
router.delete("/zones/:id", authenticate, authorizeRoles("admin"), removeZone);

router.post(
  "/zones/upload",
  authenticate,
  authorizeRoles("admin"),
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No se proporcionó ningún archivo",
        });
      }

      const imageUrl = `${process.env.BACKEND_URL || "http://localhost:4000"}/uploads/zones/${req.file.filename}`;

      res.json({
        success: true,
        message: "Imagen subida correctamente",
        url: imageUrl,
        image_url: imageUrl,
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

router.get("/", authenticate, authorizeRoles("admin", "customer"), getTables);
router.get("/:id", authenticate, authorizeRoles("admin", "customer"), getTable);
router.post("/", authenticate, authorizeRoles("admin"), addTable);
router.put("/:id", authenticate, authorizeRoles("admin"), editTable);
router.patch("/:id", authenticate, authorizeRoles("admin"), patchTable);
router.delete("/:id", authenticate, authorizeRoles("admin"), removeTable);

export default router;
