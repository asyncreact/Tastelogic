// src/controllers/orders.controller.js

import OrdersRepository from "../repositories/orders.repository.js";
import { successResponse, errorResponse } from "../utils/response.js";

/**
 * Controller para manejar las operaciones de órdenes
 * Nota: La autenticación y permisos se validan en las rutas
 */

// ============================================================
// ÓRDENES - CRUD Básico
// ============================================================

/**
 * POST /api/orders
 * Crear una nueva orden
 */
export const createOrder = async (req, res, next) => {
  try {
    const { totalAmount = 0, deliveryType = 'dine-in', specialInstructions } = req.body;
    const userId = req.user.id; // Garantizado por middleware authenticate

    // Validar inputs
    if (!['dine-in', 'delivery', 'takeout'].includes(deliveryType)) {
      return errorResponse(res, 400, 'Tipo de entrega inválido');
    }

    const order = await OrdersRepository.createOrder(
      userId,
      totalAmount,
      deliveryType,
      specialInstructions
    );

    return successResponse(res, 'Orden creada exitosamente', { order }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:orderId
 * Obtener detalles de una orden específica
 * Permisos: propietario o admin (validado en rutas)
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await OrdersRepository.getOrderById(orderId);

    if (!order) {
      return errorResponse(res, 404, 'Orden no encontrada');
    }

    // Obtener items de la orden
    const items = await OrdersRepository.getOrderItems(orderId);

    return successResponse(res, 'Orden obtenida correctamente', { 
      order: { ...order, items } 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/my-orders
 * Obtener todas las órdenes del usuario autenticado
 */
export const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id; // Garantizado por middleware authenticate
    const { status, limit = 10, offset = 0 } = req.query;

    const orders = await OrdersRepository.getUserOrdersFiltered(
      userId,
      status || null,
      parseInt(limit),
      parseInt(offset)
    );

    return successResponse(res, 'Órdenes obtenidas correctamente', { 
      orders,
      count: orders.length 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders
 * Obtener todas las órdenes (admin only)
 * Permisos: admin (validado en rutas)
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, limit = 10, offset = 0 } = req.query;

    const orders = await OrdersRepository.getAllOrders(
      parseInt(limit),
      parseInt(offset),
      status || null
    );

    return successResponse(res, 'Órdenes obtenidas correctamente', { 
      orders,
      count: orders.length 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/orders/:orderId/status
 * Cambiar estado de una orden (admin only)
 * Permisos: admin (validado en rutas)
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, 400, 'El estado es requerido');
    }

    const order = await OrdersRepository.updateOrderStatus(orderId, status);

    if (!order) {
      return errorResponse(res, 404, 'Orden no encontrada');
    }

    return successResponse(res, `Orden actualizada a ${status}`, { order });
  } catch (error) {
    if (error.message.includes('Estado inválido')) {
      return errorResponse(res, 400, error.message);
    }
    next(error);
  }
};

/**
 * PATCH /api/orders/:orderId/instructions
 * Actualizar instrucciones especiales de una orden
 * Permisos: propietario o admin (pero validado en CONTROLLER para lógica de negocio)
 */
export const updateOrderInstructions = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { specialInstructions } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verificar que la orden existe
    const order = await OrdersRepository.getOrderById(orderId);

    if (!order) {
      return errorResponse(res, 404, 'Orden no encontrada');
    }

    // ⚠️ Validación de negocio: solo el propietario o admin pueden modificar
    if (order.user_id !== userId && userRole !== 'admin') {
      return errorResponse(res, 403, 'No tienes permiso para modificar esta orden');
    }

    // No permitir modificar órdenes completadas
    if (order.status === 'completed' || order.status === 'cancelled') {
      return errorResponse(res, 400, 'No puedes modificar una orden completada o cancelada');
    }

    const updatedOrder = await OrdersRepository.updateSpecialInstructions(
      orderId,
      specialInstructions
    );

    return successResponse(res, 'Instrucciones actualizadas correctamente', { order: updatedOrder });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/orders/:orderId
 * Eliminar una orden
 * Permisos: propietario o admin (validación de negocio)
 */
export const deleteOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await OrdersRepository.getOrderById(orderId);

    if (!order) {
      return errorResponse(res, 404, 'Orden no encontrada');
    }

    // Validación de negocio: solo el propietario o admin
    if (order.user_id !== userId && userRole !== 'admin') {
      return errorResponse(res, 403, 'No tienes permiso para eliminar esta orden');
    }

    // Validación de lógica: solo órdenes pending
    if (order.status !== 'pending') {
      return errorResponse(res, 400, 'Solo se pueden eliminar órdenes en estado pending');
    }

    const deletedOrder = await OrdersRepository.deleteOrder(orderId);

    return successResponse(res, 'Orden eliminada correctamente', { order: deletedOrder });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// ORDER ITEMS - Gestión de items en órdenes
// ============================================================

/**
 * POST /api/orders/:orderId/items
 * Agregar un item a una orden
 */
export const addOrderItem = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { menuItemId, quantity = 1, specialRequests } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validar inputs
    if (!menuItemId || quantity < 1) {
      return errorResponse(res, 400, 'menuItemId y quantity son requeridos y válidos');
    }

    // Verificar que la orden existe
    const order = await OrdersRepository.getOrderById(orderId);

    if (!order) {
      return errorResponse(res, 404, 'Orden no encontrada');
    }

    // Validación de negocio: solo propietario o admin
    if (order.user_id !== userId && userRole !== 'admin') {
      return errorResponse(res, 403, 'No tienes permiso para modificar esta orden');
    }

    // No permitir agregar items a órdenes completadas
    if (order.status === 'completed' || order.status === 'cancelled') {
      return errorResponse(res, 400, 'No puedes agregar items a una orden completada o cancelada');
    }

    // Validar que el item existe y está disponible
    const validationResult = await OrdersRepository.validateCartItems([{ menuItemId, quantity }]);

    if (!validationResult.valid) {
      if (validationResult.notFound.length > 0) {
        return errorResponse(res, 404, 'Item no encontrado', validationResult.notFound);
      }
      if (validationResult.unavailable.length > 0) {
        return errorResponse(res, 400, 'Item no disponible', validationResult.unavailable);
      }
    }

    // Obtener precio del item (necesitas acceder a menu_items)
    const { pool } = await import("../config/db.js");
    const priceResult = await pool.query(
      'SELECT price FROM public.menu_items WHERE id = $1',
      [menuItemId]
    );

    if (!priceResult.rows[0]) {
      return errorResponse(res, 404, 'Item no encontrado');
    }

    const price = priceResult.rows[0].price;
    const subtotal = price * quantity;

    // Agregar item
    const item = await OrdersRepository.addOrderItem(
      orderId,
      menuItemId,
      quantity,
      price,
      subtotal,
      specialRequests
    );

    // Sincronizar el total de la orden
    await OrdersRepository.syncOrderTotal(orderId);

    return successResponse(res, 'Item agregado a la orden', { item }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:orderId/items
 * Obtener todos los items de una orden
 */
export const getOrderItems = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Verificar que la orden existe
    const order = await OrdersRepository.getOrderById(orderId);

    if (!order) {
      return errorResponse(res, 404, 'Orden no encontrada');
    }

    const items = await OrdersRepository.getOrderItems(orderId);

    return successResponse(res, 'Items obtenidos correctamente', { 
      items,
      count: items.length 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/orders/:orderId/items/:itemId/quantity
 * Actualizar cantidad de un item
 */
export const updateOrderItemQuantity = async (req, res, next) => {
  try {
    const { orderId, itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validar input
    if (!quantity || quantity < 1) {
      return errorResponse(res, 400, 'La cantidad debe ser un número mayor a 0');
    }

    // Verificar que la orden existe
    const order = await OrdersRepository.getOrderById(orderId);

    if (!order) {
      return errorResponse(res, 404, 'Orden no encontrada');
    }

    // Validación de negocio
    if (order.user_id !== userId && userRole !== 'admin') {
      return errorResponse(res, 403, 'No tienes permiso para modificar esta orden');
    }

    // No permitir modificar órdenes completadas
    if (order.status === 'completed' || order.status === 'cancelled') {
      return errorResponse(res, 400, 'No puedes modificar una orden completada o cancelada');
    }

    // Verificar que el item existe en la orden
    const item = await OrdersRepository.getOrderItem(itemId);

    if (!item) {
      return errorResponse(res, 404, 'Item no encontrado en la orden');
    }

    // Actualizar cantidad
    const updatedItem = await OrdersRepository.updateOrderItemQuantity(itemId, quantity);

    // Sincronizar el total de la orden
    await OrdersRepository.syncOrderTotal(orderId);

    return successResponse(res, 'Cantidad actualizada correctamente', { item: updatedItem });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/orders/:orderId/items/:itemId
 * Eliminar un item de la orden
 */
export const removeOrderItem = async (req, res, next) => {
  try {
    const { orderId, itemId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verificar que la orden existe
    const order = await OrdersRepository.getOrderById(orderId);

    if (!order) {
      return errorResponse(res, 404, 'Orden no encontrada');
    }

    // Validación de negocio
    if (order.user_id !== userId && userRole !== 'admin') {
      return errorResponse(res, 403, 'No tienes permiso para modificar esta orden');
    }

    // No permitir modificar órdenes completadas
    if (order.status === 'completed' || order.status === 'cancelled') {
      return errorResponse(res, 400, 'No puedes modificar una orden completada o cancelada');
    }

    // Verificar que el item existe
    const item = await OrdersRepository.getOrderItem(itemId);

    if (!item) {
      return errorResponse(res, 404, 'Item no encontrado en la orden');
    }

    const deletedItem = await OrdersRepository.removeOrderItem(itemId);

    // Sincronizar el total de la orden
    await OrdersRepository.syncOrderTotal(orderId);

    return successResponse(res, 'Item eliminado correctamente', { item: deletedItem });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/orders/:orderId/items
 * Limpiar todos los items de una orden
 */
export const clearOrderItems = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verificar que la orden existe
    const order = await OrdersRepository.getOrderById(orderId);

    if (!order) {
      return errorResponse(res, 404, 'Orden no encontrada');
    }

    // Validación de negocio
    if (order.user_id !== userId && userRole !== 'admin') {
      return errorResponse(res, 403, 'No tienes permiso para modificar esta orden');
    }

    // No permitir modificar órdenes completadas
    if (order.status === 'completed' || order.status === 'cancelled') {
      return errorResponse(res, 400, 'No puedes modificar una orden completada o cancelada');
    }

    const count = await OrdersRepository.clearOrderItems(orderId);

    // Actualizar total a 0
    await OrdersRepository.updateOrderTotal(orderId, 0);

    return successResponse(res, `${count} items eliminados de la orden`, { count });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// CHECKOUT - Crear orden con items
// ============================================================

/**
 * POST /api/orders/checkout
 * Crear una orden completa con todos los items del carrito
 */
export const checkoutCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { cartItems, deliveryType = 'dine-in', specialInstructions } = req.body;

    // Validar que el carrito no esté vacío
    if (!cartItems || cartItems.length === 0) {
      return errorResponse(res, 400, 'El carrito no puede estar vacío');
    }

    // Validar tipo de entrega
    if (!['dine-in', 'delivery', 'takeout'].includes(deliveryType)) {
      return errorResponse(res, 400, 'Tipo de entrega inválido');
    }

    // Validar disponibilidad de items
    const validationResult = await OrdersRepository.validateCartItems(cartItems);

    if (!validationResult.valid) {
      const details = [...validationResult.unavailable, ...validationResult.notFound];
      return errorResponse(res, 400, 'Algunos items no están disponibles', details);
    }

    // Crear orden con items
    const order = await OrdersRepository.createOrderWithItems(
      userId,
      cartItems,
      deliveryType,
      specialInstructions
    );

    return successResponse(res, 'Orden creada exitosamente', { order }, 201);
  } catch (error) {
    if (error.message.includes('El carrito no puede estar vacío')) {
      return errorResponse(res, 400, error.message);
    }
    if (error.message.includes('Item no encontrado')) {
      return errorResponse(res, 404, error.message);
    }
    if (error.message.includes('Item no disponible')) {
      return errorResponse(res, 400, error.message);
    }
    next(error);
  }
};

// ============================================================
// ANÁLISIS Y ESTADÍSTICAS
// ============================================================

/**
 * GET /api/orders/public/top-items
 * Obtener items más vendidos
 */
export const getTopSellingItems = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const items = await OrdersRepository.getTopSellingItems(parseInt(limit));

    return successResponse(res, 'Items más vendidos obtenidos', { items });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/public/demand
 * Obtener demanda por hora y día
 */
export const getDemandByTime = async (req, res, next) => {
  try {
    const data = await OrdersRepository.getDemandByTime();

    return successResponse(res, 'Datos de demanda obtenidos', { data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/public/statistics
 * Obtener estadísticas generales
 */
export const getOrdersStatistics = async (req, res, next) => {
  try {
    const stats = await OrdersRepository.getOrdersStatistics();

    return successResponse(res, 'Estadísticas obtenidas', { statistics: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/analytics/summary
 * Obtener resumen de órdenes por usuario (admin only)
 */
export const getUserOrdersSummary = async (req, res, next) => {
  try {
    const summary = await OrdersRepository.getUserOrdersSummary();

    return successResponse(res, 'Resumen de órdenes por usuario', { summary });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/analytics/recent
 * Obtener órdenes recientes (admin only)
 */
export const getRecentOrders = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const orders = await OrdersRepository.getRecentOrders(parseInt(limit));

    return successResponse(res, 'Órdenes recientes obtenidas', { orders });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/analytics/by-delivery
 * Obtener estadísticas por tipo de entrega (admin only)
 */
export const getStatisticsByDeliveryType = async (req, res, next) => {
  try {
    const stats = await OrdersRepository.getStatisticsByDeliveryType();

    return successResponse(res, 'Estadísticas por tipo de entrega', { statistics: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/analytics/by-date
 * Obtener órdenes por rango de fechas (admin only)
 */
export const getOrdersByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return errorResponse(res, 400, 'startDate y endDate son requeridos (YYYY-MM-DD)');
    }

    const orders = await OrdersRepository.getOrdersByDateRange(startDate, endDate);

    return successResponse(res, 'Órdenes obtenidas por rango de fechas', { 
      orders,
      count: orders.length 
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  updateOrderInstructions,
  deleteOrder,
  addOrderItem,
  getOrderItems,
  updateOrderItemQuantity,
  removeOrderItem,
  clearOrderItems,
  checkoutCart,
  getTopSellingItems,
  getDemandByTime,
  getOrdersStatistics,
  getUserOrdersSummary,
  getRecentOrders,
  getStatisticsByDeliveryType,
  getOrdersByDateRange
};
