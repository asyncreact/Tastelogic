// src/controllers/table.controller.js

import {
  getTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  getTableStatistics,
} from "../repositories/table.repository.js";
import { getZoneById } from "../repositories/zone.repository.js";
import { successResponse } from "../utils/response.js";

// Obtiene todas las mesas con filtros opcionales
export const listTable = async (req, res, next) => {
  try {
    const filters = {};

    if (req.query.zone_id) {
      filters.zone_id = Number(req.query.zone_id);
    }

    if (req.query.status) {
      filters.status = req.query.status;
    }

    if (req.query.is_active !== undefined) {
      filters.is_active = req.query.is_active === "true";
    }

    // Admin puede ver inactivas con el filtro include_inactive
    if (req.user && req.user.role === "admin" && req.query.include_inactive === "true") {
      filters.include_inactive = true;
    }

    const tables = await getTables(filters);

    return successResponse(res, "Mesas obtenidas correctamente", {
      tables,
      count: tables.length,
    });
  } catch (err) {
    next(err);
  }
};

// Obtiene una mesa específica por ID
export const showTable = async (req, res, next) => {
  try {
    const table_id = Number(req.params.table_id);

    if (isNaN(table_id) || table_id <= 0) {
      const error = new Error("El ID de la mesa debe ser un número válido");
      error.status = 400;
      throw error;
    }

    const table = await getTableById(table_id);

    if (!table) {
      const error = new Error("No encontramos la mesa que buscas");
      error.status = 404;
      throw error;
    }

    // Si no es admin y la mesa está inactiva, no mostrar
    if ((!req.user || req.user.role !== "admin") && !table.is_active) {
      const error = new Error("No encontramos la mesa que buscas");
      error.status = 404;
      throw error;
    }

    return successResponse(res, "Mesa obtenida correctamente", { table });
  } catch (err) {
    next(err);
  }
};

// Crea una nueva mesa
export const addTable = async (req, res, next) => {
  try {
    const { zone_id, table_number, capacity, status, is_active } = req.body;

    const zone = await getZoneById(Number(zone_id));
    if (!zone) {
      const error = new Error(
        "La zona seleccionada no existe. Por favor, elige una zona válida"
      );
      error.status = 404;
      throw error;
    }

    const table = await createTable({
      zone_id: Number(zone_id),
      table_number,
      capacity: Number(capacity),
      status,
      is_active,
    });

    return successResponse(res, "Mesa creada correctamente", { table }, 201);
  } catch (err) {
    next(err);
  }
};

// Actualiza una mesa
export const editTable = async (req, res, next) => {
  try {
    const table_id = Number(req.params.table_id);

    if (isNaN(table_id) || table_id <= 0) {
      const error = new Error("El ID de la mesa debe ser un número válido");
      error.status = 400;
      throw error;
    }

    const existing = await getTableById(table_id);
    if (!existing) {
      const error = new Error("No encontramos la mesa que deseas actualizar");
      error.status = 404;
      throw error;
    }

    if (req.body.zone_id && req.body.zone_id !== existing.zone_id) {
      const zone = await getZoneById(Number(req.body.zone_id));
      if (!zone) {
        const error = new Error(
          "La zona seleccionada no existe. Por favor, elige una zona válida"
        );
        error.status = 404;
        throw error;
      }
    }

    if (Object.keys(req.body).length === 0) {
      const error = new Error(
        "Debes proporcionar al menos un campo para actualizar"
      );
      error.status = 400;
      throw error;
    }

    const updated = await updateTable(table_id, req.body);

    return successResponse(res, "Mesa actualizada correctamente", {
      table: updated,
    });
  } catch (err) {
    next(err);
  }
};

// Elimina una mesa
export const removeTable = async (req, res, next) => {
  try {
    const table_id = Number(req.params.table_id);

    if (isNaN(table_id) || table_id <= 0) {
      const error = new Error("El ID de la mesa debe ser un número válido");
      error.status = 400;
      throw error;
    }

    const table = await getTableById(table_id);
    if (!table) {
      const error = new Error("No encontramos la mesa que deseas eliminar");
      error.status = 404;
      throw error;
    }

    const result = await deleteTable(table_id);

    return successResponse(res, result.message);
  } catch (err) {
    next(err);
  }
};

// Obtiene estadísticas de mesas
export const tableStats = async (req, res, next) => {
  try {
    const stats = await getTableStatistics();

    if (!stats || Object.keys(stats).length === 0) {
      const error = new Error("No hay datos disponibles para mostrar estadísticas");
      error.status = 404;
      throw error;
    }

    return successResponse(res, "Estadísticas de mesas obtenidas correctamente", {
      statistics: stats,
    });
  } catch (err) {
    next(err);
  }
};
