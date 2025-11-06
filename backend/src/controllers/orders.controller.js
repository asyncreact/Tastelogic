// src/controllers/orders.controller.js

import {
  createOrder,
  getOrderById,
  getOrdersByUserId,
  getAllOrders,
  updateOrderStatus,
  updateOrder,
  updateOrderPartial,
  deleteOrder,
  cancelOrder,
  addOrderItem,
  getOrderItems,
  getOrderItemById,
  updateOrderItem,
  updateOrderItemPartial,
  deleteOrderItem,
  clearOrderItems,
  createOrderWithItems,
  validateCartItems,
  calculateOrderTotal,
  syncOrderTotal,
  calculateOrderETA,
  getUserOrdersFiltered,
  createDineInOrderWithTable,
  getOrderWithTable,
  getTableWithOrders,
  moveOrderToTable,
  getOccupiedTables,
  getOrdersStatistics,
  getRecentOrders,
  getStatisticsByDeliveryType,
  getOrdersByDateRange,
} from "../repositories/orders.repository.js";

import { successResponse, errorResponse } from "../utils/response.js";

// ============================================================
// ÓRDENES - CRUD BÁSICO
// ============================================================

export const createNewOrder = async (req, res, next) => {
  try {
    const { user_id, total_amount, delivery_type, special_instructions } = req.body;
    if (!user_id) {
      return errorResponse(res, 400, "user_id es requerido");
    }

    const order = await createOrder(user_id, total_amount, delivery_type, special_instructions);
    return successResponse(res, "Orden creada correctamente", { order }, 201);
  } catch (err) {
    console.error("Error en createNewOrder:", err);
    next(err);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);
    if (isNaN(order_id) || order_id <= 0) {
      return errorResponse(res, 400, "ID de orden inválido");
    }

    const order = await getOrderById(order_id);
    if (!order) {
      return errorResponse(res, 404, "Orden no encontrada");
    }

    return successResponse(res, "Orden obtenida correctamente", { order }, 200);
  } catch (err) {
    console.error("Error en getOrder:", err);
    next(err);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const user_id = Number(req.params.user_id);
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

    if (isNaN(user_id) || user_id <= 0) {
      return errorResponse(res, 400, "ID de usuario inválido");
    }

    const orders = await getOrdersByUserId(user_id, limit, offset);
    return successResponse(
      res,
      "Órdenes del usuario obtenidas correctamente",
      {
        orders,
        count: orders.length,
        limit,
        offset,
      },
      200
    );
  } catch (err) {
    console.error("Error en getUserOrders:", err);
    next(err);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;
    const status = req.query.status || null;

    const orders = await getAllOrders(limit, offset, status);
    return successResponse(
      res,
      "Órdenes obtenidas correctamente",
      {
        orders,
        count: orders.length,
        limit,
        offset,
      },
      200
    );
  } catch (err) {
    console.error("Error en getOrders:", err);
    next(err);
  }
};

export const updateOrderState = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);
    const { status } = req.body;

    if (isNaN(order_id) || order_id <= 0) {
      return errorResponse(res, 400, "ID de orden inválido");
    }

    if (!status) {
      return errorResponse(res, 400, "status es requerido");
    }

    const updated = await updateOrderStatus(order_id, status);
    if (!updated) {
      return errorResponse(res, 404, "Orden no encontrada");
    }

    return successResponse(res, "Estado de orden actualizado correctamente", { order: updated }, 200);
  } catch (err) {
    if (err.message.includes("Estado inválido")) {
      return errorResponse(res, 400, err.message);
    }

    console.error("Error en updateOrderState:", err);
    next(err);
  }
};

export const editOrder = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);
    if (isNaN(order_id) || order_id <= 0) {
      return errorResponse(res, 400, "ID de orden inválido");
    }

    const existing = await getOrderById(order_id);
    if (!existing) {
      return errorResponse(res, 404, "Orden no encontrada");
    }

    const updated = await updateOrder(order_id, req.body);
    return successResponse(res, "Orden actualizada correctamente", { order: updated }, 200);
  } catch (err) {
    if (err.message.includes("Estado inválido")) {
      return errorResponse(res, 400, err.message);
    }

    console.error("Error en editOrder:", err);
    next(err);
  }
};

export const patchOrder = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);
    if (isNaN(order_id) || order_id <= 0) {
      return errorResponse(res, 400, "ID de orden inválido");
    }

    const existing = await getOrderById(order_id);
    if (!existing) {
      return errorResponse(res, 404, "Orden no encontrada");
    }

    const updated = await updateOrderPartial(order_id, req.body);
    if (!updated) {
      return errorResponse(res, 400, "No se pudo actualizar la orden");
    }

    return successResponse(res, "Orden actualizada parcialmente", { order: updated }, 200);
  } catch (err) {
    if (err.message.includes("campos válidos")) {
      return errorResponse(res, 400, err.message);
    }

    console.error("Error en patchOrder:", err);
    next(err);
  }
};

export const removeOrder = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);
    if (isNaN(order_id) || order_id <= 0) {
      return errorResponse(res, 400, "ID de orden inválido");
    }

    const order = await getOrderById(order_id);
    if (!order) {
      return errorResponse(res, 404, "Orden no encontrada");
    }

    const result = await deleteOrder(order_id);
    return successResponse(res, result.message, {}, 200);
  } catch (err) {
    console.error("Error en removeOrder:", err);
    next(err);
  }
};

export const cancelOrderHandler = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);
    if (isNaN(order_id) || order_id <= 0) {
      return errorResponse(res, 400, "ID de orden inválido");
    }

    const result = await cancelOrder(order_id);
    if (!result) {
      return errorResponse(res, 404, "Orden no encontrada");
    }

    return successResponse(res, "Orden cancelada correctamente", { order: result }, 200);
  } catch (err) {
    console.error("Error en cancelOrderHandler:", err);
    next(err);
  }
};

// ============================================================
// ORDER ITEMS
// ============================================================

export const addItemToOrder = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);
    const { menu_item_id, quantity, special_requests } = req.body;

    if (isNaN(order_id) || order_id <= 0) {
      return errorResponse(res, 400, "ID de orden inválido");
    }

    if (!menu_item_id || menu_item_id <= 0) {
      return errorResponse(res, 400, "menu_item_id es requerido y debe ser positivo");
    }

    if (!quantity || quantity <= 0 || quantity > 99) {
      return errorResponse(res, 400, "quantity debe estar entre 1 y 99");
    }

    const order = await getOrderById(order_id);
    if (!order) {
      return errorResponse(res, 404, "Orden no encontrada");
    }

    const item_query = `SELECT price, is_available FROM public.menu_items WHERE id = $1;`;
    const { pool } = await import("../config/db.js");
    const item_result = await pool.query(item_query, [menu_item_id]);

    if (!item_result.rows[0]) {
      return errorResponse(res, 404, "Item del menú no encontrado");
    }

    if (!item_result.rows[0].is_available) {
      return errorResponse(res, 400, "Item no está disponible");
    }

    const price = item_result.rows[0].price;
    const item = await addOrderItem(order_id, menu_item_id, quantity, price, special_requests);
    await syncOrderTotal(order_id);

    return successResponse(res, "Item agregado a la orden", { item }, 201);
  } catch (err) {
    console.error("Error en addItemToOrder:", err);
    next(err);
  }
};

export const getOrderItemsByOrder = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);
    if (isNaN(order_id) || order_id <= 0) {
      return errorResponse(res, 400, "ID de orden inválido");
    }

    const items = await getOrderItems(order_id);
    return successResponse(
      res,
      "Items de la orden obtenidos correctamente",
      {
        items,
        count: items.length,
      },
      200
    );
  } catch (err) {
    console.error("Error en getOrderItemsByOrder:", err);
    next(err);
  }
};

export const editOrderItem = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);
    const item_id = Number(req.params.item_id);

    if (isNaN(order_id) || order_id <= 0) {
      return errorResponse(res, 400, "ID de orden inválido");
    }

    if (isNaN(item_id) || item_id <= 0) {
      return errorResponse(res, 400, "ID de item inválido");
    }

    const updated = await updateOrderItem(item_id, req.body);
    if (!updated) {
      return errorResponse(res, 404, "Item de orden no encontrado");
    }

    const item = await getOrderItemById(item_id);
    if (item) {
      await syncOrderTotal(item.order_id);
    }

    return successResponse(res, "Item de orden actualizado correctamente", { item: updated }, 200);
  } catch (err) {
    console.error("Error en editOrderItem:", err);
    next(err);
  }
};

export const patchOrderItem = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);
    const item_id = Number(req.params.item_id);

    if (isNaN(order_id) || order_id <= 0) {
      return errorResponse(res, 400, "ID de orden inválido");
    }

    if (isNaN(item_id) || item_id <= 0) {
      return errorResponse(res, 400, "ID de item inválido");
    }

    const updated = await updateOrderItemPartial(item_id, req.body);
    if (!updated) {
      return errorResponse(res, 400, "No se pudo actualizar el item de orden");
    }

    return successResponse(res, "Item de orden actualizado parcialmente", { item: updated }, 200);
  } catch (err) {
    console.error("Error en patchOrderItem:", err);
    next(err);
  }
};

export const removeOrderItem = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);
    const item_id = Number(req.params.item_id);

    if (isNaN(order_id) || order_id <= 0) {
      return errorResponse(res, 400, "ID de orden inválido");
    }

    if (isNaN(item_id) || item_id <= 0) {
      return errorResponse(res, 400, "ID de item inválido");
    }

    const result = await deleteOrderItem(item_id);
    if (!result) {
      return errorResponse(res, 404, "Item de orden no encontrado");
    }

    return successResponse(res, result.message, {}, 200);
  } catch (err) {
    console.error("Error en removeOrderItem:", err);
    next(err);
  }
};

export const clearOrderItemsHandler = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);
    if (isNaN(order_id) || order_id <= 0) {
      return errorResponse(res, 400, "ID de orden inválido");
    }

    const order = await getOrderById(order_id);
    if (!order) {
      return errorResponse(res, 404, "Orden no encontrada");
    }

    const count = await clearOrderItems(order_id);
    await syncOrderTotal(order_id);

    return successResponse(
      res,
      "Todos los items de la orden han sido eliminados",
      {
        order_id,
        items_removed: count,
      },
      200
    );
  } catch (err) {
    console.error("Error en clearOrderItemsHandler:", err);
    next(err);
  }
};

// ============================================================
// OPERACIONES COMPLEJAS
// ============================================================

export const createFullOrder = async (req, res, next) => {
  try {
    const { user_id, cart_items, delivery_type = "dine-in", special_instructions } = req.body;

    if (!user_id || !cart_items || cart_items.length === 0) {
      return errorResponse(res, 400, "user_id y cart_items son requeridos");
    }

    const validation = await validateCartItems(cart_items);
    if (!validation.valid) {
      return errorResponse(res, 400, "Algunos items no están disponibles", {
        unavailable: validation.unavailable,
        not_found: validation.not_found,
      });
    }

    const order = await createOrderWithItems(user_id, cart_items, delivery_type, special_instructions);
    return successResponse(
      res,
      "Orden creada correctamente con items",
      {
        order,
        estimated_prep_time: order.estimated_prep_time || 0,
      },
      201
    );
  } catch (err) {
    if (err.message.includes("no encontrado") || err.message.includes("no disponible")) {
      return errorResponse(res, 400, err.message);
    }

    console.error("Error en createFullOrder:", err);
    next(err);
  }
};

export const validateCart = async (req, res, next) => {
  try {
    const { cart_items } = req.body;

    if (!cart_items || !Array.isArray(cart_items)) {
      return errorResponse(res, 400, "cart_items debe ser un array");
    }

    for (const item of cart_items) {
      if (!item.menu_item_id || item.menu_item_id <= 0) {
        return errorResponse(res, 400, `Item debe incluir menu_item_id válido: ${JSON.stringify(item)}`);
      }
    }

    const validation = await validateCartItems(cart_items);
    return successResponse(
      res,
      "Carrito validado correctamente",
      {
        valid: validation.valid,
        not_found: validation.not_found || [],
        unavailable: validation.unavailable || [],
        total_items: cart_items.length,
      },
      200
    );
  } catch (err) {
    console.error("Error en validateCart:", err);
    next(err);
  }
};

export const recalculateTotal = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);
    if (isNaN(order_id) || order_id <= 0) {
      return errorResponse(res, 400, "ID de orden inválido");
    }

    const order = await getOrderById(order_id);
    if (!order) {
      return errorResponse(res, 404, "Orden no encontrada");
    }

    const updated = await syncOrderTotal(order_id);
    return successResponse(res, "Total de orden recalculado correctamente", { order: updated }, 200);
  } catch (err) {
    console.error("Error en recalculateTotal:", err);
    next(err);
  }
};

export const getOrderTotalHandler = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);
    if (isNaN(order_id) || order_id <= 0) {
      return errorResponse(res, 400, "ID de orden inválido");
    }

    const order = await getOrderById(order_id);
    if (!order) {
      return errorResponse(res, 404, "Orden no encontrada");
    }

    const totals = await calculateOrderTotal(order_id);
    return successResponse(
      res,
      "Total de orden calculado correctamente",
      {
        order_id,
        total_amount: totals.total_amount,
        items_count: totals.items_count,
        total_quantity: totals.total_quantity,
      },
      200
    );
  } catch (err) {
    console.error("Error en getOrderTotalHandler:", err);
    next(err);
  }
};

// ============================================================
// DINE-IN CON MESAS
// ============================================================

export const createDineInOrder = async (req, res, next) => {
  try {
    const { user_id, table_id, cart_items, special_instructions } = req.body;

    if (!user_id || !table_id || !cart_items) {
      return errorResponse(res, 400, "user_id, table_id y cart_items son requeridos");
    }

    const order = await createDineInOrderWithTable(user_id, table_id, cart_items, special_instructions);
    return successResponse(res, "Orden dine-in creada correctamente", { order }, 201);
  } catch (err) {
    if (err.message.includes("no disponible") || err.message.includes("no existe")) {
      return errorResponse(res, 400, err.message);
    }

    console.error("Error en createDineInOrder:", err);
    next(err);
  }
};

export const getOrderWithTableInfo = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);
    if (isNaN(order_id) || order_id <= 0) {
      return errorResponse(res, 400, "ID de orden inválido");
    }

    const order = await getOrderWithTable(order_id);
    if (!order) {
      return errorResponse(res, 404, "Orden no encontrada");
    }

    return successResponse(res, "Orden con información de mesa obtenida", { order }, 200);
  } catch (err) {
    console.error("Error en getOrderWithTableInfo:", err);
    next(err);
  }
};

export const getTableWithOrderInfo = async (req, res, next) => {
  try {
    const table_id = Number(req.params.table_id);
    if (isNaN(table_id) || table_id <= 0) {
      return errorResponse(res, 400, "ID de mesa inválido");
    }

    const table = await getTableWithOrders(table_id);
    if (!table) {
      return errorResponse(res, 404, "Mesa no encontrada o sin órdenes activas");
    }

    return successResponse(res, "Mesa con información de orden obtenida", { table }, 200);
  } catch (err) {
    console.error("Error en getTableWithOrderInfo:", err);
    next(err);
  }
};

export const moveOrder = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);
    const { new_table_id } = req.body;

    if (isNaN(order_id) || order_id <= 0) {
      return errorResponse(res, 400, "ID de orden inválido");
    }

    if (!new_table_id) {
      return errorResponse(res, 400, "new_table_id es requerido");
    }

    const result = await moveOrderToTable(order_id, new_table_id);
    if (!result?.success) {
      return errorResponse(res, 400, result?.message || "No se pudo mover la orden");
    }

    return successResponse(
      res,
      result.message,
      {
        order_id,
        table_id: new_table_id,
      },
      200
    );
  } catch (err) {
    console.error("Error en moveOrder:", err);
    next(err);
  }
};

export const getOccupied = async (req, res, next) => {
  try {
    const tables = await getOccupiedTables();
    return successResponse(
      res,
      "Mesas ocupadas obtenidas correctamente",
      {
        tables,
        count: tables.length,
      },
      200
    );
  } catch (err) {
    console.error("Error en getOccupied:", err);
    next(err);
  }
};

// ============================================================
// ESTADÍSTICAS Y REPORTES
// ============================================================

export const getStatistics = async (req, res, next) => {
  try {
    const stats = await getOrdersStatistics();
    return successResponse(res, "Estadísticas de órdenes obtenidas correctamente", { statistics: stats }, 200);
  } catch (err) {
    console.error("Error en getStatistics:", err);
    next(err);
  }
};

export const getRecentOrdersList = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const orders = await getRecentOrders(limit);

    return successResponse(
      res,
      "Órdenes recientes obtenidas correctamente",
      {
        orders,
        count: orders.length,
      },
      200
    );
  } catch (err) {
    console.error("Error en getRecentOrdersList:", err);
    next(err);
  }
};

export const getStatisticsByType = async (req, res, next) => {
  try {
    const stats = await getStatisticsByDeliveryType();
    return successResponse(res, "Estadísticas por tipo de entrega obtenidas", { statistics: stats }, 200);
  } catch (err) {
    console.error("Error en getStatisticsByType:", err);
    next(err);
  }
};

export const getOrdersByDateRangeHandler = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return errorResponse(res, 400, "start_date y end_date son requeridos");
    }

    const orders = await getOrdersByDateRange(start_date, end_date);
    return successResponse(
      res,
      "Órdenes por rango de fechas obtenidas",
      {
        orders,
        count: orders.length,
        start_date,
        end_date,
      },
      200
    );
  } catch (err) {
    console.error("Error en getOrdersByDateRangeHandler:", err);
    next(err);
  }
};

export const getFilteredUserOrders = async (req, res, next) => {
  try {
    const user_id = Number(req.params.user_id);
    const status = req.query.status || null;
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

    if (isNaN(user_id) || user_id <= 0) {
      return errorResponse(res, 400, "ID de usuario inválido");
    }

    const orders = await getUserOrdersFiltered(user_id, status, limit, offset);
    return successResponse(
      res,
      "Órdenes filtradas del usuario obtenidas",
      {
        orders,
        count: orders.length,
        status,
        limit,
        offset,
      },
      200
    );
  } catch (err) {
    console.error("Error en getFilteredUserOrders:", err);
    next(err);
  }
};
