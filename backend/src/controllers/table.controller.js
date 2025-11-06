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
import { successResponse, errorResponse } from "../utils/response.js";

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
    console.error("Error en listTable:", err);
    next(err);
  }
};

// Obtiene una mesa específica por ID
export const showTable = async (req, res, next) => {
  try {
    const table_id = Number(req.params.table_id);
    if (isNaN(table_id) || table_id <= 0) {
      return errorResponse(res, 400, "ID de mesa inválido");
    }

    const table = await getTableById(table_id);
    if (!table) {
      return errorResponse(res, 404, "Mesa no encontrada");
    }

    return successResponse(res, "Mesa obtenida correctamente", { table });
  } catch (err) {
    console.error("Error en showTable:", err);
    next(err);
  }
};

// Crea una nueva mesa
export const addTable = async (req, res, next) => {
  try {
    const { zone_id, capacity, table_number, status } = req.body;

    if (!zone_id || !capacity) {
      return errorResponse(
        res,
        400,
        "zone_id y capacity son requeridos. table_number se genera automáticamente."
      );
    }

    const zone = await getZoneById(zone_id);
    if (!zone) {
      return errorResponse(res, 404, `Zona con ID ${zone_id} no existe`);
    }

    const table_data = {
      zone_id,
      capacity,
      ...(table_number && { table_number }),
      ...(status && { status }),
    };

    console.log("📥 Data para crear mesa:", table_data);
    const table = await createTable(table_data);
    return successResponse(res, "Mesa creada correctamente", { table }, 201);
  } catch (err) {
    console.error("Error en addTable:", err);
    next(err);
  }
};

// Actualiza una mesa
export const editTable = async (req, res, next) => {
  try {
    const table_id = Number(req.params.table_id);
    if (isNaN(table_id) || table_id <= 0) {
      return errorResponse(res, 400, "ID de mesa inválido");
    }

    const existing = await getTableById(table_id);
    if (!existing) {
      return errorResponse(res, 404, "Mesa no encontrada");
    }

    // Validar zone_id si se proporciona
    const { zone_id } = req.body;
    if (zone_id && zone_id !== existing.zone_id) {
      const zone = await getZoneById(zone_id);
      if (!zone) {
        return errorResponse(res, 404, `Zona con ID ${zone_id} no existe`);
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
      return errorResponse(res, 400, "No se proporcionaron campos para actualizar");
    }

    const updated = await updateTable(table_id, update_data);
    return successResponse(res, "Mesa actualizada correctamente", {
      table: updated,
    });
  } catch (err) {
    console.error("Error en editTable:", err);
    next(err);
  }
};

// Elimina una mesa
export const removeTable = async (req, res, next) => {
  try {
    const table_id = Number(req.params.table_id);
    if (isNaN(table_id) || table_id <= 0) {
      return errorResponse(res, 400, "ID de mesa inválido");
    }

    const table = await getTableById(table_id);
    if (!table) {
      return errorResponse(res, 404, "Mesa no encontrada");
    }

    const result = await deleteTable(table_id);
    return successResponse(res, result.message);
  } catch (err) {
    console.error("Error en removeTable:", err);
    next(err);
  }
};

// Obtiene estadísticas generales de mesas
export const tableStats = async (req, res, next) => {
  try {
    const stats = await getTableStatistics();
    if (!stats) {
      return errorResponse(res, 404, "No se pudo obtener estadísticas");
    }

    return successResponse(res, "Estadísticas de mesas obtenidas correctamente", {
      statistics: stats,
    });
  } catch (err) {
    console.error("Error en tableStats:", err);
    next(err);
  }
};
