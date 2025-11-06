// src/routes/orders.routes.js

import express from "express";

import {
  createNewOrder,
  getOrder,
  getUserOrders,
  getOrders,
  updateOrderState,
  editOrder,
  patchOrder,
  removeOrder,
  cancelOrderHandler,
  addItemToOrder,
  getOrderItemsByOrder,
  editOrderItem,
  patchOrderItem,
  removeOrderItem,
  clearOrderItemsHandler,
  createFullOrder,
  validateCart,
  recalculateTotal,
  getOrderTotalHandler,
  createDineInOrder,
  getOrderWithTableInfo,
  getTableWithOrderInfo,
  moveOrder,
  getOccupied,
  getStatistics,
  getRecentOrdersList,
  getStatisticsByType,
  getOrdersByDateRangeHandler,
  getFilteredUserOrders,
} from "../controllers/orders.controller.js";

import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";

import {
  validateCreateOrderMiddleware,
  validateUpdateStatusMiddleware,
  validateUpdateOrderMiddleware,
  validateAddItemMiddleware,
  validateUpdateItemMiddleware,
  validateCreateFullOrderMiddleware,
  validateValidateCartMiddleware,
  validateCreateDineInOrderMiddleware,
  validateMoveOrderMiddleware,
  validateOrdersQueryMiddleware,
  validateDateRangeQueryMiddleware,
  validatePaginationQueryMiddleware,
} from "../validators/orders.validator.js";

const router = express.Router();

// ============================================================
// 🔒 A) RUTAS ESTÁTICAS ESPECÍFICAS - PRIMERO
// ============================================================

router.post("/create/full", authenticate, authorizeRoles("admin", "customer"), validateCreateFullOrderMiddleware, createFullOrder);

router.post("/validate/cart", authenticate, authorizeRoles("admin", "customer"), validateValidateCartMiddleware, validateCart);

router.post("/dine-in/create", authenticate, authorizeRoles("admin", "customer"), validateCreateDineInOrderMiddleware, createDineInOrder);

router.get("/table/:table_id/order", authenticate, authorizeRoles("admin", "customer"), getTableWithOrderInfo);

router.get("/dashboard/occupied", authenticate, authorizeRoles("admin", "customer"), getOccupied);

router.get("/stats/general", authenticate, authorizeRoles("admin"), getStatistics);

router.get("/stats/recent", authenticate, authorizeRoles("admin"), getRecentOrdersList);

router.get("/stats/by-type", authenticate, authorizeRoles("admin"), getStatisticsByType);

router.get("/stats/by-date", authenticate, authorizeRoles("admin"), validateDateRangeQueryMiddleware, getOrdersByDateRangeHandler);

router.get("/user/:user_id", authenticate, authorizeRoles("admin", "customer"), validatePaginationQueryMiddleware, getUserOrders);

router.get("/stats/user/:user_id", authenticate, authorizeRoles("admin"), validatePaginationQueryMiddleware, getFilteredUserOrders);

// ============================================================
// 🔒 B) RUTAS DINÁMICAS ESPECÍFICAS - SEGUNDO
// ============================================================

router.post("/:order_id/items", authenticate, authorizeRoles("admin", "customer"), validateAddItemMiddleware, addItemToOrder);

router.get("/:order_id/items", authenticate, authorizeRoles("admin", "customer"), getOrderItemsByOrder);

router.delete("/:order_id/items", authenticate, authorizeRoles("admin", "customer"), clearOrderItemsHandler);

router.put("/:order_id/items/:item_id", authenticate, authorizeRoles("admin", "customer"), validateUpdateItemMiddleware, editOrderItem);

router.patch("/:order_id/items/:item_id", authenticate, authorizeRoles("admin", "customer"), validateUpdateItemMiddleware, patchOrderItem);

router.delete("/:order_id/items/:item_id", authenticate, authorizeRoles("admin", "customer"), removeOrderItem);

router.put("/:order_id/status", authenticate, authorizeRoles("admin", "customer"), validateUpdateStatusMiddleware, updateOrderState);

router.post("/:order_id/cancel", authenticate, authorizeRoles("admin", "customer"), cancelOrderHandler);

router.put("/:order_id/recalculate", authenticate, authorizeRoles("admin", "customer"), recalculateTotal);

router.get("/:order_id/total", authenticate, authorizeRoles("admin", "customer"), getOrderTotalHandler);

router.get("/:order_id/table", authenticate, authorizeRoles("admin", "customer"), getOrderWithTableInfo);

router.put("/:order_id/move-table", authenticate, authorizeRoles("admin", "customer"), validateMoveOrderMiddleware, moveOrder);

// ============================================================
// 🔒 C) RUTAS DINÁMICAS GENERALES - ÚLTIMO (/:order_id)
// ============================================================

router.post("/", authenticate, authorizeRoles("admin", "customer"), validateCreateOrderMiddleware, createNewOrder);

router.get("/", authenticate, authorizeRoles("admin"), validateOrdersQueryMiddleware, getOrders);

router.get("/:order_id", authenticate, authorizeRoles("admin", "customer"), getOrder);

router.put("/:order_id", authenticate, authorizeRoles("admin", "customer"), validateUpdateOrderMiddleware, editOrder);

router.patch("/:order_id", authenticate, authorizeRoles("admin", "customer"), validateUpdateOrderMiddleware, patchOrder);

router.delete("/:order_id", authenticate, authorizeRoles("admin", "customer"), removeOrder);

export default router;
