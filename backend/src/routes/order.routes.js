// src/routes/order.routes.js

import express from "express";
import {
  listOrders,
  showOrder,
  addOrder,
  editOrder,
  updateStatus,
  updatePayment,
  cancelOrderHandler,
  removeOrder,
} from "../controllers/order.controller.js";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import {
  validateOrderCreate,
  validateOrderUpdate,
  validateOrderStatusUpdate,
  validateOrderPaymentStatusUpdate,
  validateOrderFilters,
} from "../validators/order.validator.js";

const router = express.Router();

/* RUTAS PROTEGIDAS DE PEDIDOS (LISTAR Y CREAR) */
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateOrderFilters,
  listOrders
);

router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateOrderCreate,
  addOrder
);

/* RUTAS ESPECIALES DE PEDIDO POR ID (ESTADO Y PAGO) */
router.patch(
  "/:order_id/status",
  authenticate,
  authorizeRoles("admin"),
  validateOrderStatusUpdate,
  updateStatus
);

router.patch(
  "/:order_id/payment",
  authenticate,
  authorizeRoles("admin"),
  validateOrderPaymentStatusUpdate,
  updatePayment
);

router.patch(
  "/:order_id/cancel",
  authenticate,
  authorizeRoles("admin", "customer"),
  cancelOrderHandler
);

/* RUTAS CRUD POR ID DE PEDIDO */
router.get(
  "/:order_id",
  authenticate,
  authorizeRoles("admin", "customer"),
  showOrder
);

router.put(
  "/:order_id",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateOrderUpdate,
  editOrder
);

router.patch(
  "/:order_id",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateOrderUpdate,
  editOrder
);

router.delete(
  "/:order_id",
  authenticate,
  authorizeRoles("admin"),
  removeOrder
);

export default router;
