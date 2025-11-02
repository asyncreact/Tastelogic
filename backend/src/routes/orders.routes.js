// src/routes/orders.routes.js

import express from "express";
import {
  // Órdenes
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  updateOrderInstructions,
  deleteOrder,
  
  // Items de órdenes
  addOrderItem,
  getOrderItems,
  updateOrderItemQuantity,
  removeOrderItem,
  clearOrderItems,
  
  // Checkout
  checkoutCart,
  
  // Análisis
  getOrdersStatistics,
  getTopSellingItems,
  getDemandByTime,
  getUserOrdersSummary,
  getRecentOrders,
  getStatisticsByDeliveryType,
  getOrdersByDateRange
} from "../controllers/orders.controller.js";

import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";

import {
  validateCreateOrderMiddleware,
  validateUpdateStatusMiddleware,
  validateUpdateInstructionsMiddleware,
  validateAddItemMiddleware,
  validateUpdateQuantityMiddleware,
  validateCheckoutMiddleware,
  validateOrdersQueryMiddleware,
  validateDateRangeQueryMiddleware,
  validateLimitQueryMiddleware
} from "../validators/orders.validator.js";

const router = express.Router();

// ============================================================
// 🌐 RUTAS PÚBLICAS (sin autenticación)
// ============================================================

/**
 * GET /api/orders/public/top-items?limit=10
 * Obtener items más vendidos
 * Query: limit? (1-100, default 10)
 * Respuesta: { success, message, items }
 */
router.get(
  "/public/top-items",
  validateLimitQueryMiddleware,
  getTopSellingItems
);

/**
 * GET /api/orders/public/demand
 * Obtener demanda por hora/día para gráficos
 * Respuesta: { success, message, data }
 */
router.get("/public/demand", getDemandByTime);

/**
 * GET /api/orders/public/statistics
 * Obtener estadísticas generales
 * Respuesta: { success, message, statistics }
 */
router.get("/public/statistics", getOrdersStatistics);

// ============================================================
// 🔒 RUTAS PROTEGIDAS - Órdenes del Usuario Actual
// ============================================================

/**
 * POST /api/orders
 * Crear una nueva orden vacía
 * Headers: Authorization: Bearer <token>
 * Body: {
 *   totalAmount?: number (default 0),
 *   deliveryType?: 'dine-in' | 'delivery' | 'takeout' (default 'dine-in'),
 *   specialInstructions?: string max 500
 * }
 * Respuesta: { success, message, order }
 */
router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateCreateOrderMiddleware,
  createOrder
);

/**
 * POST /api/orders/checkout
 * Crear una orden completa con items en una transacción
 * Headers: Authorization: Bearer <token>
 * Body: {
 *   cartItems: [{ menuItemId: number, quantity: number (1-99), specialRequests?: string }],
 *   deliveryType?: 'dine-in' | 'delivery' | 'takeout' (default 'dine-in'),
 *   specialInstructions?: string max 500
 * }
 * Respuesta: { success, message, order }
 */
router.post(
  "/checkout",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateCheckoutMiddleware,
  checkoutCart
);

/**
 * GET /api/orders/my-orders?status=pending&limit=10&offset=0
 * Obtener todas las órdenes del usuario autenticado
 * Headers: Authorization: Bearer <token>
 * Query: {
 *   status?: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled',
 *   limit?: number (1-100, default 10),
 *   offset?: number (default 0)
 * }
 * Respuesta: { success, message, orders, count }
 */
router.get(
  "/my-orders",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateOrdersQueryMiddleware,
  getUserOrders
);

/**
 * GET /api/orders/:orderId
 * Obtener detalles de una orden específica
 * Headers: Authorization: Bearer <token>
 * Params: orderId (number)
 * Respuesta: { success, message, order: { ...order, items } }
 */
router.get(
  "/:orderId",
  authenticate,
  authorizeRoles("admin", "customer"),
  getOrderById
);

/**
 * PATCH /api/orders/:orderId/instructions
 * Actualizar instrucciones especiales de una orden
 * Headers: Authorization: Bearer <token>
 * Params: orderId (number)
 * Body: {
 *   specialInstructions?: string max 500
 * }
 * Respuesta: { success, message, order }
 */
router.patch(
  "/:orderId/instructions",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateUpdateInstructionsMiddleware,
  updateOrderInstructions
);

/**
 * DELETE /api/orders/:orderId
 * Eliminar una orden (solo si está en estado pending)
 * Headers: Authorization: Bearer <token>
 * Params: orderId (number)
 * Respuesta: { success, message, order }
 */
router.delete(
  "/:orderId",
  authenticate,
  authorizeRoles("admin", "customer"),
  deleteOrder
);

// ============================================================
// 🔒 ITEMS DE ÓRDENES - Protegido
// ============================================================

/**
 * POST /api/orders/:orderId/items
 * Agregar un item a una orden
 * Headers: Authorization: Bearer <token>
 * Params: orderId (number)
 * Body: {
 *   menuItemId: number,
 *   quantity: number (1-99),
 *   specialRequests?: string max 300
 * }
 * Respuesta: { success, message, item }
 */
router.post(
  "/:orderId/items",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateAddItemMiddleware,
  addOrderItem
);

/**
 * GET /api/orders/:orderId/items
 * Obtener todos los items de una orden
 * Headers: Authorization: Bearer <token>
 * Params: orderId (number)
 * Respuesta: { success, message, items, count }
 */
router.get(
  "/:orderId/items",
  authenticate,
  authorizeRoles("admin", "customer"),
  getOrderItems
);

/**
 * PATCH /api/orders/:orderId/items/:itemId/quantity
 * Actualizar cantidad de un item en una orden
 * Headers: Authorization: Bearer <token>
 * Params: orderId (number), itemId (number)
 * Body: {
 *   quantity: number (1-99)
 * }
 * Respuesta: { success, message, item }
 */
router.patch(
  "/:orderId/items/:itemId/quantity",
  authenticate,
  authorizeRoles("admin", "customer"),
  validateUpdateQuantityMiddleware,
  updateOrderItemQuantity
);

/**
 * DELETE /api/orders/:orderId/items/:itemId
 * Eliminar un item de la orden
 * Headers: Authorization: Bearer <token>
 * Params: orderId (number), itemId (number)
 * Respuesta: { success, message, item }
 */
router.delete(
  "/:orderId/items/:itemId",
  authenticate,
  authorizeRoles("admin", "customer"),
  removeOrderItem
);

/**
 * DELETE /api/orders/:orderId/items
 * Limpiar todos los items de una orden
 * Headers: Authorization: Bearer <token>
 * Params: orderId (number)
 * Respuesta: { success, message, count }
 */
router.delete(
  "/:orderId/items",
  authenticate,
  authorizeRoles("admin", "customer"),
  clearOrderItems
);

// ============================================================
// 🔐 RUTAS ADMIN ONLY - Gestión completa
// ============================================================

/**
 * GET /api/orders?status=pending&limit=10&offset=0
 * Obtener todas las órdenes (admin only)
 * Headers: Authorization: Bearer <token>
 * Query: {
 *   status?: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled',
 *   limit?: number (1-100, default 10),
 *   offset?: number (default 0)
 * }
 * Respuesta: { success, message, orders, count }
 */
router.get(
  "/",
  authenticate,
  authorizeRoles("admin"),
  validateOrdersQueryMiddleware,
  getAllOrders
);

/**
 * PATCH /api/orders/:orderId/status
 * Cambiar estado de una orden (admin only)
 * Headers: Authorization: Bearer <token>
 * Params: orderId (number)
 * Body: {
 *   status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
 * }
 * Respuesta: { success, message, order }
 */
router.patch(
  "/:orderId/status",
  authenticate,
  authorizeRoles("admin"),
  validateUpdateStatusMiddleware,
  updateOrderStatus
);

/**
 * GET /api/orders/analytics/summary
 * Resumen de órdenes por usuario (admin only)
 * Headers: Authorization: Bearer <token>
 * Respuesta: { success, message, summary }
 */
router.get(
  "/analytics/summary",
  authenticate,
  authorizeRoles("admin"),
  getUserOrdersSummary
);

/**
 * GET /api/orders/analytics/recent?limit=10
 * Órdenes recientes (admin only)
 * Headers: Authorization: Bearer <token>
 * Query: {
 *   limit?: number (1-100, default 10)
 * }
 * Respuesta: { success, message, orders }
 */
router.get(
  "/analytics/recent",
  authenticate,
  authorizeRoles("admin"),
  validateLimitQueryMiddleware,
  getRecentOrders
);

/**
 * GET /api/orders/analytics/by-delivery
 * Estadísticas por tipo de entrega (admin only)
 * Headers: Authorization: Bearer <token>
 * Respuesta: { success, message, statistics }
 */
router.get(
  "/analytics/by-delivery",
  authenticate,
  authorizeRoles("admin"),
  getStatisticsByDeliveryType
);

/**
 * GET /api/orders/analytics/by-date?startDate=2025-01-01&endDate=2025-01-31
 * Obtener órdenes por rango de fechas (admin only)
 * Headers: Authorization: Bearer <token>
 * Query: {
 *   startDate: string YYYY-MM-DD,
 *   endDate: string YYYY-MM-DD
 * }
 * Respuesta: { success, message, orders, count }
 */
router.get(
  "/analytics/by-date",
  authenticate,
  authorizeRoles("admin"),
  validateDateRangeQueryMiddleware,
  getOrdersByDateRange
);

export default router;
