// src/repositories/orders.repository.js

import { pool } from "../config/db.js";

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

const validateId = (id) => {
  const numId = Number(id);
  return isNaN(numId) || numId <= 0 ? null : numId;
};

const ALLOWED_ORDER_FIELDS = [
  "status",
  "delivery_type",
  "special_instructions",
  "total_amount"
];

const ALLOWED_ORDER_ITEM_FIELDS = [
  "quantity",
  "special_requests"
];

const filterAllowedFields = (data, allowedFields) => {
  const filtered = {};
  Object.keys(data).forEach((key) => {
    if (allowedFields.includes(key)) {
      filtered[key] = data[key];
    }
  });
  return filtered;
};

// ============================================================
// ÓRDENES - CRUD Básico
// ============================================================

export const createOrder = async (
  user_id,
  total_amount = 0,
  delivery_type = 'dine-in',
  special_instructions = null
) => {
  try {
    const query = `
      INSERT INTO public.orders
      (user_id, total_amount, status, delivery_type, special_instructions)
      VALUES ($1, $2, 'pending', $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(query, [
      user_id,
      total_amount,
      delivery_type,
      special_instructions
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Error al crear orden:", error);
    throw error;
  }
};

export const getOrderById = async (id) => {
  try {
    const order_id = validateId(id);
    if (!order_id) return null;

    const query = `
      SELECT
        o.*,
        u.name as user_name,
        u.email as user_email
      FROM public.orders o
      JOIN public.users u ON o.user_id = u.id
      WHERE o.id = $1;
    `;
    const result = await pool.query(query, [order_id]);
    if (!result.rows[0]) return null;

    const order = result.rows[0];

    // ✅ CALCULA ETA
    const eta_data = await calculateOrderETA(order_id);
    order.estimated_prep_time = eta_data?.max_prep_time || 0;
    order.items_count = eta_data?.total_items || 0;

    return order;
  } catch (error) {
    console.error("Error al obtener orden por ID:", error);
    throw error;
  }
};

export const getOrdersByUserId = async (user_id, limit = 10, offset = 0) => {
  try {
    const query = `
      SELECT
        o.*,
        COUNT(oi.id) as items_count,
        SUM(oi.quantity) as total_items
      FROM public.orders o
      LEFT JOIN public.order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3;
    `;
    const result = await pool.query(query, [user_id, limit, offset]);
    return result.rows;
  } catch (error) {
    console.error("Error al obtener órdenes por usuario:", error);
    throw error;
  }
};

export const getAllOrders = async (limit = 10, offset = 0, status = null) => {
  try {
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
      ORDER BY o.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Error al obtener todas las órdenes:", error);
    throw error;
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    const order_id = validateId(id);
    if (!order_id) return null;

    const valid_statuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!valid_statuses.includes(status)) {
      throw new Error(
        `Estado inválido: ${status}. Debe ser uno de: ${valid_statuses.join(', ')}`
      );
    }

    const query = `
      UPDATE public.orders
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [status, order_id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error al actualizar estado de orden:", error);
    throw error;
  }
};

export const updateOrder = async (id, data) => {
  try {
    const order_id = validateId(id);
    if (!order_id) return null;

    const { status, delivery_type, special_instructions, total_amount } = data;

    if (status) {
      const valid_statuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
      if (!valid_statuses.includes(status)) {
        throw new Error(`Estado inválido: ${status}`);
      }
    }

    const query = `
      UPDATE public.orders
      SET status = COALESCE($1, status),
          delivery_type = COALESCE($2, delivery_type),
          special_instructions = COALESCE($3, special_instructions),
          total_amount = COALESCE($4, total_amount),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *;
    `;

    const result = await pool.query(query, [
      status || null,
      delivery_type || null,
      special_instructions,
      total_amount || null,
      order_id
    ]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error al actualizar orden:", error);
    throw error;
  }
};

export const updateOrderPartial = async (id, data) => {
  try {
    const order_id = validateId(id);
    if (!order_id) return null;

    const filtered_data = filterAllowedFields(data, ALLOWED_ORDER_FIELDS);
    const keys = Object.keys(filtered_data);

    if (keys.length === 0) {
      throw new Error("No se proporcionaron campos válidos para actualizar");
    }

    if (filtered_data.status) {
      const valid_statuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
      if (!valid_statuses.includes(filtered_data.status)) {
        throw new Error(`Estado inválido: ${filtered_data.status}`);
      }
    }

    if (filtered_data.total_amount !== undefined) {
      const amount = Number(filtered_data.total_amount);
      if (isNaN(amount) || amount < 0) {
        throw new Error("El monto total debe ser un número válido mayor o igual a 0");
      }
      filtered_data.total_amount = amount;
    }

    const set_clauses = keys.map((key, i) => `${key} = $${i + 1}`);
    const values = Object.values(filtered_data);

    const query = `
      UPDATE public.orders
      SET ${set_clauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${keys.length + 1}
      RETURNING *;
    `;

    const result = await pool.query(query, [...values, order_id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error al actualizar parcialmente orden:", error);
    throw error;
  }
};

export const deleteOrder = async (id) => {
  try {
    const order_id = validateId(id);
    if (!order_id) return null;

    const query = `
      DELETE FROM public.orders
      WHERE id = $1
      RETURNING id;
    `;

    const result = await pool.query(query, [order_id]);
    if (result.rowCount === 0) return null;

    return { message: "Orden eliminada correctamente" };
  } catch (error) {
    console.error("Error al eliminar orden:", error);
    throw error;
  }
};

// ============================================================
// ORDER ITEMS
// ============================================================

export const addOrderItem = async (
  order_id,
  menu_item_id,
  quantity,
  price,
  special_requests = null
) => {
  try {
    const subtotal = price * quantity;
    const query = `
      INSERT INTO public.order_items
      (order_id, menu_item_id, quantity, price, subtotal, special_requests)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const result = await pool.query(query, [
      order_id,
      menu_item_id,
      quantity,
      price,
      subtotal,
      special_requests
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Error al agregar item a orden:", error);
    throw error;
  }
};

export const getOrderItems = async (order_id) => {
  try {
    const query = `
      SELECT
        oi.id as item_id,
        oi.order_id,
        oi.menu_item_id,
        oi.quantity,
        oi.price as price_at_order,
        oi.subtotal,
        oi.special_requests,
        oi.created_at,
        mi.name as item_name,
        mi.description as item_description,
        mi.estimated_prep_time,
        mi.image_url,
        mi.price as current_price
      FROM public.order_items oi
      LEFT JOIN public.menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = $1
      ORDER BY oi.created_at ASC;
    `;
    const result = await pool.query(query, [order_id]);
    return result.rows;
  } catch (error) {
    console.error("Error al obtener items de orden:", error);
    throw error;
  }
};

export const getOrderItemById = async (id) => {
  try {
    const item_id = validateId(id);
    if (!item_id) return null;

    const query = `
      SELECT
        oi.id as item_id,
        oi.order_id,
        oi.menu_item_id,
        oi.quantity,
        oi.price as price_at_order,
        oi.subtotal,
        oi.special_requests,
        oi.created_at,
        mi.name as item_name,
        mi.description as item_description,
        mi.price as current_price,
        mi.estimated_prep_time,
        mi.image_url
      FROM public.order_items oi
      LEFT JOIN public.menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.id = $1;
    `;
    const result = await pool.query(query, [item_id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error al obtener item de orden:", error);
    throw error;
  }
};

export const updateOrderItem = async (id, data) => {
  try {
    const item_id = validateId(id);
    if (!item_id) return null;

    const { quantity, special_requests } = data;

    if (quantity !== undefined) {
      const qty = Number(quantity);
      if (isNaN(qty) || qty <= 0 || qty > 99) {
        throw new Error("La cantidad debe ser un número válido entre 1 y 99");
      }

      const price_query = `SELECT price FROM public.order_items WHERE id = $1;`;
      const price_result = await pool.query(price_query, [item_id]);

      if (!price_result.rows[0]) throw new Error('Item de orden no encontrado');

      const unit_price = price_result.rows[0].price;
      const new_subtotal = unit_price * qty;

      const update_query = `
        UPDATE public.order_items
        SET quantity = $1,
            subtotal = $2,
            special_requests = COALESCE($3, special_requests)
        WHERE id = $4
        RETURNING *;
      `;

      const result = await pool.query(update_query, [qty, new_subtotal, special_requests, item_id]);
      return result.rows[0] || null;
    }

    const query = `
      UPDATE public.order_items
      SET special_requests = $1
      WHERE id = $2
      RETURNING *;
    `;

    const result = await pool.query(query, [special_requests, item_id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error al actualizar item de orden:", error);
    throw error;
  }
};

export const updateOrderItemPartial = async (id, data) => {
  try {
    const item_id = validateId(id);
    if (!item_id) return null;

    const filtered_data = filterAllowedFields(data, ALLOWED_ORDER_ITEM_FIELDS);
    const keys = Object.keys(filtered_data);

    if (keys.length === 0) {
      throw new Error("No se proporcionaron campos válidos para actualizar");
    }

    if (filtered_data.quantity !== undefined) {
      const qty = Number(filtered_data.quantity);
      if (isNaN(qty) || qty <= 0 || qty > 99) {
        throw new Error("La cantidad debe ser un número válido entre 1 y 99");
      }
      filtered_data.quantity = qty;
    }

    const set_clauses = keys.map((key, i) => `${key} = $${i + 1}`);
    const values = Object.values(filtered_data);

    const query = `
      UPDATE public.order_items
      SET ${set_clauses.join(", ")}
      WHERE id = $${keys.length + 1}
      RETURNING *;
    `;

    const result = await pool.query(query, [...values, item_id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error al actualizar parcialmente item de orden:", error);
    throw error;
  }
};

export const deleteOrderItem = async (id) => {
  try {
    const item_id = validateId(id);
    if (!item_id) return null;

    const query = `
      DELETE FROM public.order_items
      WHERE id = $1
      RETURNING id;
    `;

    const result = await pool.query(query, [item_id]);
    if (result.rowCount === 0) return null;

    return { message: "Item de orden eliminado correctamente" };
  } catch (error) {
    console.error("Error al eliminar item de orden:", error);
    throw error;
  }
};

export const clearOrderItems = async (order_id) => {
  try {
    const query = `
      DELETE FROM public.order_items
      WHERE order_id = $1;
    `;

    const result = await pool.query(query, [order_id]);
    return result.rowCount;
  } catch (error) {
    console.error("Error al limpiar items de orden:", error);
    throw error;
  }
};

// ============================================================
// OPERACIONES COMPLEJAS - Transacciones
// ============================================================

export const createOrderWithItems = async (
  user_id,
  cart_items,
  delivery_type = 'dine-in',
  special_instructions = null
) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (!cart_items || cart_items.length === 0) {
      throw new Error('El carrito no puede estar vacío');
    }

    const order_result = await client.query(
      `INSERT INTO public.orders
       (user_id, total_amount, status, delivery_type, special_instructions)
       VALUES ($1, 0, 'pending', $2, $3)
       RETURNING *;`,
      [user_id, delivery_type, special_instructions]
    );

    const order = order_result.rows[0];
    let total_amount = 0;
    let max_prep_time = 0;

    for (const item of cart_items) {
      const price_result = await client.query(
        `SELECT price, is_available, estimated_prep_time FROM public.menu_items WHERE id = $1;`,
        [item.menu_item_id]
      );

      if (!price_result.rows[0]) {
        throw new Error(`Item no encontrado: ${item.menu_item_id}`);
      }

      if (!price_result.rows[0].is_available) {
        throw new Error(`Item no disponible: ${item.menu_item_id}`);
      }

      const price = price_result.rows[0].price;
      const prep_time = price_result.rows[0].estimated_prep_time || 0;
      const quantity = Math.max(1, Math.min(item.quantity || 1, 99));
      const subtotal = price * quantity;

      total_amount += subtotal;

      if (prep_time > max_prep_time) {
        max_prep_time = prep_time;
      }

      await client.query(
        `INSERT INTO public.order_items
         (order_id, menu_item_id, quantity, price, subtotal, special_requests)
         VALUES ($1, $2, $3, $4, $5, $6);`,
        [order.id, item.menu_item_id, quantity, price, subtotal, item.special_requests || null]
      );
    }

    await client.query(
      `UPDATE public.orders SET total_amount = $1 WHERE id = $2;`,
      [total_amount, order.id]
    );

    await client.query('COMMIT');

    return {
      ...order,
      total_amount,
      items_count: cart_items.length,
      estimated_prep_time: max_prep_time
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error al crear orden con items:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const validateCartItems = async (cart_items) => {
  try {
    if (!cart_items || cart_items.length === 0) {
      return { valid: false, error: 'El carrito está vacío' };
    }

    const unavailable = [];
    const not_found = [];

    for (const item of cart_items) {
      if (!item.menu_item_id || item.menu_item_id <= 0) {
        not_found.push({ id: item.menu_item_id, reason: 'menu_item_id inválido' });
        continue;
      }

      const result = await pool.query(
        `SELECT id, is_available, name FROM public.menu_items WHERE id = $1;`,
        [item.menu_item_id]
      );

      if (!result.rows[0]) {
        not_found.push({ id: item.menu_item_id, reason: 'No existe' });
      } else if (!result.rows[0].is_available) {
        unavailable.push({
          id: item.menu_item_id,
          name: result.rows[0].name,
          reason: 'No disponible'
        });
      }
    }

    return {
      valid: unavailable.length === 0 && not_found.length === 0,
      unavailable,
      not_found
    };
  } catch (error) {
    console.error("Error al validar items del carrito:", error);
    throw error;
  }
};

export const calculateOrderTotal = async (order_id) => {
  try {
    const query = `
      SELECT
        COALESCE(SUM(oi.subtotal), 0) as total_amount,
        COUNT(*) as items_count,
        COALESCE(SUM(oi.quantity), 0) as total_quantity
      FROM public.order_items oi
      WHERE oi.order_id = $1;
    `;
    const result = await pool.query(query, [order_id]);
    return result.rows[0] || { total_amount: 0, items_count: 0, total_quantity: 0 };
  } catch (error) {
    console.error("Error al calcular total de orden:", error);
    throw error;
  }
};

export const syncOrderTotal = async (order_id) => {
  try {
    const totals = await calculateOrderTotal(order_id);
    const query = `
      UPDATE public.orders
      SET total_amount = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [totals.total_amount || 0, order_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error al sincronizar total de orden:", error);
    throw error;
  }
};

export const calculateOrderETA = async (order_id) => {
  try {
    const valid_id = validateId(order_id);
    if (!valid_id) return { max_prep_time: 0, total_items: 0, item_names: '' };

    const result = await pool.query(
      `SELECT
        COALESCE(MAX(mi.estimated_prep_time), 0)::INTEGER as max_prep_time,
        COUNT(oi.id)::INTEGER as total_items,
        STRING_AGG(DISTINCT mi.name, ', ') as item_names
      FROM public.order_items oi
      INNER JOIN public.menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = $1
      GROUP BY oi.order_id;`,
      [valid_id]
    );

    if (!result.rows[0]) {
      return { max_prep_time: 0, total_items: 0, item_names: '' };
    }

    return {
      max_prep_time: result.rows[0].max_prep_time || 0,
      total_items: result.rows[0].total_items || 0,
      item_names: result.rows[0].item_names || ''
    };
  } catch (error) {
    console.error("Error al calcular ETA:", error);
    return { max_prep_time: 0, total_items: 0, item_names: '' };
  }
};

export const cancelOrder = async (order_id) => {
  try {
    return await updateOrderStatus(order_id, 'cancelled');
  } catch (error) {
    console.error("Error al cancelar orden:", error);
    throw error;
  }
};

export const getUserOrdersFiltered = async (user_id, status = null, limit = 10, offset = 0) => {
  try {
    let query = `
      SELECT
        o.*,
        COUNT(oi.id) as items_count,
        SUM(oi.quantity) as total_items
      FROM public.orders o
      LEFT JOIN public.order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
    `;

    const params = [user_id];
    if (status) {
      query += ` AND o.status = $${params.length + 1}`;
      params.push(status);
    }

    query += `
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Error al obtener órdenes filtradas por usuario:", error);
    throw error;
  }
};

// ============================================================
// DINE-IN CON MESAS
// ============================================================

export const createDineInOrderWithTable = async (
  user_id,
  table_id,
  cart_items,
  special_instructions = null
) => {
  try {
    const query = `
      SELECT * FROM public.create_dinein_order($1, $2, $3, $4);
    `;
    const result = await pool.query(query, [
      user_id,
      table_id,
      JSON.stringify(cart_items),
      special_instructions
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Error al crear orden dine-in con mesa:", error);
    throw error;
  }
};

export const getOrderWithTable = async (order_id) => {
  try {
    const valid_id = validateId(order_id);
    if (!valid_id) return null;

    const query = `SELECT * FROM public.orders_with_tables WHERE id = $1;`;
    const result = await pool.query(query, [valid_id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error al obtener orden con mesa:", error);
    throw error;
  }
};

export const getTableWithOrders = async (table_id) => {
  try {
    const valid_id = validateId(table_id);
    if (!valid_id) return null;

    const query = `SELECT * FROM public.get_table_with_orders($1);`;
    const result = await pool.query(query, [valid_id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error al obtener mesa con órdenes activas:", error);
    throw error;
  }
};

export const moveOrderToTable = async (order_id, new_table_id) => {
  try {
    const query = `SELECT * FROM public.move_order_to_table($1, $2);`;
    const result = await pool.query(query, [order_id, new_table_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error al mover orden a otra mesa:", error);
    throw error;
  }
};

export const getOccupiedTables = async () => {
  try {
    const query = `SELECT * FROM public.occupied_tables ORDER BY table_number ASC;`;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error al obtener mesas ocupadas:", error);
    throw error;
  }
};

// ============================================================
// ESTADÍSTICAS Y REPORTES
// ============================================================

export const getOrdersStatistics = async () => {
  try {
    const query = `
      SELECT
        COUNT(DISTINCT id) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_order_value,
        COUNT(DISTINCT user_id) as unique_customers,
        MAX(created_at) as last_order_date,
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
  } catch (error) {
    console.error("Error al obtener estadísticas de órdenes:", error);
    throw error;
  }
};

export const getRecentOrders = async (limit = 10) => {
  try {
    const query = `
      SELECT
        o.*,
        u.name as user_name,
        COUNT(oi.id) as items_count
      FROM public.orders o
      JOIN public.users u ON o.user_id = u.id
      LEFT JOIN public.order_items oi ON o.id = oi.order_id
      GROUP BY o.id, u.id
      ORDER BY o.created_at DESC
      LIMIT $1;
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  } catch (error) {
    console.error("Error al obtener órdenes recientes:", error);
    throw error;
  }
};

export const getStatisticsByDeliveryType = async () => {
  try {
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
  } catch (error) {
    console.error("Error al obtener estadísticas por tipo de entrega:", error);
    throw error;
  }
};

export const getOrdersByDateRange = async (start_date, end_date) => {
  try {
    const query = `
      SELECT
        o.*,
        u.name as user_name,
        COUNT(oi.id) as items_count
      FROM public.orders o
      JOIN public.users u ON o.user_id = u.id
      LEFT JOIN public.order_items oi ON o.id = oi.order_id
      WHERE DATE(o.created_at) BETWEEN $1 AND $2
      GROUP BY o.id, u.id
      ORDER BY o.created_at DESC;
    `;
    const result = await pool.query(query, [start_date, end_date]);
    return result.rows;
  } catch (error) {
    console.error("Error al obtener órdenes por rango de fechas:", error);
    throw error;
  }
};
