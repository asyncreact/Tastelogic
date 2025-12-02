// src/repositories/menu.repository.js

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

/* Valida que un número sea válido y no negativo (salvo que se permita) */
const validateNumber = (value, fieldName, allowNegative = false) => {
  const num = Number(value);
  if (isNaN(num) || (!allowNegative && num < 0)) {
    throw new Error(
      `${fieldName} debe ser un número válido ${allowNegative ? "" : "no negativo"}`
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

/* Aplica validadores específicos a los campos presentes */
const validateFields = (data, fieldValidators) => {
  const validated = { ...data };
  Object.entries(fieldValidators).forEach(([field, validator]) => {
    if (validated[field] !== undefined && validated[field] !== null) {
      validated[field] = validator(validated[field]);
    }
  });
  return validated;
};

/* Construye una query UPDATE dinámica con los campos permitidos */
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

/* Normaliza y traduce errores comunes de PostgreSQL */
const handleDatabaseError = (error) => {
  if (error.code === "23505") {
    throw new Error("Este registro ya existe (violación de unicidad)");
  }
  if (error.code === "23503") {
    throw new Error("Referencia a un registro que no existe");
  }
  throw error;
};

/* Campos permitidos para actualizar categorías */
const ALLOWED_CATEGORY_FIELDS = ["name", "description", "is_active"];

/* Campos permitidos para actualizar items del menú */
const ALLOWED_ITEM_FIELDS = [
  "category_id",
  "name",
  "description",
  "ingredients",
  "price",
  "image_url",
  "estimated_prep_time",
  "is_available",
];

/* Validadores para campos de categoría */
const CATEGORY_VALIDATORS = {
  name: (value) => validateString(value, "El nombre de la categoría"),
  is_active: (value) => Boolean(value),
};

/* Validadores para campos de items */
const ITEM_VALIDATORS = {
  name: (value) => validateString(value, "El nombre del plato"),
  price: (value) => validateNumber(value, "El precio"),
  estimated_prep_time: (value) => validateNumber(value, "El tiempo de preparación"),
  is_available: (value) => Boolean(value),
};

/* CATEGORÍAS */

/* Obtiene todas las categorías ordenadas por ID */
export const getAllCategories = async () => {
  try {
    const result = await pool.query(`
      SELECT id, name, description, is_active, created_at, updated_at
      FROM menu_categories
      ORDER BY id ASC;
    `);
    return result.rows;
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    throw error;
  }
};

/* Obtiene una categoría específica por su ID */
export const getCategoryById = async (id) => {
  try {
    const categoryId = validateId(id);
    if (!categoryId) throw new Error("ID de categoría inválido");

    const result = await pool.query(
      "SELECT * FROM menu_categories WHERE id = $1",
      [categoryId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error al obtener categoría por ID:", error);
    throw error;
  }
};

/* Crea una nueva categoría */
export const createCategory = async ({
  name,
  description = null,
  is_active = true,
}) => {
  try {
    validateString(name, "El nombre de la categoría");

    const query = `
      INSERT INTO menu_categories (name, description, is_active)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [
      name,
      description,
      Boolean(is_active),
    ]);
    return rows[0];
  } catch (error) {
    handleDatabaseError(error);
  }
};

/* Actualiza una categoría (completa o parcial según los campos enviados) */
export const updateCategory = async (id, data) => {
  try {
    const categoryId = validateId(id);
    if (!categoryId) throw new Error("ID de categoría inválido");

    const validatedData = validateFields(data, CATEGORY_VALIDATORS);
    const { query, values } = buildUpdateQuery(
      validatedData,
      ALLOWED_CATEGORY_FIELDS,
      "menu_categories",
      categoryId
    );

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      throw new Error("Categoría no encontrada");
    }
    return rows[0];
  } catch (error) {
    handleDatabaseError(error);
  }
};

/* Elimina una categoría y todos sus items asociados en una transacción */
export const deleteCategory = async (id) => {
  const client = await pool.connect();
  try {
    const categoryId = validateId(id);
    if (!categoryId) throw new Error("ID de categoría inválido");

    await client.query("BEGIN");

    await client.query("DELETE FROM menu_items WHERE category_id = $1", [
      categoryId,
    ]);

    const result = await client.query(
      "DELETE FROM menu_categories WHERE id = $1 RETURNING id",
      [categoryId]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      throw new Error("Categoría no encontrada");
    }

    await client.query("COMMIT");
    return { message: "Categoría y platos asociados eliminados correctamente" };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al eliminar categoría:", error);
    throw error;
  } finally {
    client.release();
  }
};

/* ITEMS DEL MENÚ */

/* Obtiene todos los items del menú con nombres de categoría */
export const getAllItems = async () => {
  try {
    const query = `
      SELECT mi.*, mc.name AS category_name
      FROM menu_items mi
      LEFT JOIN menu_categories mc ON mi.category_id = mc.id
      ORDER BY mi.id ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error al obtener platos:", error);
    throw error;
  }
};

/* Obtiene un item específico por su ID */
export const getItemById = async (id) => {
  try {
    const itemId = validateId(id);
    if (!itemId) throw new Error("ID de plato inválido");

    const query = `
      SELECT mi.*, mc.name AS category_name
      FROM menu_items mi
      LEFT JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE mi.id = $1;
    `;
    const { rows } = await pool.query(query, [itemId]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error al obtener plato por ID:", error);
    throw error;
  }
};

/* Crea un nuevo item del menú */
export const createItem = async ({
  category_id = null,
  name,
  description = null,
  ingredients = null,
  price,
  image_url = null,
  estimated_prep_time = 10,
  is_available = true,
}) => {
  try {
    validateString(name, "El nombre del plato");
    validateNumber(price, "El precio");
    validateNumber(estimated_prep_time, "El tiempo de preparación");

    const query = `
      INSERT INTO menu_items
      (category_id, name, description, ingredients, price, image_url, estimated_prep_time, is_available)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      category_id || null,
      name,
      description,
      ingredients,
      Number(price),
      image_url,
      Number(estimated_prep_time),
      Boolean(is_available),
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    handleDatabaseError(error);
  }
};

/* Actualiza un item (completo o parcial según los campos enviados) */
export const updateItem = async (id, data) => {
  try {
    const itemId = validateId(id);
    if (!itemId) throw new Error("ID de plato inválido");

    const validatedData = validateFields(data, ITEM_VALIDATORS);
    const { query, values } = buildUpdateQuery(
      validatedData,
      ALLOWED_ITEM_FIELDS,
      "menu_items",
      itemId
    );

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      throw new Error("Plato no encontrado");
    }
    return rows[0];
  } catch (error) {
    handleDatabaseError(error);
  }
};

/* Elimina un item del menú */
export const deleteItem = async (id) => {
  try {
    const itemId = validateId(id);
    if (!itemId) throw new Error("ID de plato inválido");

    const result = await pool.query(
      "DELETE FROM menu_items WHERE id = $1 RETURNING id",
      [itemId]
    );

    if (result.rowCount === 0) {
      throw new Error("Plato no encontrado");
    }
    return { message: "Plato eliminado correctamente" };
  } catch (error) {
    console.error("Error al eliminar plato:", error);
    throw error;
  }
};
