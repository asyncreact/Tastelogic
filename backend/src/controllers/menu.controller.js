// src/controllers/menu.controller.js

import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from "../repositories/menu.repository.js";

import { successResponse, errorResponse } from "../utils/response.js";

/* CATEGORÍAS */

/* Obtiene todas las categorías */
export const listMenu = async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    return successResponse(res, "Categorías obtenidas correctamente", {
      categories,
    });
  } catch (err) {
    console.error("Error en listMenu:", err);
    next(err);
  }
};

/* Obtiene una categoría específica por ID */
export const showMenu = async (req, res, next) => {
  try {
    const categoryId = Number(req.params.category_id);
    if (isNaN(categoryId) || categoryId <= 0) {
      return errorResponse(res, 400, "ID de categoría inválido");
    }

    const category = await getCategoryById(categoryId);
    if (!category) {
      return errorResponse(res, 404, "Categoría no encontrada");
    }

    return successResponse(res, "Categoría obtenida correctamente", {
      category,
    });
  } catch (err) {
    console.error("Error en showMenu:", err);
    next(err);
  }
};

/* Crea una nueva categoría */
export const addMenu = async (req, res, next) => {
  try {
    const { name, description, is_active } = req.body;

    const category = await createCategory({
      name,
      description: description || null,
      is_active: is_active ?? true,
    });

    return successResponse(
      res,
      "Categoría creada correctamente",
      { category },
      201
    );
  } catch (err) {
    if (err.code === "23505") {
      return errorResponse(res, 409, "El nombre de la categoría ya existe");
    }
    if (err.message.includes("requerido")) {
      return errorResponse(res, 400, err.message);
    }
    console.error("Error en addMenu:", err);
    next(err);
  }
};

/* Actualiza una categoría (PUT o PATCH - completo o parcial) */
export const editMenu = async (req, res, next) => {
  try {
    const categoryId = Number(req.params.category_id);
    if (isNaN(categoryId) || categoryId <= 0) {
      return errorResponse(res, 400, "ID de categoría inválido");
    }

    const existing = await getCategoryById(categoryId);
    if (!existing) {
      return errorResponse(res, 404, "Categoría no encontrada");
    }

    const updated = await updateCategory(categoryId, req.body);

    return successResponse(res, "Categoría actualizada correctamente", {
      category: updated,
    });
  } catch (err) {
    if (err.code === "23505") {
      return errorResponse(res, 409, "El nombre de la categoría ya existe");
    }
    console.error("Error en editMenu:", err);
    next(err);
  }
};

/* Elimina una categoría */
export const removeMenu = async (req, res, next) => {
  try {
    const categoryId = Number(req.params.category_id);
    if (isNaN(categoryId) || categoryId <= 0) {
      return errorResponse(res, 400, "ID de categoría inválido");
    }

    const category = await getCategoryById(categoryId);
    if (!category) {
      return errorResponse(res, 404, "Categoría no encontrada");
    }

    const result = await deleteCategory(categoryId);
    return successResponse(res, result.message);
  } catch (err) {
    console.error("Error en removeMenu:", err);
    next(err);
  }
};

/* ITEMS DEL MENÚ */

/* Obtiene todos los items */
export const listItem = async (req, res, next) => {
  try {
    const items = await getAllItems();
    return successResponse(res, "Items obtenidos correctamente", { items });
  } catch (err) {
    console.error("Error en listItem:", err);
    next(err);
  }
};

/* Obtiene un item específico por ID */
export const showItem = async (req, res, next) => {
  try {
    const itemId = Number(req.params.item_id);
    if (isNaN(itemId) || itemId <= 0) {
      return errorResponse(res, 400, "ID de item inválido");
    }

    const item = await getItemById(itemId);
    if (!item) {
      return errorResponse(res, 404, "Item no encontrado");
    }

    return successResponse(res, "Item obtenido correctamente", { item });
  } catch (err) {
    console.error("Error en showItem:", err);
    next(err);
  }
};

/* Crea un nuevo item */
export const addItem = async (req, res, next) => {
  try {
    const {
      category_id,
      name,
      description,
      ingredients,
      price,
      estimated_prep_time,
      is_available,
    } = req.body;

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/menu/${req.file.filename}`;
    }

    const item = await createItem({
      category_id: category_id || null,
      name,
      description: description || null,
      ingredients: ingredients || null,
      price,
      image_url: imageUrl,
      estimated_prep_time: estimated_prep_time || 10,
      is_available: is_available ?? true,
    });

    return successResponse(res, "Item creado correctamente", { item }, 201);
  } catch (err) {
    console.error("Error en addItem:", err);
    next(err);
  }
};

/* Actualiza un item (PUT o PATCH - completo o parcial) */
export const editItem = async (req, res, next) => {
  try {
    const itemId = Number(req.params.item_id);
    if (isNaN(itemId) || itemId <= 0) {
      return errorResponse(res, 400, "ID de item inválido");
    }

    const existing = await getItemById(itemId);
    if (!existing) {
      return errorResponse(res, 404, "Item no encontrado");
    }

    let imageUrl = existing.image_url;
    if (req.file) {
      imageUrl = `/uploads/menu/${req.file.filename}`;
    }

    const data = {
      ...req.body,
      ...(req.file && { image_url: imageUrl }),
    };

    const updated = await updateItem(itemId, data);

    return successResponse(res, "Item actualizado correctamente", {
      item: updated,
    });
  } catch (err) {
    console.error("Error en editItem:", err);
    next(err);
  }
};

/* Elimina un item */
export const removeItem = async (req, res, next) => {
  try {
    const itemId = Number(req.params.item_id);
    if (isNaN(itemId) || itemId <= 0) {
      return errorResponse(res, 400, "ID de item inválido");
    }

    const item = await getItemById(itemId);
    if (!item) {
      return errorResponse(res, 404, "Item no encontrado");
    }

    const result = await deleteItem(itemId);
    return successResponse(res, result.message);
  } catch (err) {
    console.error("Error en removeItem:", err);
    next(err);
  }
};
