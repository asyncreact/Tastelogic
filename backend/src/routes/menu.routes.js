// src/routes/menu.routes.js

import express from "express";
import {
  getCategories,
  getCategory,
  addCategory,
  editCategory,
  patchCategory,
  removeCategory,
  getItems,
  getItem,
  addItem,
  editItem,
  patchItem,
  removeItem,
  uploadImage,
  getPublicMenu,
  getPublicCategories,
} from "../controllers/menu.controller.js";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import { upload } from "../config/multer.js";

const router = express.Router();

router.get("/public/items", getPublicMenu);
router.get("/public/categories", getPublicCategories);

router.get("/categories", authenticate, authorizeRoles("admin", "customer"), getCategories);
router.get("/categories/:id", authenticate, authorizeRoles("admin", "customer"), getCategory);
router.post("/categories", authenticate, authorizeRoles("admin"), addCategory);
router.put("/categories/:id", authenticate, authorizeRoles("admin"), editCategory);
router.patch("/categories/:id", authenticate, authorizeRoles("admin"), patchCategory);
router.delete("/categories/:id", authenticate, authorizeRoles("admin"), removeCategory);

router.get("/items", authenticate, authorizeRoles("admin", "customer"), getItems);
router.get("/items/:id", authenticate, authorizeRoles("admin", "customer"), getItem);
router.post("/items", authenticate, authorizeRoles("admin"), addItem);
router.put("/items/:id", authenticate, authorizeRoles("admin"), editItem);
router.patch("/items/:id", authenticate, authorizeRoles("admin"), patchItem);
router.delete("/items/:id", authenticate, authorizeRoles("admin"), removeItem);

router.post(
  "/upload",
  authenticate,
  authorizeRoles("admin"),
  upload.single("image"),
  uploadImage
);

export default router;
