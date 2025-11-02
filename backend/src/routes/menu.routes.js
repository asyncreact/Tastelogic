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
  getItemPrepTime,
  updateItemPrepTime,
  getAllItemsPrepTimes,
} from "../controllers/menu.controller.js";


import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import { upload } from "../config/multer.js";


// 🆕 VALIDATORS
import {
  validateCategoryMiddleware,
  validateItemMiddleware,
  validatePartialCategoryMiddleware,
  validatePartialItemMiddleware,
  validatePrepTimeMiddleware,
} from "../validators/menu.validator.js";


const router = express.Router();


// ============================================================
// RUTAS PÚBLICAS
// ============================================================


router.get("/public/items", getPublicMenu);
router.get("/public/categories", getPublicCategories);
router.get("/public/items/:id/prep-time", getItemPrepTime); // 🆕 NUEVA RUTA PÚBLICA


// ============================================================
// RUTAS PROTEGIDAS - Categorías
// ============================================================


router.get("/categories", authenticate, authorizeRoles("admin", "customer"), getCategories);
router.get("/categories/:id", authenticate, authorizeRoles("admin", "customer"), getCategory);


router.post(
  "/categories",
  authenticate,
  authorizeRoles("admin"),
  validateCategoryMiddleware,
  addCategory
);


router.put(
  "/categories/:id",
  authenticate,
  authorizeRoles("admin"),
  validateCategoryMiddleware,
  editCategory
);


router.patch(
  "/categories/:id",
  authenticate,
  authorizeRoles("admin"),
  validatePartialCategoryMiddleware,
  patchCategory
);


router.delete("/categories/:id", authenticate, authorizeRoles("admin"), removeCategory);


// ============================================================
// RUTAS PROTEGIDAS - Items
// ============================================================


router.get("/items", authenticate, authorizeRoles("admin", "customer"), getItems);
router.get("/items/:id", authenticate, authorizeRoles("admin", "customer"), getItem);


router.post(
  "/items",
  authenticate,
  authorizeRoles("admin"),
  upload.single("image"),
  validateItemMiddleware,
  addItem
);


router.put(
  "/items/:id",
  authenticate,
  authorizeRoles("admin"),
  upload.single("image"),
  validateItemMiddleware,
  editItem
);


router.patch(
  "/items/:id",
  authenticate,
  authorizeRoles("admin"),
  upload.single("image"),
  validatePartialItemMiddleware,
  patchItem
);


router.delete("/items/:id", authenticate, authorizeRoles("admin"), removeItem);


// ============================================================
// PREP TIME - Rutas Nuevas
// ============================================================


router.get(
  "/prep-times/all",
  authenticate,
  authorizeRoles("admin"),
  getAllItemsPrepTimes
);


// 🆕 RUTA PROTEGIDA - Para admin/customer con autenticación
router.get(
  "/items/:id/prep-time/auth",
  authenticate,
  authorizeRoles("admin", "customer"),
  getItemPrepTime
);


router.patch(
  "/items/:id/prep-time",
  authenticate,
  authorizeRoles("admin"),
  validatePrepTimeMiddleware,
  updateItemPrepTime
);


// ============================================================
// UPLOAD IMAGE
// ============================================================


router.post(
  "/upload-image",
  authenticate,
  authorizeRoles("admin"),
  upload.single("image"),
  uploadImage
);


export default router;
