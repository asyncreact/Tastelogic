// src/repositories/reservation.repository.js
import { pool } from "../config/db.js";

/**
 * OBTENER RESERVAS
 */

// Obtiene todas las reservas con filtros opcionales
export const getReservations = async (filters = {}) => {
  try {
    let whereClause = "WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (filters.user_id) {
      whereClause += ` AND r.user_id = $${paramIndex}`;
      params.push(filters.user_id);
      paramIndex++;
    }

    if (filters.status) {
      whereClause += ` AND r.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.zone_id) {
      whereClause += ` AND r.zone_id = $${paramIndex}`;
      params.push(filters.zone_id);
      paramIndex++;
    }

    if (filters.from_date) {
      whereClause += ` AND DATE(r.reservation_date) >= $${paramIndex}`;
      params.push(filters.from_date);
      paramIndex++;
    }

    if (filters.to_date) {
      whereClause += ` AND DATE(r.reservation_date) <= $${paramIndex}`;
      params.push(filters.to_date);
      paramIndex++;
    }

    const query = `
      SELECT
        r.id,
        r.user_id,
        r.zone_id,
        r.table_id,
        r.reservation_date,
        r.reservation_time,
        r.guest_count,
        r.status,
        r.special_requirements,
        r.created_at,
        r.updated_at,
        r.reservation_number,
        z.name AS zone_name,
        t.table_number
      FROM public.reservations r
      LEFT JOIN public.zones z ON r.zone_id = z.id
      LEFT JOIN public.tables t ON r.table_id = t.id
      ${whereClause}
      ORDER BY r.reservation_date DESC, r.reservation_time DESC
    `;

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Error en getReservations:", error);
    throw error;
  }
};

// Obtiene una reserva por ID con información completa
export const getReservationById = async (id) => {
  try {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) throw new Error("ID de reserva inválido");

    const query = `
      SELECT
        r.id,
        r.user_id,
        r.zone_id,
        r.table_id,
        r.reservation_date,
        r.reservation_time,
        r.guest_count,
        r.status,
        r.special_requirements,
        r.created_at,
        r.updated_at,
        r.reservation_number,
        u.name as user_name,
        u.email as user_email,
        z.name as zone_name,
        t.table_number,
        t.capacity
      FROM public.reservations r
      LEFT JOIN public.users u ON r.user_id = u.id
      LEFT JOIN public.zones z ON r.zone_id = z.id
      LEFT JOIN public.tables t ON r.table_id = t.id
      WHERE r.id = $1
    `;

    const result = await pool.query(query, [numId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error en getReservationById:", error);
    throw error;
  }
};

/**
 * CREAR RESERVA
 */

export const createReservation = async ({
  user_id,
  zone_id,
  table_id,
  reservation_date,
  reservation_time,
  guest_count,
  status = "pending",
  special_requirements = null,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verificar conflictos de mesa
    const conflictQuery = `
      SELECT * FROM public.reservations
      WHERE table_id = $1
        AND reservation_date = $2
        AND reservation_time = $3
        AND status IN ('confirmed', 'pending')
    `;

    const conflictResult = await client.query(conflictQuery, [
      table_id,
      reservation_date,
      reservation_time,
    ]);

    if (conflictResult.rows.length > 0) {
      throw new Error("Mesa no disponible en esa fecha y hora");
    }

    // Crear reserva
    const insertQuery = `
      INSERT INTO public.reservations
        (user_id, zone_id, table_id, reservation_date, reservation_time, guest_count, status, special_requirements)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await client.query(insertQuery, [
      user_id,
      zone_id,
      table_id,
      reservation_date,
      reservation_time,
      guest_count,
      status,
      special_requirements,
    ]);

    await client.query("COMMIT");
    console.log("✅ Reserva creada exitosamente");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en createReservation:", error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * ACTUALIZAR RESERVA
 */

export const updateReservation = async (id, updateData) => {
  const client = await pool.connect();

  try {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) throw new Error("ID de reserva inválido");

    const existing = await client.query(
      "SELECT * FROM public.reservations WHERE id = $1",
      [numId]
    );

    if (existing.rows.length === 0) {
      throw new Error("Reserva no encontrada");
    }

    await client.query("BEGIN");

    // Si se cambia mesa, fecha o hora, verificar conflictos
    if (
      updateData.table_id ||
      updateData.reservation_date ||
      updateData.reservation_time
    ) {
      const tableId = updateData.table_id || existing.rows[0].table_id;
      const resDate =
        updateData.reservation_date || existing.rows[0].reservation_date;
      const resTime =
        updateData.reservation_time || existing.rows[0].reservation_time;

      const conflictQuery = `
        SELECT * FROM public.reservations
        WHERE table_id = $1
          AND reservation_date = $2
          AND reservation_time = $3
          AND id != $4
          AND status IN ('confirmed', 'pending')
      `;

      const conflictResult = await client.query(conflictQuery, [
        tableId,
        resDate,
        resTime,
        numId,
      ]);

      if (conflictResult.rows.length > 0) {
        throw new Error("Mesa no disponible en esa fecha y hora");
      }
    }

    let query = "UPDATE public.reservations SET ";
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
    console.log("✅ Reserva actualizada");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en updateReservation:", error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * CAMBIAR ESTADO DE RESERVA
 */

export const updateReservationStatus = async (id, status) => {
  try {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) throw new Error("ID de reserva inválido");

    const validStatuses = ["pending", "confirmed", "completed", "cancelled", "expired"];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Estado inválido. Debe ser uno de: ${validStatuses.join(", ")}`
      );
    }

    const query = `
      UPDATE public.reservations
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [status, numId]);

    if (result.rows.length === 0) {
      throw new Error("Reserva no encontrada");
    }

    console.log(`✅ Estado actualizado a ${status}`);
    return result.rows[0];
  } catch (error) {
    console.error("Error en updateReservationStatus:", error);
    throw error;
  }
};

/**
 * CANCELAR RESERVA
 */

export const cancelReservation = async (id) => {
  try {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) throw new Error("ID de reserva inválido");

    const query = `
      UPDATE public.reservations
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [numId]);

    if (result.rows.length === 0) {
      throw new Error("Reserva no encontrada");
    }

    console.log(`✅ Reserva cancelada`);
    return result.rows[0];
  } catch (error) {
    console.error("Error en cancelReservation:", error);
    throw error;
  }
};

/**
 * ELIMINAR RESERVA
 */

export const deleteReservation = async (id) => {
  try {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) throw new Error("ID de reserva inválido");

    const query = `DELETE FROM public.reservations WHERE id = $1`;
    const result = await pool.query(query, [numId]);

    if (result.rowCount === 0) {
      throw new Error("Reserva no encontrada");
    }

    console.log(`✅ Reserva eliminada`);
    return { message: "Reserva eliminada correctamente" };
  } catch (error) {
    console.error("Error en deleteReservation:", error);
    throw error;
  }
};

/**
 * VERIFICAR DISPONIBILIDAD
 */

export const checkTableAvailability = async (
  table_id,
  reservation_date,
  reservation_time,
  excludeReservationId = null
) => {
  try {
    // Obtener tabla
    const tableQuery = `
      SELECT t.*, z.name as zone_name
      FROM public.tables t
      LEFT JOIN public.zones z ON t.zone_id = z.id
      WHERE t.id = $1
    `;

    const tableResult = await pool.query(tableQuery, [table_id]);

    if (tableResult.rows.length === 0) {
      throw new Error("Mesa no encontrada");
    }

    // Verificar conflictos
    let conflictQuery = `
      SELECT id, user_id, guest_count
      FROM public.reservations
      WHERE table_id = $1
        AND reservation_date = $2
        AND reservation_time = $3
        AND status IN ('confirmed', 'pending')
    `;

    const params = [table_id, reservation_date, reservation_time];

    if (excludeReservationId) {
      conflictQuery += ` AND id != $4`;
      params.push(excludeReservationId);
    }

    const conflictResult = await pool.query(conflictQuery, params);

    return {
      available: conflictResult.rows.length === 0,
      table: tableResult.rows[0],
      conflict: conflictResult.rows[0] || null,
    };
  } catch (error) {
    console.error("Error en checkTableAvailability:", error);
    throw error;
  }
};

// Reserva activa “del día”
export const getActiveReservationByUserId = async (user_id) => {
  const query = `
    SELECT
      r.id,
      r.user_id,
      r.zone_id,
      r.table_id,
      r.reservation_date,
      r.reservation_time,
      r.guest_count,
      r.status,
      t.table_number,
      z.name AS zone_name
    FROM reservations r
    LEFT JOIN tables t ON r.table_id = t.id
    LEFT JOIN zones z ON r.zone_id = z.id
    WHERE r.user_id = $1
      AND r.status IN ('confirmed', 'seated')
      AND r.reservation_date = CURRENT_DATE
    ORDER BY r.reservation_time ASC
    LIMIT 1
  `;
  const result = await pool.query(query, [user_id]);
  return result.rows[0] || null;
};

/**
 * NUEVA: reserva futura activa por usuario
 * pending o confirmed con fecha/hora futura
 */
export const getActiveFutureReservationByUserId = async (user_id) => {
  const query = `
    SELECT r.*
    FROM public.reservations r
    WHERE r.user_id = $1
      AND r.status IN ('pending', 'confirmed')
      AND (
        r.reservation_date > CURRENT_DATE
        OR (r.reservation_date = CURRENT_DATE AND r.reservation_time >= CURRENT_TIME)
      )
    ORDER BY r.reservation_date ASC, r.reservation_time ASC
    LIMIT 1
  `;
  const result = await pool.query(query, [user_id]);
  return result.rows[0] || null;
};

/**
 * OBTENER MESAS DISPONIBLES POR ZONA
 */

export const getAvailableTablesByZone = async (zone_id, guest_count) => {
  try {
    const query = `
      SELECT 
        t.*,
        z.name AS zone_name
      FROM public.tables t
      LEFT JOIN public.zones z ON t.zone_id = z.id
      WHERE t.zone_id = $1
        AND t.capacity >= $2
        AND t.status = 'available'
        AND t.is_active = true
      ORDER BY t.capacity ASC;
    `;

    const { rows } = await pool.query(query, [zone_id, guest_count]);
    return rows;
  } catch (error) {
    console.error("Error al obtener mesas disponibles por zona:", error);
    throw error;
  }
};
