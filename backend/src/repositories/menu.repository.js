// src/repositories/menu.repository.js

import { pool } from "../config/db.js";

const validateId = (id) => {
  const numId = Number(id);
  return isNaN(numId) || numId <= 0 ? null : numId;
};

const ALLOWED_CATEGORY_FIELDS = ["name", "description", "is_active"];

const ALLOWED_ITEM_FIELDS = [
  "category_id",
  "name",
  "description",
  "ingredients",
  "price",
  "image_url",
  "estimated_prep_time",
  "is_available"
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

export const getCategoryById = async (id) => {
  try {
    const categoryId = validateId(id);
    if (!categoryId) return null;

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

export const createCategory = async ({ name, description = null, is_active = true }) => {
  try {
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw new Error("El nombre de la categoría es requerido");
    }

    const query = `
      INSERT INTO menu_categories (name, description, is_active)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [
      name.trim(),
      description,
      Boolean(is_active)
    ]);
    return rows[0];
  } catch (error) {
    if (error.code === "23505") {
      throw new Error("El nombre de la categoría ya existe");
    }
    console.error("Error al crear categoría:", error);
    throw error;
  }
};

export const updateCategory = async (id, { name, description = null, is_active = true }) => {
  try {
    const categoryId = validateId(id);
    if (!categoryId) return null;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw new Error("El nombre de la categoría es requerido");
    }

    const query = `
      UPDATE menu_categories
      SET name = $1, description = $2, is_active = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [
      name.trim(),
      description,
      Boolean(is_active),
      categoryId
    ]);
    return rows[0] || null;
  } catch (error) {
    if (error.code === "23505") {
      throw new Error("El nombre de la categoría ya existe");
    }
    console.error("Error al actualizar categoría:", error);
    throw error;
  }
};

export const updateCategoryPartial = async (id, data) => {
  try {
    const categoryId = validateId(id);
    if (!categoryId) return null;

    const filteredData = filterAllowedFields(data, ALLOWED_CATEGORY_FIELDS);
    const keys = Object.keys(filteredData);

    if (keys.length === 0) {
      throw new Error("No se proporcionaron campos válidos para actualizar");
    }

    if (filteredData.name) {
      filteredData.name = filteredData.name.trim();
      if (filteredData.name.length === 0) {
        throw new Error("El nombre no puede estar vacío");
      }
    }

    if (filteredData.is_active !== undefined) {
      filteredData.is_active = Boolean(filteredData.is_active);
    }

    const setClauses = keys.map((key, i) => `${key} = $${i + 1}`);
    const values = Object.values(filteredData);

    const query = `
      UPDATE menu_categories
      SET ${setClauses.join(", ")}, updated_at = NOW()
      WHERE id = $${keys.length + 1}
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [...values, categoryId]);
    return rows[0] || null;
  } catch (error) {
    if (error.code === "23505") {
      throw new Error("El nombre de la categoría ya existe");
    }
    console.error("Error al actualizar parcialmente categoría:", error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  const client = await pool.connect();
  try {
    const categoryId = validateId(id);
    if (!categoryId) return null;

    await client.query("BEGIN");
    await client.query("DELETE FROM menu_items WHERE category_id = $1", [categoryId]);
    const result = await client.query(
      "DELETE FROM menu_categories WHERE id = $1 RETURNING id",
      [categoryId]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
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

export const getItemById = async (id) => {
  try {
    const itemId = validateId(id);
    if (!itemId) return null;

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
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw new Error("El nombre del plato es requerido");
    }

    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      throw new Error("El precio debe ser un número válido mayor o igual a 0");
    }

    if (estimated_prep_time && (isNaN(Number(estimated_prep_time)) || Number(estimated_prep_time) < 0)) {
      throw new Error("El tiempo de preparación debe ser un número válido");
    }

    const query = `
      INSERT INTO menu_items
      (category_id, name, description, ingredients, price, image_url, estimated_prep_time, is_available)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      category_id || null,
      name.trim(),
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
    console.error("Error al crear plato:", error);
    throw error;
  }
};

export const updateItem = async (id, data) => {
  try {
    const itemId = validateId(id);
    if (!itemId) return null;

    const {
      category_id,
      name,
      description,
      ingredients,
      price,
      image_url,
      estimated_prep_time,
      is_available,
    } = data;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw new Error("El nombre del plato es requerido");
    }

    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      throw new Error("El precio debe ser un número válido mayor o igual a 0");
    }

    const prepTime = estimated_prep_time !== undefined && estimated_prep_time !== null
      ? Number(estimated_prep_time)
      : 10;

    if (isNaN(prepTime) || prepTime < 0) {
      throw new Error("El tiempo de preparación debe ser un número válido");
    }

    const query = `
      UPDATE menu_items
      SET category_id = $1,
          name = $2,
          description = $3,
          ingredients = $4,
          price = $5,
          image_url = $6,
          estimated_prep_time = $7,
          is_available = $8,
          updated_at = NOW()
      WHERE id = $9
      RETURNING *;
    `;

    const values = [
      category_id !== undefined && category_id !== null ? category_id : null,
      name.trim(),
      description !== undefined ? description : null,
      ingredients !== undefined ? ingredients : null,
      Number(price),
      image_url !== undefined ? image_url : null,
      prepTime,
      is_available !== undefined ? Boolean(is_available) : true,
      itemId,
    ];

    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  } catch (error) {
    console.error("Error al actualizar plato:", error);
    throw error;
  }
};

export const updateItemPartial = async (id, data) => {
  try {
    const itemId = validateId(id);
    if (!itemId) return null;

    const filteredData = filterAllowedFields(data, ALLOWED_ITEM_FIELDS);
    const keys = Object.keys(filteredData);

    if (keys.length === 0) {
      throw new Error("No se proporcionaron campos válidos para actualizar");
    }

    if (filteredData.name !== undefined) {
      if (typeof filteredData.name !== "string" || filteredData.name.trim().length === 0) {
        throw new Error("El nombre del plato no puede estar vacío");
      }
      filteredData.name = filteredData.name.trim();
    }

    if (filteredData.price !== undefined) {
      const priceNum = Number(filteredData.price);
      if (isNaN(priceNum) || priceNum < 0) {
        throw new Error("El precio debe ser un número válido mayor o igual a 0");
      }
      filteredData.price = priceNum;
    }

    if (filteredData.estimated_prep_time !== undefined) {
      const timeNum = Number(filteredData.estimated_prep_time);
      if (isNaN(timeNum) || timeNum < 0) {
        throw new Error("El tiempo de preparación debe ser un número válido");
      }
      filteredData.estimated_prep_time = timeNum;
    }

    if (filteredData.is_available !== undefined) {
      filteredData.is_available = Boolean(filteredData.is_available);
    }

    const setClauses = keys.map((key, i) => `${key} = $${i + 1}`);
    const values = Object.values(filteredData);

    const query = `
      UPDATE menu_items
      SET ${setClauses.join(", ")}, updated_at = NOW()
      WHERE id = $${keys.length + 1}
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [...values, itemId]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error al actualizar parcialmente plato:", error);
    throw error;
  }
};

export const deleteItem = async (id) => {
  try {
    const itemId = validateId(id);
    if (!itemId) return null;

    const result = await pool.query(
      "DELETE FROM menu_items WHERE id = $1 RETURNING id",
      [itemId]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return { message: "Plato eliminado correctamente" };
  } catch (error) {
    console.error("Error al eliminar plato:", error);
    throw error;
  }
};
