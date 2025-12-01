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

/* CRUD DE PEDIDOS */

// Listar pedidos
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateOrderFilters,
  listOrders
);

// Crear pedido
router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateOrderCreate,
  addOrder
);

/* ACCIONES ESPECIALES CON :order_id (Deben ir ANTES de GET /:order_id) */

// Actualizar estado del pedido
router.patch(
  "/:order_id/status",
  authenticate,
  authorizeRoles("admin"),
  validateOrderStatusUpdate,
  updateStatus
);

// Actualizar estado de pago
router.patch(
  "/:order_id/payment",
  authenticate,
  authorizeRoles("admin"),
  validateOrderPaymentStatusUpdate,
  updatePayment
);

// Cancelar pedido
router.patch(
  "/:order_id/cancel",
  authenticate,
  authorizeRoles("admin", "customer"),
  cancelOrderHandler
);

/* RUTAS CON PARÁMETRO :order_id (Al final) */

// Obtener pedido por ID
router.get(
  "/:order_id",
  authenticate,
  authorizeRoles("admin", "customer"),
  showOrder
);

// Actualizar pedido (PUT)
router.put(
  "/:order_id",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateOrderUpdate,
  editOrder
);

// Actualizar pedido (PATCH)
router.patch(
  "/:order_id",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateOrderUpdate,
  editOrder
);

// Eliminar pedido
router.delete(
  "/:order_id",
  authenticate,
  authorizeRoles("admin"),
  removeOrder
);

export default router;
