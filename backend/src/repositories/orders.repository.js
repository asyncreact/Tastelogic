// repositories/orders.repository.js

import { pool } from "../config/db.js";

/**
 * Repository para manejar todas las operaciones de órdenes en la BD
 */

export class OrdersRepository {
  // ============================================================
  // ÓRDENES - CRUD Básico
  // ============================================================

  /**
   * Crear una nueva orden
   * @param {number} userId - ID del usuario
   * @param {number} totalAmount - Monto total de la orden
   * @param {string} deliveryType - Tipo de entrega (dine-in, delivery, takeout)
   * @param {string} specialInstructions - Instrucciones especiales
   * @returns {Promise<Object>} - La orden creada
   */
  static async createOrder(userId, totalAmount = 0, deliveryType = 'dine-in', specialInstructions = null) {
    const query = `
      INSERT INTO public.orders 
      (user_id, total_amount, status, delivery_type, special_instructions)
      VALUES ($1, $2, 'pending', $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(query, [userId, totalAmount, deliveryType, specialInstructions]);
    return result.rows[0];
  }

  /**
   * Obtener una orden por ID
   * @param {number} orderId - ID de la orden
   * @returns {Promise<Object>} - Detalles de la orden
   */
  static async getOrderById(orderId) {
    const query = `
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email
      FROM public.orders o
      JOIN public.users u ON o.user_id = u.id
      WHERE o.id = $1;
    `;
    const result = await pool.query(query, [orderId]);
    return result.rows[0];
  }

  /**
   * Obtener todas las órdenes de un usuario
   * @param {number} userId - ID del usuario
   * @param {number} limit - Límite de registros
   * @param {number} offset - Offset para paginación
   * @returns {Promise<Array>} - Lista de órdenes
   */
  static async getOrdersByUserId(userId, limit = 10, offset = 0) {
    const query = `
      SELECT 
        o.*,
        COUNT(oi.id) as items_count,
        SUM(oi.quantity) as total_items
      FROM public.orders o
      LEFT JOIN public.order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.order_date DESC
      LIMIT $2 OFFSET $3;
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  /**
   * Obtener todas las órdenes (admin)
   * @param {number} limit - Límite de registros
   * @param {number} offset - Offset para paginación
   * @param {string} status - Filtrar por estado (opcional)
   * @returns {Promise<Array>} - Lista de órdenes
   */
  static async getAllOrders(limit = 10, offset = 0, status = null) {
    let query = `
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email,
        COUNT(oi.id) as items_count
      FROM public.orders o
      JOIN public.users u ON o.user_id = u.id
      LEFT JOIN public.order_items oi ON o.id = oi.order_id
    `;

    const params = [];

    if (status) {
      query += ` WHERE o.status = $${params.length + 1}`;
      params.push(status);
    }

    query += `
      GROUP BY o.id, u.id
      ORDER BY o.order_date DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
    `;

    params.push(limit, offset);
    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Actualizar estado de una orden
   * @param {number} orderId - ID de la orden
   * @param {string} status - Nuevo estado
   * @returns {Promise<Object>} - Orden actualizada
   */
  static async updateOrderStatus(orderId, status) {
    const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Estado inválido: ${status}. Debe ser uno de: ${validStatuses.join(', ')}`);
    }

    const query = `
      UPDATE public.orders
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [status, orderId]);
    return result.rows[0];
  }

  /**
   * Actualizar monto total de una orden
   * @param {number} orderId - ID de la orden
   * @param {number} totalAmount - Nuevo monto total
   * @returns {Promise<Object>} - Orden actualizada
   */
  static async updateOrderTotal(orderId, totalAmount) {
    const query = `
      UPDATE public.orders
      SET total_amount = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [totalAmount, orderId]);
    return result.rows[0];
  }

  /**
   * Actualizar instrucciones especiales
   * @param {number} orderId - ID de la orden
   * @param {string} specialInstructions - Nuevas instrucciones
   * @returns {Promise<Object>} - Orden actualizada
   */
  static async updateSpecialInstructions(orderId, specialInstructions) {
    const query = `
      UPDATE public.orders
      SET special_instructions = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [specialInstructions, orderId]);
    return result.rows[0];
  }

  /**
   * Eliminar una orden
   * @param {number} orderId - ID de la orden
   * @returns {Promise<Object>} - Orden eliminada
   */
  static async deleteOrder(orderId) {
    const query = `
      DELETE FROM public.orders
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [orderId]);
    return result.rows[0];
  }

  // ============================================================
  // ORDER ITEMS - Items dentro de una orden
  // ============================================================

  /**
   * Agregar un item a una orden
   * @param {number} orderId - ID de la orden
   * @param {number} menuItemId - ID del item del menú
   * @param {number} quantity - Cantidad
   * @param {number} price - Precio unitario
   * @param {number} subtotal - Subtotal
   * @param {string} specialRequests - Solicitudes especiales
   * @returns {Promise<Object>} - Item de orden creado
   */
  static async addOrderItem(orderId, menuItemId, quantity, price, subtotal, specialRequests = null) {
    const query = `
      INSERT INTO public.order_items 
      (order_id, menu_item_id, quantity, price, subtotal, special_requests)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const result = await pool.query(query, [orderId, menuItemId, quantity, price, subtotal, specialRequests]);
    return result.rows[0];
  }

  /**
   * Obtener todos los items de una orden
   * @param {number} orderId - ID de la orden
   * @returns {Promise<Array>} - Items de la orden
   */
  static async getOrderItems(orderId) {
    const query = `
      SELECT 
        oi.*,
        mi.name as item_name,
        mi.description,
        mi.image_url,
        mi.is_available
      FROM public.order_items oi
      JOIN public.menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = $1
      ORDER BY oi.created_at ASC;
    `;
    const result = await pool.query(query, [orderId]);
    return result.rows;
  }

  /**
   * Obtener un item específico de una orden
   * @param {number} orderItemId - ID del item de orden
   * @returns {Promise<Object>} - Item de la orden
   */
  static async getOrderItem(orderItemId) {
    const query = `
      SELECT 
        oi.*,
        mi.name as item_name,
        mi.description,
        mi.price as original_price
      FROM public.order_items oi
      JOIN public.menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.id = $1;
    `;
    const result = await pool.query(query, [orderItemId]);
    return result.rows[0];
  }

  /**
   * Actualizar cantidad de un item en una orden
   * @param {number} orderItemId - ID del item de orden
   * @param {number} newQuantity - Nueva cantidad
   * @returns {Promise<Object>} - Item actualizado
   */
  static async updateOrderItemQuantity(orderItemId, newQuantity) {
    const query = `
      SELECT price FROM public.order_items WHERE id = $1;
    `;
    const priceResult = await pool.query(query, [orderItemId]);
    
    if (!priceResult.rows[0]) {
      throw new Error('Item de orden no encontrado');
    }

    const unitPrice = priceResult.rows[0].price;
    const newSubtotal = unitPrice * newQuantity;

    const updateQuery = `
      UPDATE public.order_items
      SET quantity = $1, subtotal = $2
      WHERE id = $3
      RETURNING *;
    `;
    const result = await pool.query(updateQuery, [newQuantity, newSubtotal, orderItemId]);
    return result.rows[0];
  }

  /**
   * Eliminar un item de una orden
   * @param {number} orderItemId - ID del item de orden
   * @returns {Promise<Object>} - Item eliminado
   */
  static async removeOrderItem(orderItemId) {
    const query = `
      DELETE FROM public.order_items
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [orderItemId]);
    return result.rows[0];
  }

  /**
   * Eliminar todos los items de una orden
   * @param {number} orderId - ID de la orden
   * @returns {Promise<number>} - Cantidad de items eliminados
   */
  static async clearOrderItems(orderId) {
    const query = `
      DELETE FROM public.order_items
      WHERE order_id = $1;
    `;
    const result = await pool.query(query, [orderId]);
    return result.rowCount;
  }

  // ============================================================
  // OPERACIONES COMPLEJAS - Transacciones
  // ============================================================

  /**
   * Crear orden completa con items en una transacción
   * Garantiza que todos los items se agregan o ninguno
   * @param {number} userId - ID del usuario
   * @param {Array} cartItems - Array de {menuItemId, quantity, specialRequests}
   * @param {string} deliveryType - Tipo de entrega (dine-in, delivery, takeout)
   * @param {string} specialInstructions - Instrucciones generales
   * @returns {Promise<Object>} - Orden creada con items
   */
  static async createOrderWithItems(userId, cartItems, deliveryType = 'dine-in', specialInstructions = null) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Validar que el carrito no esté vacío
      if (!cartItems || cartItems.length === 0) {
        throw new Error('El carrito no puede estar vacío');
      }

      // 2. Crear orden inicial
      const orderResult = await client.query(
        `INSERT INTO public.orders 
         (user_id, total_amount, status, delivery_type, special_instructions)
         VALUES ($1, 0, 'pending', $2, $3)
         RETURNING *;`,
        [userId, deliveryType, specialInstructions]
      );

      const order = orderResult.rows[0];
      let totalAmount = 0;

      // 3. Agregar items a la orden
      for (const item of cartItems) {
        // Validar que el item existe y obtener precio actual
        const priceResult = await client.query(
          `SELECT price, is_available FROM public.menu_items WHERE id = $1;`,
          [item.menuItemId]
        );

        if (!priceResult.rows[0]) {
          throw new Error(`Item no encontrado: ${item.menuItemId}`);
        }

        if (!priceResult.rows[0].is_available) {
          throw new Error(`Item no disponible: ${item.menuItemId}`);
        }

        const price = priceResult.rows[0].price;
        const quantity = Math.max(1, Math.min(item.quantity || 1, 99)); // 1-99 items
        const subtotal = price * quantity;
        totalAmount += subtotal;

        // Insertar item (automáticamente poblará order_history mediante TRIGGER)
        await client.query(
          `INSERT INTO public.order_items 
           (order_id, menu_item_id, quantity, price, subtotal, special_requests)
           VALUES ($1, $2, $3, $4, $5, $6);`,
          [order.id, item.menuItemId, quantity, price, subtotal, item.specialRequests || null]
        );
      }

      // 4. Actualizar monto total de la orden
      await client.query(
        `UPDATE public.orders SET total_amount = $1 WHERE id = $2;`,
        [totalAmount, order.id]
      );

      await client.query('COMMIT');

      return {
        ...order,
        total_amount: totalAmount,
        items_count: cartItems.length
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Validar disponibilidad de items antes de crear orden
   * @param {Array} cartItems - Array de {menuItemId, quantity}
   * @returns {Promise<Object>} - {valid: boolean, unavailable: Array, notFound: Array}
   */
  static async validateCartItems(cartItems) {
    if (!cartItems || cartItems.length === 0) {
      return { valid: false, error: 'El carrito está vacío' };
    }

    const unavailable = [];
    const notFound = [];

    for (const item of cartItems) {
      const result = await pool.query(
        `SELECT id, is_available, name FROM public.menu_items WHERE id = $1;`,
        [item.menuItemId]
      );

      if (!result.rows[0]) {
        notFound.push({ id: item.menuItemId, reason: 'No existe' });
      } else if (!result.rows[0].is_available) {
        unavailable.push({ 
          id: item.menuItemId, 
          name: result.rows[0].name,
          reason: 'No disponible' 
        });
      }
    }

    return {
      valid: unavailable.length === 0 && notFound.length === 0,
      unavailable,
      notFound
    };
  }

  /**
   * Calcular total de una orden
   * @param {number} orderId - ID de la orden
   * @returns {Promise<Object>} - {totalAmount, itemsCount}
   */
  static async calculateOrderTotal(orderId) {
    const query = `
      SELECT 
        SUM(subtotal) as total_amount,
        COUNT(*) as items_count,
        SUM(quantity) as total_quantity
      FROM public.order_items
      WHERE order_id = $1;
    `;
    const result = await pool.query(query, [orderId]);
    return result.rows[0] || { total_amount: 0, items_count: 0, total_quantity: 0 };
  }

  /**
   * Sincronizar total de orden (actualizar desde items)
   * @param {number} orderId - ID de la orden
   * @returns {Promise<Object>} - Orden actualizada
   */
  static async syncOrderTotal(orderId) {
    const totals = await this.calculateOrderTotal(orderId);
    return this.updateOrderTotal(orderId, totals.total_amount || 0);
  }

  /**
   * Cancelar orden (cambiar estado a cancelled)
   * @param {number} orderId - ID de la orden
   * @returns {Promise<Object>} - Orden cancelada
   */
  static async cancelOrder(orderId) {
    return this.updateOrderStatus(orderId, 'cancelled');
  }

  /**
   * Obtener órdenes por usuario con paginación avanzada
   * @param {number} userId - ID del usuario
   * @param {string} status - Filtrar por estado (opcional)
   * @param {number} limit - Límite de registros
   * @param {number} offset - Offset para paginación
   * @returns {Promise<Array>} - Órdenes filtradas
   */
  static async getUserOrdersFiltered(userId, status = null, limit = 10, offset = 0) {
    let query = `
      SELECT 
        o.*,
        COUNT(oi.id) as items_count,
        SUM(oi.quantity) as total_items
      FROM public.orders o
      LEFT JOIN public.order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
    `;

    const params = [userId];

    if (status) {
      query += ` AND o.status = $${params.length + 1}`;
      params.push(status);
    }

    query += `
      GROUP BY o.id
      ORDER BY o.order_date DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
    `;

    params.push(limit, offset);
    const result = await pool.query(query, params);
    return result.rows;
  }

  // ============================================================
  // ANÁLISIS Y ESTADÍSTICAS
  // ============================================================

  /**
   * Obtener estadísticas de órdenes por usuario
   * @returns {Promise<Array>} - Resumen de órdenes por usuario
   */
  static async getUserOrdersSummary() {
    const query = `
      SELECT * FROM public.user_orders_summary
      ORDER BY total_spent DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Obtener items más vendidos
   * @param {number} limit - Cantidad de items a retornar
   * @returns {Promise<Array>} - Items más vendidos
   */
  static async getTopSellingItems(limit = 10) {
    const query = `
      SELECT * FROM public.top_selling_items
      LIMIT $1;
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  /**
   * Obtener demanda por hora y día
   * @returns {Promise<Array>} - Demanda por hora y día
   */
  static async getDemandByTime() {
    const query = `
      SELECT * FROM public.demand_by_time
      ORDER BY hour, day_of_week;
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Obtener resumen de órdenes (total, promedio, etc.)
   * @returns {Promise<Object>} - Estadísticas generales
   */
  static async getOrdersStatistics() {
    const query = `
      SELECT 
        COUNT(DISTINCT id) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_order_value,
        COUNT(DISTINCT user_id) as unique_customers,
        MAX(order_date) as last_order_date,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_orders,
        COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM public.orders;
    `;
    const result = await pool.query(query);
    return result.rows[0] || {
      total_orders: 0,
      total_revenue: 0,
      avg_order_value: 0,
      unique_customers: 0
    };
  }

  /**
   * Obtener órdenes recientes
   * @param {number} limit - Cantidad de órdenes a retornar
   * @returns {Promise<Array>} - Órdenes recientes
   */
  static async getRecentOrders(limit = 10) {
    const query = `
      SELECT 
        o.*,
        u.name as user_name,
        COUNT(oi.id) as items_count
      FROM public.orders o
      JOIN public.users u ON o.user_id = u.id
      LEFT JOIN public.order_items oi ON o.id = oi.order_id
      GROUP BY o.id, u.id
      ORDER BY o.order_date DESC
      LIMIT $1;
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  /**
   * Obtener estadísticas por tipo de entrega
   * @returns {Promise<Array>} - Estadísticas por delivery_type
   */
  static async getStatisticsByDeliveryType() {
    const query = `
      SELECT 
        delivery_type,
        COUNT(*) as order_count,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_order_value
      FROM public.orders
      WHERE status = 'completed'
      GROUP BY delivery_type
      ORDER BY total_revenue DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Obtener órdenes por rango de fechas
   * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
   * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Array>} - Órdenes en el rango
   */
  static async getOrdersByDateRange(startDate, endDate) {
    const query = `
      SELECT 
        o.*,
        u.name as user_name,
        COUNT(oi.id) as items_count
      FROM public.orders o
      JOIN public.users u ON o.user_id = u.id
      LEFT JOIN public.order_items oi ON o.id = oi.order_id
      WHERE DATE(o.order_date) BETWEEN $1 AND $2
      GROUP BY o.id, u.id
      ORDER BY o.order_date DESC;
    `;
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  }
}

export default OrdersRepository;
