// src/repositories/order.repository.js

import { pool } from "../config/db.js";

/* OBTENER PEDIDOS */

/* Obtiene todos los pedidos con filtros opcionales */
export const getOrders = async (filters = {}) => {
  try {
    let baseQuery = "FROM public.orders WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (filters.user_id) {
      baseQuery += ` AND user_id = $${paramIndex}`;
      params.push(filters.user_id);
      paramIndex++;
    }

    if (filters.table_id) {
      baseQuery += ` AND table_id = $${paramIndex}`;
      params.push(filters.table_id);
      paramIndex++;
    }

    if (filters.order_type) {
      baseQuery += ` AND order_type = $${paramIndex}`;
      params.push(filters.order_type);
      paramIndex++;
    }

    if (filters.status) {
      baseQuery += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.payment_status) {
      baseQuery += ` AND payment_status = $${paramIndex}`;
      params.push(filters.payment_status);
      paramIndex++;
    }

    if (filters.order_date) {
      baseQuery += ` AND DATE(order_date) = $${paramIndex}`;
      params.push(filters.order_date);
      paramIndex++;
    }

    const page = Number(filters.page) > 0 ? Number(filters.page) : 1;
    const limit = Number(filters.limit) > 0 ? Number(filters.limit) : 20;
    const offset = (page - 1) * limit;

    const countQuery = `SELECT COUNT(*) AS total ${baseQuery}`;
    const countResult = await pool.query(countQuery, params);
    const total = Number(countResult.rows[0]?.total || 0);

    const dataQuery = `
      SELECT *
      ${baseQuery}
      ORDER BY created_at DESC
      LIMIT $${paramIndex}
      OFFSET $${paramIndex + 1}
    `;
    const dataParams = [...params, limit, offset];
    const result = await pool.query(dataQuery, dataParams);

    return {
      rows: result.rows,
      total,
      page,
      limit,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
    };
  } catch (error) {
    console.error("Error en getOrders:", error);
    throw error;
  }
};

/* Obtiene un pedido por ID con sus items y datos relacionados */
export const getOrderById = async (id) => {
  try {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) throw new Error("ID de pedido inválido");

    const orderQuery = `
      SELECT 
        o.id,
        o.order_number,
        o.user_id,
        o.reservation_id,
        o.table_id,
        o.order_type,
        o.order_date,
        o.order_time,
        o.total_amount,
        o.status,
        o.payment_method,
        o.payment_status,
        o.special_instructions,
        o.created_at,
        o.updated_at,
        u.name as user_name,
        u.email as user_email,
        t.table_number,
        z.name as zone_name
      FROM public.orders o
      LEFT JOIN public.users u ON o.user_id = u.id
      LEFT JOIN public.tables t ON o.table_id = t.id
      LEFT JOIN public.zones z ON t.zone_id = z.id
      WHERE o.id = $1
    `;

    const orderResult = await pool.query(orderQuery, [numId]);

    if (orderResult.rows.length === 0) return null;

    const order = orderResult.rows[0];

    const itemsQuery = `
      SELECT 
        oi.id,
        oi.order_id,
        oi.menu_item_id,
        oi.quantity,
        oi.unit_price,
        oi.subtotal,
        oi.special_notes,
        mi.name as menu_item_name,
        mi.description as menu_item_description,
        mi.image_url as menu_item_image
      FROM public.order_items oi
      LEFT JOIN public.menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = $1
      ORDER BY oi.id ASC
    `;

    const itemsResult = await pool.query(itemsQuery, [numId]);
    order.items = itemsResult.rows;

    return order;
  } catch (error) {
    console.error("Error en getOrderById:", error);
    throw error;
  }
};

/* CREAR PEDIDO */
export const createOrder = async ({
  user_id,
  reservation_id = null,
  table_id = null,
  order_type = "dine-in",
  total_amount = 0,
  status = "pending",
  payment_method = null,
  payment_status = "pending",
  special_instructions = null,
  items = [],
}) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderQuery = `
      INSERT INTO public.orders 
      (user_id, reservation_id, table_id, order_type, total_amount, status, payment_method, payment_status, special_instructions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const orderResult = await client.query(orderQuery, [
      user_id,
      reservation_id,
      table_id,
      order_type,
      total_amount,
      status,
      payment_method,
      payment_status,
      special_instructions,
    ]);

    const order = orderResult.rows[0];

    if (items && items.length > 0) {
      const itemsQuery = `
        INSERT INTO public.order_items 
        (order_id, menu_item_id, quantity, unit_price, subtotal, special_notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const insertedItems = [];
      for (const item of items) {
        const itemResult = await client.query(itemsQuery, [
          order.id,
          item.menu_item_id,
          item.quantity,
          item.unit_price,
          item.subtotal,
          item.special_notes || null,
        ]);
        insertedItems.push(itemResult.rows[0]);
      }
      order.items = insertedItems;
    }

    await client.query("COMMIT");
    console.log("Pedido creado exitosamente");
    return order;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en createOrder:", error);
    throw error;
  } finally {
    client.release();
  }
};

/* ACTUALIZAR PEDIDO */
export const updateOrder = async (id, updateData) => {
  const client = await pool.connect();
  try {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) throw new Error("ID de pedido inválido");

    const existing = await client.query(
      "SELECT * FROM public.orders WHERE id = $1",
      [numId]
    );

    if (existing.rows.length === 0) {
      throw new Error("Pedido no encontrado");
    }

    await client.query("BEGIN");

    let query = "UPDATE public.orders SET ";
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach((key) => {
      query += `${key} = $${paramCount}, `;
      values.push(updateData[key]);
      paramCount++;
    });

    query += `updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;
    values.push(numId);

    const result = await client.query(query, values);

    await client.query("COMMIT");
    console.log("Pedido actualizado");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en updateOrder:", error);
    throw error;
  } finally {
    client.release();
  }
};

/* CAMBIAR ESTADO DE PEDIDO */
export const updateOrderStatus = async (id, status) => {
  try {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) throw new Error("ID de pedido inválido");

    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Estado inválido. Debe ser uno de: ${validStatuses.join(", ")}`
      );
    }

    const query = `
      UPDATE public.orders 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [status, numId]);

    if (result.rows.length === 0) {
      throw new Error("Pedido no encontrado");
    }

    console.log(`Estado actualizado a ${status}`);
    return result.rows[0];
  } catch (error) {
    console.error("Error en updateOrderStatus:", error);
    throw error;
  }
};

/* ACTUALIZAR ESTADO DE PAGO */
export const updatePaymentStatus = async (id, payment_status) => {
  try {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) throw new Error("ID de pedido inválido");

    const validStatuses = ["pending", "paid", "refunded"];
    if (!validStatuses.includes(payment_status)) {
      throw new Error(
        `Estado de pago inválido. Debe ser uno de: ${validStatuses.join(", ")}`
      );
    }

    const query = `
      UPDATE public.orders 
      SET payment_status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [payment_status, numId]);

    if (result.rows.length === 0) {
      throw new Error("Pedido no encontrado");
    }

    console.log(`Estado de pago actualizado a ${payment_status}`);
    return result.rows[0];
  } catch (error) {
    console.error("Error en updatePaymentStatus:", error);
    throw error;
  }
};

/* CANCELAR PEDIDO */
export const cancelOrder = async (id) => {
  try {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) throw new Error("ID de pedido inválido");

    const query = `
      UPDATE public.orders 
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [numId]);

    if (result.rows.length === 0) {
      throw new Error("Pedido no encontrado");
    }

    console.log("Pedido cancelado");
    return result.rows[0];
  } catch (error) {
    console.error("Error en cancelOrder:", error);
    throw error;
  }
};

/* ELIMINAR PEDIDO */
export const deleteOrder = async (id) => {
  try {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) throw new Error("ID de pedido inválido");

    const query = `DELETE FROM public.orders WHERE id = $1`;
    const result = await pool.query(query, [numId]);

    if (result.rowCount === 0) {
      throw new Error("Pedido no encontrado");
    }

    console.log("Pedido eliminado");
    return { message: "Pedido eliminado correctamente" };
  } catch (error) {
    console.error("Error en deleteOrder:", error);
    throw error;
  }
};
