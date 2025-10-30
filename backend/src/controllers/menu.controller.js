// src/controllers/menu.controller.js

import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  updateCategoryPartial,
  deleteCategory,
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  updateItemPartial,
  deleteItem,
} from "../repositories/menu.repository.js";
import { pool } from "../config/db.js";
import { successResponse, errorResponse } from "../utils/response.js";
import {
  validateCategory,
  validateItem,
  validatePartialCategory,
  validatePartialItem,
} from "../validators/menu.validator.js";

export const getCategories = async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    return successResponse(res, "Categorías obtenidas correctamente", { categories });
  } catch (err) {
    console.error("Error en getCategories:", err);
    next(err);
  }
};

export const getCategory = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return errorResponse(res, 400, "ID de categoría inválido");
    }

    const category = await getCategoryById(id);
    
    if (!category) {
      return errorResponse(res, 404, "Categoría no encontrada");
    }

    return successResponse(res, "Categoría obtenida correctamente", { category });
  } catch (err) {
    console.error("Error en getCategory:", err);
    next(err);
  }
};

export const addCategory = async (req, res, next) => {
  try {
    const validatedData = validateCategory(req.body);
    const newCategory = await createCategory(validatedData);
    
    return successResponse(
      res,
      "Categoría creada correctamente",
      { category: newCategory },
      201
    );
  } catch (err) {
    if (err.message === "El nombre de la categoría ya existe") {
      return errorResponse(res, 409, err.message);
    }
    
    if (err.message.includes("requerido") || err.message.includes("válido")) {
      return errorResponse(res, 400, err.message);
    }
    
    console.error("Error en addCategory:", err);
    next(err);
  }
};

export const editCategory = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return errorResponse(res, 400, "ID de categoría inválido");
    }

    const validatedData = validateCategory(req.body);
    const updated = await updateCategory(id, validatedData);
    
    if (!updated) {
      return errorResponse(res, 404, "Categoría no encontrada");
    }

    return successResponse(res, "Categoría actualizada correctamente", { category: updated });
  } catch (err) {
    if (err.message === "El nombre de la categoría ya existe") {
      return errorResponse(res, 409, err.message);
    }
    
    if (err.message.includes("requerido") || err.message.includes("válido")) {
      return errorResponse(res, 400, err.message);
    }
    
    console.error("Error en editCategory:", err);
    next(err);
  }
};

export const patchCategory = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return errorResponse(res, 400, "ID de categoría inválido");
    }

    const existing = await getCategoryById(id);
    if (!existing) {
      return errorResponse(res, 404, "Categoría no encontrada");
    }

    const validatedData = validatePartialCategory(req.body);
    const updated = await updateCategoryPartial(id, validatedData);
    
    if (!updated) {
      return errorResponse(res, 400, "No se pudo actualizar la categoría");
    }

    return successResponse(res, "Categoría actualizada parcialmente", { category: updated });
  } catch (err) {
    if (err.message === "El nombre de la categoría ya existe") {
      return errorResponse(res, 409, err.message);
    }
    
    if (err.message.includes("campo") || err.message.includes("válido")) {
      return errorResponse(res, 400, err.message);
    }
    
    console.error("Error en patchCategory:", err);
    next(err);
  }
};

export const removeCategory = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return errorResponse(res, 400, "ID de categoría inválido");
    }

    const category = await getCategoryById(id);
    if (!category) {
      return errorResponse(res, 404, "Categoría no encontrada");
    }

    const result = await deleteCategory(id);
    
    return successResponse(res, result.message);
  } catch (err) {
    console.error("Error en removeCategory:", err);
    next(err);
  }
};

export const getItems = async (req, res, next) => {
  try {
    const items = await getAllItems();
    return successResponse(res, "Platos obtenidos correctamente", { items });
  } catch (err) {
    console.error("Error en getItems:", err);
    next(err);
  }
};

export const getItem = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return errorResponse(res, 400, "ID de plato inválido");
    }

    const item = await getItemById(id);
    
    if (!item) {
      return errorResponse(res, 404, "Plato no encontrado");
    }

    return successResponse(res, "Plato obtenido correctamente", { item });
  } catch (err) {
    console.error("Error en getItem:", err);
    next(err);
  }
};

export const addItem = async (req, res, next) => {
  try {
    const validatedData = validateItem(req.body);
    
    if (validatedData.category_id) {
      const categoryExists = await getCategoryById(validatedData.category_id);
      if (!categoryExists) {
        return errorResponse(res, 400, "La categoría especificada no existe");
      }
    }
    
    const newItem = await createItem(validatedData);
    
    return successResponse(
      res,
      "Plato creado correctamente",
      { item: newItem },
      201
    );
  } catch (err) {
    if (err.message.includes("requerido") || err.message.includes("válido")) {
      return errorResponse(res, 400, err.message);
    }
    
    if (err.code === "23503") {
      return errorResponse(res, 400, "La categoría especificada no existe");
    }
    
    console.error("Error en addItem:", err);
    next(err);
  }
};

export const editItem = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return errorResponse(res, 400, "ID de plato inválido");
    }

    const existing = await getItemById(id);
    if (!existing) {
      return errorResponse(res, 404, "Plato no encontrado");
    }

    const validatedData = validateItem(req.body);
    
    if (validatedData.category_id) {
      const categoryExists = await getCategoryById(validatedData.category_id);
      if (!categoryExists) {
        return errorResponse(res, 400, "La categoría especificada no existe");
      }
    }
    
    const updated = await updateItem(id, validatedData);

    return successResponse(res, "Plato actualizado correctamente", { item: updated });
  } catch (err) {
    if (err.message.includes("requerido") || err.message.includes("válido")) {
      return errorResponse(res, 400, err.message);
    }
    
    if (err.code === "23503") {
      return errorResponse(res, 400, "La categoría especificada no existe");
    }
    
    console.error("Error en editItem:", err);
    next(err);
  }
};

export const patchItem = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return errorResponse(res, 400, "ID de plato inválido");
    }

    const existing = await getItemById(id);
    if (!existing) {
      return errorResponse(res, 404, "Plato no encontrado");
    }

    const validatedData = validatePartialItem(req.body);
    
    if (validatedData.category_id) {
      const categoryExists = await getCategoryById(validatedData.category_id);
      if (!categoryExists) {
        return errorResponse(res, 400, "La categoría especificada no existe");
      }
    }
    
    const updated = await updateItemPartial(id, validatedData);
    
    if (!updated) {
      return errorResponse(res, 400, "No se pudo actualizar el plato");
    }

    return successResponse(res, "Plato actualizado parcialmente", { item: updated });
  } catch (err) {
    if (err.message.includes("campo") || err.message.includes("válido")) {
      return errorResponse(res, 400, err.message);
    }
    
    if (err.code === "23503") {
      return errorResponse(res, 400, "La categoría especificada no existe");
    }
    
    console.error("Error en patchItem:", err);
    next(err);
  }
};

export const removeItem = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return errorResponse(res, 400, "ID de plato inválido");
    }

    const item = await getItemById(id);
    if (!item) {
      return errorResponse(res, 404, "Plato no encontrado");
    }

    const result = await deleteItem(id);
    
    return successResponse(res, result.message);
  } catch (err) {
    console.error("Error en removeItem:", err);
    next(err);
  }
};

export const getPublicMenu = async (req, res, next) => {
  try {
    const query = `
      SELECT mi.*, mc.name AS category_name
      FROM menu_items mi
      LEFT JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE mi.is_available = true
      ORDER BY mc.name, mi.name ASC;
    `;
    
    const { rows } = await pool.query(query);
    
    return successResponse(res, "Menú público obtenido correctamente", { items: rows });
  } catch (err) {
    console.error("Error en getPublicMenu:", err);
    next(err);
  }
};

export const getPublicCategories = async (req, res, next) => {
  try {
    const query = `
      SELECT id, name, description
      FROM menu_categories
      ORDER BY name ASC;
    `;
    
    const { rows } = await pool.query(query);
    
    return successResponse(res, "Categorías públicas obtenidas correctamente", { categories: rows });
  } catch (err) {
    console.error("Error en getPublicCategories:", err);
    next(err);
  }
};

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, "No se proporcionó ninguna imagen");
    }

    const imageUrl = `/uploads/menu/${req.file.filename}`;

    return successResponse(res, "Imagen subida exitosamente", {
      url: imageUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error("Error al subir imagen:", error);
    next(error);
  }
};
