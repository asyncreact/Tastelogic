// src/routes/menu.routes.js

import express from "express";
import {
  listMenu,
  showMenu,
  addMenu,
  editMenu,
  removeMenu,
  listItem,
  showItem,
  addItem,
  editItem,
  removeItem,
} from "../controllers/menu.controller.js";

import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import { upload } from "../config/multer.js";
import {
  validateCategoryMiddleware,
  validateItemMiddleware,
} from "../validators/menu.validator.js";

const router = express.Router();

/* PÚBLICAS - CATEGORÍAS */

router.get("/categories", listMenu);
router.get("/categories/:category_id", showMenu);

/* PÚBLICAS - ITEMS */

router.get("/items", listItem);
router.get("/items/:item_id", showItem);

/* PROTEGIDAS - CATEGORÍAS */

router.post(
  "/categories",
  authenticate,
  authorizeRoles("admin"),
  validateCategoryMiddleware,
  addMenu
);

router.put(
  "/categories/:category_id",
  authenticate,
  authorizeRoles("admin"),
  validateCategoryMiddleware,
  editMenu
);

router.patch(
  "/categories/:category_id",
  authenticate,
  authorizeRoles("admin"),
  validateCategoryMiddleware,
  editMenu
);

router.delete(
  "/categories/:category_id",
  authenticate,
  authorizeRoles("admin"),
  removeMenu
);

/* PROTEGIDAS - ITEMS */

router.post(
  "/items",
  authenticate,
  authorizeRoles("admin"),
  upload.single("image"),
  validateItemMiddleware,
  addItem
);

router.put(
  "/items/:item_id",
  authenticate,
  authorizeRoles("admin"),
  upload.single("image"),
  validateItemMiddleware,
  editItem
);

router.patch(
  "/items/:item_id",
  authenticate,
  authorizeRoles("admin"),
  upload.single("image"),
  validateItemMiddleware,
  editItem
);

router.delete(
  "/items/:item_id",
  authenticate,
  authorizeRoles("admin"),
  removeItem
);

export default router;
