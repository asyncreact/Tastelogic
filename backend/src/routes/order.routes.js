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
  orderStats,
  orderStatsByDate,
  orderStatsByType,
  topSellingItems,
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

/* ESTADÍSTICAS - SOLO ADMIN (Deben ir antes de /:order_id) */

// Estadísticas generales
router.get(
  "/statistics/general",
  authenticate,
  authorizeRoles("admin"),
  orderStats
);

// Estadísticas por fecha
router.get(
  "/statistics/by-date",
  authenticate,
  authorizeRoles("admin"),
  orderStatsByDate
);

// Estadísticas por tipo (dine-in, takeout, delivery)
router.get(
  "/statistics/by-type",
  authenticate,
  authorizeRoles("admin"),
  orderStatsByType
);

// Items más vendidos
router.get(
  "/statistics/top-selling",
  authenticate,
  authorizeRoles("admin"),
  topSellingItems
);

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
