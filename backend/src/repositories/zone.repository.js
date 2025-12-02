// src/repositories/zone.repository.js

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

/* Campos permitidos para actualizar zonas */
const ALLOWED_ZONE_FIELDS = [
  "name",
  "description",
  "image_url",
  "is_active",
];

/* Validadores para campos de zonas */
const ZONE_VALIDATORS = {
  name: (value) => validateString(value, "El nombre de la zona"),
  description: (value) => (value ? value.trim() : null),
  image_url: (value) => (value ? value.trim() : null),
  is_active: (value) => Boolean(value),
};

/* Obtiene todas las zonas con filtro opcional */
export const getZones = async (filters = {}) => {
  try {
    let query = `
      SELECT id, name, description, image_url, is_active, created_at, updated_at
      FROM zones
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.is_active !== undefined) {
      query += ` AND is_active = $${paramCount}`;
      values.push(Boolean(filters.is_active));
      paramCount++;
    }

    query += ` ORDER BY name ASC;`;

    const { rows } = await pool.query(query, values);
    return rows;
  } catch (error) {
    console.error("Error al obtener zonas:", error);
    throw error;
  }
};

/* Obtiene una zona específica por ID */
export const getZoneById = async (id) => {
  try {
    const zoneId = validateId(id);
    if (!zoneId) throw new Error("ID de zona inválido");

    const query = `
      SELECT * FROM zones WHERE id = $1;
    `;
    const { rows } = await pool.query(query, [zoneId]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error al obtener zona por ID:", error);
    throw error;
  }
};

/* Crea una nueva zona */
export const createZone = async ({
  name,
  description = null,
  image_url = null,
  is_active = true,
}) => {
  try {
    validateString(name, "El nombre de la zona");

    const data = {
      name: name.trim(),
      description: description ? description.trim() : null,
      image_url: image_url ? image_url.trim() : null,
      is_active: Boolean(is_active),
    };

    const validatedData = validateFields(data, ZONE_VALIDATORS);
    const filteredData = filterAllowedFields(validatedData, ALLOWED_ZONE_FIELDS);

    const keys = Object.keys(filteredData);
    const values = Object.values(filteredData);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

    const query = `
      INSERT INTO zones (${keys.join(", ")})
      VALUES (${placeholders})
      RETURNING *;
    `;

    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error("Error al crear zona:", error);
    handleDatabaseError(error);
  }
};

/* Actualiza una zona (completa o parcial) */
export const updateZone = async (id, data) => {
  try {
    const zoneId = validateId(id);
    if (!zoneId) throw new Error("ID de zona inválido");

    const validatedData = validateFields(data, ZONE_VALIDATORS);
    const { query, values } = buildUpdateQuery(
      validatedData,
      ALLOWED_ZONE_FIELDS,
      "zones",
      zoneId
    );

    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      throw new Error("Zona no encontrada");
    }

    return rows[0];
  } catch (error) {
    console.error("Error al actualizar zona:", error);
    handleDatabaseError(error);
  }
};

/* Elimina una zona y mesas asociadas en una transacción */
export const deleteZone = async (id) => {
  const client = await pool.connect();
  try {
    const zoneId = validateId(id);
    if (!zoneId) throw new Error("ID de zona inválido");

    await client.query("BEGIN");

    await client.query("DELETE FROM tables WHERE zone_id = $1", [zoneId]);

    const result = await client.query(
      "DELETE FROM zones WHERE id = $1 RETURNING id",
      [zoneId]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      throw new Error("Zona no encontrada");
    }

    await client.query("COMMIT");
    return { message: "Zona y mesas asociadas eliminadas correctamente" };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al eliminar zona:", error);
    throw error;
  } finally {
    client.release();
  }
};
