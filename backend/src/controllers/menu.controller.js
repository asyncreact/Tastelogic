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
import { successResponse } from "../utils/response.js";

/* CATEGORÍAS */

/* Obtiene todas las categorías */
export const listMenu = async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    return successResponse(res, "Categorías obtenidas correctamente", {
      categories,
    });
  } catch (err) {
    next(err);
  }
};

/* Obtiene una categoría específica por ID */
export const showMenu = async (req, res, next) => {
  try {
    /* Valida que el ID de categoría sea un número positivo */
    const categoryId = Number(req.params.category_id);
    if (isNaN(categoryId) || categoryId <= 0) {
      const error = new Error("El ID de la categoría debe ser un número válido");
      error.status = 400;
      throw error;
    }

    const category = await getCategoryById(categoryId);
    if (!category) {
      const error = new Error("No encontramos la categoría que buscas");
      error.status = 404;
      throw error;
    }

    return successResponse(res, "Categoría obtenida correctamente", {
      category,
    });
  } catch (err) {
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
    next(err);
  }
};

/* Actualiza una categoría (PUT o PATCH - completo o parcial) */
export const editMenu = async (req, res, next) => {
  try {
    /* Valida el ID antes de actualizar */
    const categoryId = Number(req.params.category_id);
    if (isNaN(categoryId) || categoryId <= 0) {
      const error = new Error("El ID de la categoría debe ser un número válido");
      error.status = 400;
      throw error;
    }

    const existing = await getCategoryById(categoryId);
    if (!existing) {
      const error = new Error("No encontramos la categoría que deseas actualizar");
      error.status = 404;
      throw error;
    }

    const updated = await updateCategory(categoryId, req.body);
    return successResponse(res, "Categoría actualizada correctamente", {
      category: updated,
    });
  } catch (err) {
    next(err);
  }
};

/* Elimina una categoría */
export const removeMenu = async (req, res, next) => {
  try {
    /* Valida el ID antes de eliminar */
    const categoryId = Number(req.params.category_id);
    if (isNaN(categoryId) || categoryId <= 0) {
      const error = new Error("El ID de la categoría debe ser un número válido");
      error.status = 400;
      throw error;
    }

    const category = await getCategoryById(categoryId);
    if (!category) {
      const error = new Error("No encontramos la categoría que deseas eliminar");
      error.status = 404;
      throw error;
    }

    const result = await deleteCategory(categoryId);
    return successResponse(res, result.message);
  } catch (err) {
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
    next(err);
  }
};

/* Obtiene un item específico por ID */
export const showItem = async (req, res, next) => {
  try {
    /* Valida que el ID del producto sea un número positivo */
    const itemId = Number(req.params.item_id);
    if (isNaN(itemId) || itemId <= 0) {
      const error = new Error("El ID del producto debe ser un número válido");
      error.status = 400;
      throw error;
    }

    const item = await getItemById(itemId);
    if (!item) {
      const error = new Error("No encontramos el producto que buscas");
      error.status = 404;
      throw error;
    }

    return successResponse(res, "Item obtenido correctamente", { item });
  } catch (err) {
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

    /* Valida que la categoría exista si se proporciona category_id */
    if (category_id) {
      const categoryExists = await getCategoryById(category_id);
      if (!categoryExists) {
        const error = new Error("La categoría especificada no existe");
        error.status = 400;
        throw error;
      }
    }

    /* Valida que el precio sea positivo */
    if (price !== undefined && Number(price) < 0) {
      const error = new Error("El precio no puede ser negativo");
      error.status = 400;
      throw error;
    }

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

    return successResponse(res, "Producto creado correctamente", { item }, 201);
  } catch (err) {
    next(err);
  }
};

/* Actualiza un item (PUT o PATCH - completo o parcial) */
export const editItem = async (req, res, next) => {
  try {
    /* Valida el ID del producto antes de procesar el body */
    const itemId = Number(req.params.item_id);
    if (isNaN(itemId) || itemId <= 0) {
      const error = new Error("El ID del producto debe ser un número válido");
      error.status = 400;
      throw error;
    }

    const existing = await getItemById(itemId);
    if (!existing) {
      const error = new Error("No encontramos el producto que deseas actualizar");
      error.status = 404;
      throw error;
    }

    /* Valida que la categoría exista si se actualiza category_id */
    if (req.body.category_id) {
      const categoryExists = await getCategoryById(req.body.category_id);
      if (!categoryExists) {
        const error = new Error("La categoría especificada no existe");
        error.status = 400;
        throw error;
      }
    }

    /* Valida que el precio actualizado no sea negativo */
    if (req.body.price !== undefined && Number(req.body.price) < 0) {
      const error = new Error("El precio no puede ser negativo");
      error.status = 400;
      throw error;
    }

    let imageUrl = existing.image_url;
    if (req.file) {
      imageUrl = `/uploads/menu/${req.file.filename}`;
    }

    const data = {
      ...req.body,
      category_id:
        req.body.category_id !== undefined
          ? req.body.category_id
          : existing.category_id,
      ...(req.file && { image_url: imageUrl }),
    };

    const updated = await updateItem(itemId, data);
    return successResponse(res, "Producto actualizado correctamente", {
      item: updated,
    });
  } catch (err) {
    next(err);
  }
};

/* Elimina un item */
export const removeItem = async (req, res, next) => {
  try {
    /* Valida el ID del producto antes de eliminar */
    const itemId = Number(req.params.item_id);
    if (isNaN(itemId) || itemId <= 0) {
      const error = new Error("El ID del producto debe ser un número válido");
      error.status = 400;
      throw error;
    }

    const item = await getItemById(itemId);
    if (!item) {
      const error = new Error("No encontramos el producto que deseas eliminar");
      error.status = 404;
      throw error;
    }

    const result = await deleteItem(itemId);
    return successResponse(res, result.message);
  } catch (err) {
    next(err);
  }
};
