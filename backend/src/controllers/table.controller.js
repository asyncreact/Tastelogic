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

    return successResponse(res, "Mesa obtenida correctamente", { table });
  } catch (err) {
    next(err);
  }
};

// Crea una nueva mesa
export const addTable = async (req, res, next) => {
  try {
    const { zone_id, capacity, table_number, status } = req.body;

    if (!zone_id || !capacity) {
      const error = new Error("La zona y la capacidad son obligatorias para crear una mesa");
      error.status = 400;
      throw error;
    }

    const zone = await getZoneById(zone_id);
    
    if (!zone) {
      const error = new Error("La zona seleccionada no existe. Por favor, elige una zona válida");
      error.status = 404;
      throw error;
    }

    const table_data = {
      zone_id,
      capacity,
      ...(table_number && { table_number }),
      ...(status && { status }),
    };

    const table = await createTable(table_data);
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

    // Validar zone_id si se proporciona
    const { zone_id } = req.body;
    if (zone_id && zone_id !== existing.zone_id) {
      const zone = await getZoneById(zone_id);
      
      if (!zone) {
        const error = new Error("La zona seleccionada no existe. Por favor, elige una zona válida");
        error.status = 404;
        throw error;
      }
    }

    const update_data = {
      ...(req.body.zone_id && { zone_id: req.body.zone_id }),
      ...(req.body.capacity && { capacity: req.body.capacity }),
      ...(req.body.table_number && { table_number: req.body.table_number }),
      ...(req.body.status && { status: req.body.status }),
      ...(req.body.is_active !== undefined && { is_active: req.body.is_active }),
    };

    if (Object.keys(update_data).length === 0) {
      const error = new Error("Debes proporcionar al menos un campo para actualizar");
      error.status = 400;
      throw error;
    }

    const updated = await updateTable(table_id, update_data);
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

// Obtiene estadísticas generales de mesas
export const tableStats = async (req, res, next) => {
  try {
    const stats = await getTableStatistics();
    
    if (!stats) {
      const error = new Error("No se pudieron obtener las estadísticas de las mesas");
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
