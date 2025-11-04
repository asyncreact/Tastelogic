// src/controllers/table.controller.js

import {
  getAllTables,
  getTableById,
  getTablesByZone,
  getTablesByStatus,
  getAvailableTablesByZone,
  createTable,
  updateTable,
  updateTablePartial,
  updateTableStatus,
  deleteTable,
} from "../repositories/table.repository.js";
import { successResponse, errorResponse } from "../utils/response.js";

// ============================================================
// MESAS
// ============================================================

export const getTables = async (req, res, next) => {
  try {
    const tables = await getAllTables();
    return successResponse(res, "Mesas obtenidas correctamente", { tables });
  } catch (err) {
    console.error("Error en getTables:", err);
    next(err);
  }
};

export const getTable = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return errorResponse(res, 400, "ID de mesa inválido");
    }

    const table = await getTableById(id);
    if (!table) {
      return errorResponse(res, 404, "Mesa no encontrada");
    }

    return successResponse(res, "Mesa obtenida correctamente", { table });
  } catch (err) {
    console.error("Error en getTable:", err);
    next(err);
  }
};

export const addTable = async (req, res, next) => {
  try {
    const { zone_id = null, table_number, capacity, status = "available", is_active = true } = req.body;

    const newTable = await createTable({
      zone_id,
      table_number,
      capacity,
      status,
      is_active,
    });

    return successResponse(
      res,
      "Mesa creada correctamente",
      { table: newTable },
      201
    );
  } catch (err) {
    if (err.message.includes("ya existe")) {
      return errorResponse(res, 409, err.message);
    }

    if (err.message.includes("requerido") || err.message.includes("válido")) {
      return errorResponse(res, 400, err.message);
    }

    if (err.code === "23503") {
      return errorResponse(res, 400, "La zona especificada no existe");
    }

    console.error("Error en addTable:", err);
    next(err);
  }
};

export const editTable = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return errorResponse(res, 400, "ID de mesa inválido");
    }

    const existing = await getTableById(id);
    if (!existing) {
      return errorResponse(res, 404, "Mesa no encontrada");
    }

    const { zone_id, table_number, capacity, status, is_active } = req.body;

    const updated = await updateTable(id, {
      zone_id,
      table_number,
      capacity,
      status,
      is_active,
    });

    if (!updated) {
      return errorResponse(res, 404, "Mesa no encontrada");
    }

    return successResponse(res, "Mesa actualizada correctamente", { table: updated });
  } catch (err) {
    if (err.message.includes("ya existe")) {
      return errorResponse(res, 409, err.message);
    }

    if (err.message.includes("requerido") || err.message.includes("válido")) {
      return errorResponse(res, 400, err.message);
    }

    if (err.code === "23503") {
      return errorResponse(res, 400, "La zona especificada no existe");
    }

    console.error("Error en editTable:", err);
    next(err);
  }
};

export const patchTable = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return errorResponse(res, 400, "ID de mesa inválido");
    }

    const existing = await getTableById(id);
    if (!existing) {
      return errorResponse(res, 404, "Mesa no encontrada");
    }

    const updated = await updateTablePartial(id, req.body);
    if (!updated) {
      return errorResponse(res, 400, "No se pudo actualizar la mesa");
    }

    return successResponse(res, "Mesa actualizada parcialmente", { table: updated });
  } catch (err) {
    if (err.message.includes("campo") || err.message.includes("válido")) {
      return errorResponse(res, 400, err.message);
    }

    if (err.code === "23503") {
      return errorResponse(res, 400, "La zona especificada no existe");
    }

    console.error("Error en patchTable:", err);
    next(err);
  }
};

export const removeTable = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return errorResponse(res, 400, "ID de mesa inválido");
    }

    const table = await getTableById(id);
    if (!table) {
      return errorResponse(res, 404, "Mesa no encontrada");
    }

    const result = await deleteTable(id);
    return successResponse(res, result.message);
  } catch (err) {
    console.error("Error en removeTable:", err);
    next(err);
  }
};

// ============================================================
// MESAS POR ZONA
// ============================================================

export const getTablesByZoneId = async (req, res, next) => {
  try {
    const zoneId = Number(req.params.zoneId);
    if (isNaN(zoneId) || zoneId <= 0) {
      return errorResponse(res, 400, "ID de zona inválido");
    }

    const tables = await getTablesByZone(zoneId);
    if (tables.length === 0) {
      return successResponse(res, "No hay mesas en esta zona", { tables: [] });
    }

    return successResponse(res, "Mesas de la zona obtenidas correctamente", { tables });
  } catch (err) {
    console.error("Error en getTablesByZoneId:", err);
    next(err);
  }
};

export const getAvailableTablesByZoneId = async (req, res, next) => {
  try {
    const zoneId = Number(req.params.zoneId);
    if (isNaN(zoneId) || zoneId <= 0) {
      return errorResponse(res, 400, "ID de zona inválido");
    }

    const tables = await getAvailableTablesByZone(zoneId);
    if (tables.length === 0) {
      return successResponse(res, "No hay mesas disponibles en esta zona", { tables: [] });
    }

    return successResponse(res, "Mesas disponibles obtenidas correctamente", { tables });
  } catch (err) {
    console.error("Error en getAvailableTablesByZoneId:", err);
    next(err);
  }
};

// ============================================================
// MESAS POR ESTADO
// ============================================================

export const getTablesByStatusQuery = async (req, res, next) => {
  try {
    const { status } = req.query;

    if (!status) {
      return errorResponse(res, 400, "El estado es requerido como parámetro de consulta");
    }

    if (!["available", "occupied", "reserved"].includes(status)) {
      return errorResponse(res, 400, "Estado inválido. Debe ser: available, occupied o reserved");
    }

    const tables = await getTablesByStatus(status);
    return successResponse(res, `Mesas con estado '${status}' obtenidas correctamente`, { tables });
  } catch (err) {
    console.error("Error en getTablesByStatusQuery:", err);
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return errorResponse(res, 400, "ID de mesa inválido");
    }

    const existing = await getTableById(id);
    if (!existing) {
      return errorResponse(res, 404, "Mesa no encontrada");
    }

    const { status } = req.body;

    if (!status || !["available", "occupied", "reserved"].includes(status)) {
      return errorResponse(res, 400, "Estado inválido. Debe ser: available, occupied o reserved");
    }

    const updated = await updateTableStatus(id, status);
    if (!updated) {
      return errorResponse(res, 400, "No se pudo actualizar el estado de la mesa");
    }

    return successResponse(res, "Estado de mesa actualizado correctamente", { table: updated });
  } catch (err) {
    console.error("Error en updateStatus:", err);
    next(err);
  }
};
