// src/repositories/table.repository.js

import { pool } from "../config/db.js";

const validateId = (id) => {
  const numId = Number(id);
  return isNaN(numId) || numId <= 0 ? null : numId;
};

const ALLOWED_TABLE_FIELDS = ["zone_id", "table_number", "capacity", "status", "is_active"];

const filterAllowedFields = (data, allowedFields) => {
  const filtered = {};
  Object.keys(data).forEach((key) => {
    if (allowedFields.includes(key)) {
      filtered[key] = data[key];
    }
  });
  return filtered;
};

export const getAllTables = async () => {
  try {
    const query = `
      SELECT t.*, z.name AS zone_name
      FROM tables t
      LEFT JOIN zones z ON t.zone_id = z.id
      ORDER BY t.zone_id, t.table_number ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error al obtener mesas:", error);
    throw error;
  }
};

export const getTableById = async (id) => {
  try {
    const tableId = validateId(id);
    if (!tableId) return null;

    const query = `
      SELECT t.*, z.name AS zone_name
      FROM tables t
      LEFT JOIN zones z ON t.zone_id = z.id
      WHERE t.id = $1;
    `;
    const { rows } = await pool.query(query, [tableId]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error al obtener mesa por ID:", error);
    throw error;
  }
};

export const getTablesByZone = async (zoneId) => {
  try {
    const validZoneId = validateId(zoneId);
    if (!validZoneId) return [];

    const query = `
      SELECT t.*, z.name AS zone_name
      FROM tables t
      LEFT JOIN zones z ON t.zone_id = z.id
      WHERE t.zone_id = $1 AND t.is_active = true
      ORDER BY t.table_number ASC;
    `;
    const { rows } = await pool.query(query, [validZoneId]);
    return rows;
  } catch (error) {
    console.error("Error al obtener mesas por zona:", error);
    throw error;
  }
};

export const getTablesByStatus = async (status) => {
  try {
    if (!status || !["available", "occupied", "reserved"].includes(status)) {
      throw new Error("Estado inválido. Debe ser: available, occupied o reserved");
    }

    const query = `
      SELECT t.*, z.name AS zone_name
      FROM tables t
      LEFT JOIN zones z ON t.zone_id = z.id
      WHERE t.status = $1 AND t.is_active = true
      ORDER BY t.zone_id, t.table_number ASC;
    `;
    const { rows } = await pool.query(query, [status]);
    return rows;
  } catch (error) {
    console.error("Error al obtener mesas por estado:", error);
    throw error;
  }
};

export const getAvailableTablesByZone = async (zoneId) => {
  try {
    const validZoneId = validateId(zoneId);
    if (!validZoneId) return [];

    const query = `
      SELECT t.*, z.name AS zone_name
      FROM tables t
      LEFT JOIN zones z ON t.zone_id = z.id
      WHERE t.zone_id = $1 AND t.status = 'available' AND t.is_active = true
      ORDER BY t.table_number ASC;
    `;
    const { rows } = await pool.query(query, [validZoneId]);
    return rows;
  } catch (error) {
    console.error("Error al obtener mesas disponibles por zona:", error);
    throw error;
  }
};

export const createTable = async ({
  zone_id = null,
  table_number,
  capacity,
  status = "available",
  is_active = true,
}) => {
  try {
    if (!table_number || typeof table_number !== "string" || table_number.trim().length === 0) {
      throw new Error("El número de mesa es requerido");
    }

    if (capacity === undefined || capacity === null || isNaN(Number(capacity)) || Number(capacity) <= 0) {
      throw new Error("La capacidad debe ser un número válido mayor a 0");
    }

    if (!["available", "occupied", "reserved"].includes(status)) {
      throw new Error("Estado inválido. Debe ser: available, occupied o reserved");
    }

    const query = `
      INSERT INTO tables
      (zone_id, table_number, capacity, status, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [
      zone_id || null,
      table_number.trim(),
      Number(capacity),
      status,
      Boolean(is_active),
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    if (error.code === "23505") {
      throw new Error("El número de mesa ya existe en esta zona");
    }
    console.error("Error al crear mesa:", error);
    throw error;
  }
};

export const updateTable = async (id, data) => {
  try {
    const tableId = validateId(id);
    if (!tableId) return null;

    const {
      zone_id,
      table_number,
      capacity,
      status,
      is_active,
    } = data;

    if (!table_number || typeof table_number !== "string" || table_number.trim().length === 0) {
      throw new Error("El número de mesa es requerido");
    }

    if (capacity === undefined || capacity === null || isNaN(Number(capacity)) || Number(capacity) <= 0) {
      throw new Error("La capacidad debe ser un número válido mayor a 0");
    }

    const validStatus = status || "available";
    if (!["available", "occupied", "reserved"].includes(validStatus)) {
      throw new Error("Estado inválido. Debe ser: available, occupied o reserved");
    }

    const query = `
      UPDATE tables
      SET zone_id = $1,
          table_number = $2,
          capacity = $3,
          status = $4,
          is_active = $5,
          updated_at = NOW()
      WHERE id = $6
      RETURNING *;
    `;

    const values = [
      zone_id !== undefined && zone_id !== null ? zone_id : null,
      table_number.trim(),
      Number(capacity),
      validStatus,
      is_active !== undefined ? Boolean(is_active) : true,
      tableId,
    ];

    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  } catch (error) {
    if (error.code === "23505") {
      throw new Error("El número de mesa ya existe en esta zona");
    }
    console.error("Error al actualizar mesa:", error);
    throw error;
  }
};

export const updateTablePartial = async (id, data) => {
  try {
    const tableId = validateId(id);
    if (!tableId) return null;

    const filteredData = filterAllowedFields(data, ALLOWED_TABLE_FIELDS);
    const keys = Object.keys(filteredData);

    if (keys.length === 0) {
      throw new Error("No se proporcionaron campos válidos para actualizar");
    }

    if (filteredData.table_number !== undefined) {
      if (typeof filteredData.table_number !== "string" || filteredData.table_number.trim().length === 0) {
        throw new Error("El número de mesa no puede estar vacío");
      }
      filteredData.table_number = filteredData.table_number.trim();
    }

    if (filteredData.capacity !== undefined) {
      const capacityNum = Number(filteredData.capacity);
      if (isNaN(capacityNum) || capacityNum <= 0) {
        throw new Error("La capacidad debe ser un número válido mayor a 0");
      }
      filteredData.capacity = capacityNum;
    }

    if (filteredData.status !== undefined) {
      if (!["available", "occupied", "reserved"].includes(filteredData.status)) {
        throw new Error("Estado inválido. Debe ser: available, occupied o reserved");
      }
    }

    if (filteredData.is_active !== undefined) {
      filteredData.is_active = Boolean(filteredData.is_active);
    }

    const setClauses = keys.map((key, i) => `${key} = $${i + 1}`);
    const values = Object.values(filteredData);

    const query = `
      UPDATE tables
      SET ${setClauses.join(", ")}, updated_at = NOW()
      WHERE id = $${keys.length + 1}
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [...values, tableId]);
    return rows[0] || null;
  } catch (error) {
    if (error.code === "23505") {
      throw new Error("El número de mesa ya existe en esta zona");
    }
    console.error("Error al actualizar parcialmente mesa:", error);
    throw error;
  }
};

export const updateTableStatus = async (id, status) => {
  try {
    const tableId = validateId(id);
    if (!tableId) return null;

    if (!["available", "occupied", "reserved"].includes(status)) {
      throw new Error("Estado inválido. Debe ser: available, occupied o reserved");
    }

    const query = `
      UPDATE tables
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [status, tableId]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error al actualizar estado de mesa:", error);
    throw error;
  }
};

export const deleteTable = async (id) => {
  try {
    const tableId = validateId(id);
    if (!tableId) return null;

    const result = await pool.query(
      "DELETE FROM tables WHERE id = $1 RETURNING id",
      [tableId]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return { message: "Mesa eliminada correctamente" };
  } catch (error) {
    console.error("Error al eliminar mesa:", error);
    throw error;
  }
};
