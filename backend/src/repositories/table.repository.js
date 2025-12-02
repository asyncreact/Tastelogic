// src/repositories/table.repository.js

import { pool } from "../config/db.js";

/* Valida que un ID sea un número positivo válido */
const validateId = (id) => {
  const numId = Number(id);
  return isNaN(numId) || numId <= 0 ? null : numId;
};

/* Valida que un string sea válido y no esté vacío */
const validateString = (value, fieldName) => {
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${fieldName} es requerido y no puede estar vacío`);
  }
  return value.trim();
};

/* Valida que un número sea válido y no negativo */
const validateNumber = (value, fieldName, allowNegative = false) => {
  const num = Number(value);
  if (isNaN(num) || (!allowNegative && num < 0)) {
    throw new Error(
      `${fieldName} debe ser un número válido ${
        allowNegative ? "" : "no negativo"
      }`
    );
  }
  return num;
};

/* Filtra solo los campos permitidos de un objeto */
const filterAllowedFields = (data, allowedFields) => {
  const filtered = {};
  Object.keys(data).forEach((key) => {
    if (allowedFields.includes(key)) {
      filtered[key] = data[key];
    }
  });
  return filtered;
};

/* Valida campos específicos según su tipo */
const validateFields = (data, fieldValidators) => {
  const validated = { ...data };
  Object.entries(fieldValidators).forEach(([field, validator]) => {
    if (validated[field] !== undefined && validated[field] !== null) {
      validated[field] = validator(validated[field]);
    }
  });
  return validated;
};

/* Construye una query UPDATE dinámica con validación de campos */
const buildUpdateQuery = (data, allowedFields, tableName, whereId) => {
  const filteredData = filterAllowedFields(data, allowedFields);
  const keys = Object.keys(filteredData);
  if (keys.length === 0) {
    throw new Error("No se proporcionaron campos válidos para actualizar");
  }

  const setClauses = keys.map((key, i) => `${key} = $${i + 1}`);
  const values = keys.map((key) => filteredData[key]);
  const query = `
    UPDATE ${tableName}
    SET ${setClauses.join(", ")}, updated_at = NOW()
    WHERE id = $${keys.length + 1}
    RETURNING *;
  `;
  return { query, values: [...values, whereId] };
};

/* Maneja errores comunes de PostgreSQL */
const handleDatabaseError = (error) => {
  if (error.code === "23505") {
    throw new Error("Este registro ya existe (violación de unicidad)");
  }
  if (error.code === "23503") {
    throw new Error("Referencia a un registro que no existe");
  }
  throw error;
};

/* Campos permitidos para actualizar mesas */
const ALLOWED_TABLE_FIELDS = [
  "zone_id",
  "table_number",
  "capacity",
  "status",
  "is_active",
];

/* Validadores para campos de mesas */
const TABLE_VALIDATORS = {
  table_number: (value) => validateString(value, "El número de mesa"),
  capacity: (value) => validateNumber(value, "La capacidad"),
  status: (value) => {
    const validStatuses = ["available", "reserved"];
    if (!validStatuses.includes(value)) {
      throw new Error(
        `Estado inválido: ${value}. Debe ser uno de: ${validStatuses.join(
          ", "
        )}`
      );
    }
    return value;
  },
  is_active: (value) => Boolean(value),
};

/* Genera prefijo automático de mesa basado en la zona */
const generateTableNumber = async (zone_id) => {
  try {
    if (!zone_id) throw new Error("zone_id es requerido");

    const zone_query = `SELECT name FROM public.zones WHERE id = $1;`;
    const zone_result = await pool.query(zone_query, [zone_id]);

    if (!zone_result.rows[0]) {
      throw new Error(`Zona con ID ${zone_id} no existe`);
    }

    const zone_name = zone_result.rows[0].name;
    const prefix = zone_name.charAt(0).toUpperCase();

    const count_query = `
      SELECT COUNT(*) + 1 as next_number
      FROM public.tables
      WHERE zone_id = $1;
    `;
    const count_result = await pool.query(count_query, [zone_id]);
    const next_number = count_result.rows[0].next_number;

    const table_number = `${prefix}-${String(next_number).padStart(2, "0")}`;
    console.log(`Mesa generada: ${table_number} para zona ${zone_name}`);
    return table_number;
  } catch (error) {
    console.error("Error al generar número de mesa:", error);
    throw error;
  }
};

/* Obtiene todas las mesas con filtros opcionales */
export const getTables = async (filters = {}) => {
  try {
    let query = `
      SELECT t.*, z.name AS zone_name
      FROM public.tables t
      LEFT JOIN public.zones z ON t.zone_id = z.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.zone_id) {
      const valid_zone_id = validateId(filters.zone_id);
      if (!valid_zone_id) throw new Error("ID de zona inválido");
      query += ` AND t.zone_id = $${paramCount}`;
      values.push(valid_zone_id);
      paramCount++;
    }

    if (filters.status) {
      const validStatuses = ["available", "reserved"];
      if (!validStatuses.includes(filters.status)) {
        throw new Error(
          `Estado inválido: ${filters.status}. Debe ser uno de: ${validStatuses.join(
            ", "
          )}`
        );
      }
      query += ` AND t.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.is_active !== undefined) {
      query += ` AND t.is_active = $${paramCount}`;
      values.push(Boolean(filters.is_active));
      paramCount++;
    } else if (filters.include_inactive !== true) {
      query += ` AND t.is_active = true`;
    }

    query += ` ORDER BY t.zone_id, t.table_number ASC;`;

    const { rows } = await pool.query(query, values);
    return rows;
  } catch (error) {
    console.error("Error al obtener mesas:", error);
    throw error;
  }
};

/* Obtiene una mesa específica por su ID */
export const getTableById = async (id) => {
  try {
    const table_id = validateId(id);
    if (!table_id) throw new Error("ID de mesa inválido");

    const query = `
      SELECT t.*, z.name AS zone_name
      FROM public.tables t
      LEFT JOIN public.zones z ON t.zone_id = z.id
      WHERE t.id = $1;
    `;
    const { rows } = await pool.query(query, [table_id]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error al obtener mesa por ID:", error);
    throw error;
  }
};

/* Crea una nueva mesa */
export const createTable = async ({
  zone_id,
  table_number = null,
  capacity,
  status = "available",
  is_active = true,
}) => {
  try {
    console.log("Data recibida:", {
      zone_id,
      table_number,
      capacity,
      status,
      is_active,
    });

    let finalTableNumber = table_number;
    if (!finalTableNumber && zone_id) {
      finalTableNumber = await generateTableNumber(zone_id);
      console.log("table_number generado:", finalTableNumber);
    }

    validateNumber(zone_id, "zone_id");
    validateString(finalTableNumber, "table_number");
    validateNumber(capacity, "capacity");

    const data = {
      zone_id: Number(zone_id),
      table_number: finalTableNumber,
      capacity: Number(capacity),
      status,
      is_active: Boolean(is_active),
    };

    const validatedData = validateFields(data, TABLE_VALIDATORS);
    const filteredData = filterAllowedFields(validatedData, ALLOWED_TABLE_FIELDS);

    const keys = Object.keys(filteredData);
    const values = Object.values(filteredData);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

    const query = `
      INSERT INTO public.tables (${keys.join(", ")})
      VALUES (${placeholders})
      RETURNING *;
    `;

    console.log("Query:", query);
    const { rows } = await pool.query(query, values);
    console.log("Mesa creada:", rows[0]);
    return rows[0];
  } catch (error) {
    console.error("Error al crear mesa:", error);
    handleDatabaseError(error);
  }
};

/* Actualiza una mesa */
export const updateTable = async (id, data) => {
  try {
    const table_id = validateId(id);
    if (!table_id) throw new Error("ID de mesa inválido");

    const validatedData = validateFields(data, TABLE_VALIDATORS);
    const { query, values } = buildUpdateQuery(
      validatedData,
      ALLOWED_TABLE_FIELDS,
      "public.tables",
      table_id
    );

    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      throw new Error("Mesa no encontrada");
    }

    return rows[0];
  } catch (error) {
    console.error("Error al actualizar mesa:", error);
    handleDatabaseError(error);
  }
};

/* Elimina una mesa */
export const deleteTable = async (id) => {
  try {
    const table_id = validateId(id);
    if (!table_id) throw new Error("ID de mesa inválido");

    const query = `
      DELETE FROM public.tables
      WHERE id = $1
      RETURNING id;
    `;

    const { rows } = await pool.query(query, [table_id]);
    if (rows.length === 0) {
      throw new Error("Mesa no encontrada");
    }

    return { message: "Mesa eliminada correctamente" };
  } catch (error) {
    console.error("Error al eliminar mesa:", error);
    throw error;
  }
};

/* Actualiza el estado de una mesa */
export const updateTableStatus = async (table_id, status) => {
  try {
    const validatedTableId = validateId(table_id);
    if (!validatedTableId) throw new Error("ID de mesa inválido");

    const validStatuses = ["available", "reserved"];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Estado inválido: ${status}. Debe ser uno de: ${validStatuses.join(
          ", "
        )}`
      );
    }

    const query = `
      UPDATE public.tables
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [status, validatedTableId]);

    if (rows.length === 0) {
      throw new Error("Mesa no encontrada");
    }

    console.log(`Estado de mesa ${validatedTableId} actualizado a: ${status}`);
    return rows[0];
  } catch (error) {
    console.error("Error al actualizar estado de mesa:", error);
    throw error;
  }
};
