// src/controllers/tables.controller.js

import {
  // 🔹 Zonas
  getAllZones,
  getZoneById,
  createZone,
  updateZone,
  updateZonePartial,
  deleteZone,
  // 🔹 Mesas
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  updateTablePartial,
  deleteTable,
} from "../repositories/tables.repository.js";
import { successResponse, errorResponse } from "../utils/response.js";

// ============================================================
// 🧩 CONTROLADOR DE MESAS Y ZONAS
// ============================================================

// =============================
// 🗂️ ZONAS DEL RESTAURANTE
// =============================

/**
 * Obtiene todas las zonas
 * @route GET /api/tables/zones
 */
export const getZones = async (req, res, next) => {
  try {
    const zones = await getAllZones();
    return successResponse(res, "Zonas obtenidas correctamente", { zones });
  } catch (err) {
    console.error("❌ Error en getZones:", err);
    next(err);
  }
};

/**
 * Obtiene una zona por ID
 * @route GET /api/tables/zones/:id
 */
export const getZone = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return errorResponse(res, 400, "ID de zona inválido");
    }

    const zone = await getZoneById(id);
    if (!zone) {
      return errorResponse(res, 404, "Zona no encontrada");
    }

    return successResponse(res, "Zona obtenida correctamente", { zone });
  } catch (err) {
    console.error("❌ Error en getZone:", err);
    next(err);
  }
};

/**
 * Crea una nueva zona
 * @route POST /api/tables/zones
 */
export const addZone = async (req, res, next) => {
  try {
    const newZone = await createZone(req.body);
    return successResponse(
      res,
      "Zona creada correctamente",
      { zone: newZone },
      201
    );
  } catch (err) {
    if (err.message === "El nombre de la zona ya existe") {
      return errorResponse(res, 409, err.message);
    }
    if (err.message.includes("requerido") || err.message.includes("válido")) {
      return errorResponse(res, 400, err.message);
    }
    console.error("❌ Error en addZone:", err);
    next(err);
  }
};

/**
 * Actualiza completamente una zona (PUT)
 * @route PUT /api/tables/zones/:id
 */
export const editZone = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return errorResponse(res, 400, "ID de zona inválido");
    }

    const updated = await updateZone(id, req.body);
    if (!updated) {
      return errorResponse(res, 404, "Zona no encontrada");
    }

    return successResponse(res, "Zona actualizada correctamente", { zone: updated });
  } catch (err) {
    if (err.message === "El nombre de la zona ya existe") {
      return errorResponse(res, 409, err.message);
    }
    if (err.message.includes("requerido") || err.message.includes("válido")) {
      return errorResponse(res, 400, err.message);
    }
    console.error("❌ Error en editZone:", err);
    next(err);
  }
};

/**
 * Actualiza parcialmente una zona (PATCH)
 * @route PATCH /api/tables/zones/:id
 */
export const patchZone = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return errorResponse(res, 400, "ID de zona inválido");
    }

    const existing = await getZoneById(id);
    if (!existing) {
      return errorResponse(res, 404, "Zona no encontrada");
    }

    const updated = await updateZonePartial(id, req.body);
    if (!updated) {
      return errorResponse(res, 400, "No se pudo actualizar la zona");
    }

    return successResponse(res, "Zona actualizada parcialmente", { zone: updated });
  } catch (err) {
    if (err.message === "El nombre de la zona ya existe") {
      return errorResponse(res, 409, err.message);
    }
    if (err.message.includes("campo") || err.message.includes("válido")) {
      return errorResponse(res, 400, err.message);
    }
    console.error("❌ Error en patchZone:", err);
    next(err);
  }
};

/**
 * Elimina una zona y sus mesas asociadas
 * @route DELETE /api/tables/zones/:id
 */
export const removeZone = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return errorResponse(res, 400, "ID de zona inválido");
    }

    const zone = await getZoneById(id);
    if (!zone) {
      return errorResponse(res, 404, "Zona no encontrada");
    }

    const result = await deleteZone(id);
    return successResponse(res, result.message);
  } catch (err) {
    console.error("❌ Error en removeZone:", err);
    next(err);
  }
};

// =============================
// 🪑 MESAS DEL RESTAURANTE
// =============================

/**
 * Obtiene todas las mesas
 * @route GET /api/tables
 */
export const getTables = async (req, res, next) => {
  try {
    const tables = await getAllTables();
    return successResponse(res, "Mesas obtenidas correctamente", { tables });
  } catch (err) {
    console.error("❌ Error en getTables:", err);
    next(err);
  }
};

/**
 * Obtiene una mesa por ID
 * @route GET /api/tables/:id
 */
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
    console.error("❌ Error en getTable:", err);
    next(err);
  }
};

/**
 * Crea una nueva mesa
 * @route POST /api/tables
 */
export const addTable = async (req, res, next) => {
  try {
    // Si hay zone_id, verificar que la zona existe
    if (req.body.zone_id) {
      const zoneExists = await getZoneById(req.body.zone_id);
      if (!zoneExists) {
        return errorResponse(res, 400, "La zona especificada no existe");
      }
    }

    const newTable = await createTable(req.body);
    return successResponse(
      res,
      "Mesa creada correctamente",
      { table: newTable },
      201
    );
  } catch (err) {
    if (err.message.includes("requerido") || err.message.includes("válido") || err.message.includes("inválido")) {
      return errorResponse(res, 400, err.message);
    }
    if (err.code === "23503") {
      return errorResponse(res, 400, "La zona especificada no existe");
    }
    if (err.code === "23505") {
      return errorResponse(res, 409, "El número de mesa ya existe en esta zona");
    }
    console.error("❌ Error en addTable:", err);
    next(err);
  }
};

/**
 * Actualiza completamente una mesa (PUT)
 * @route PUT /api/tables/:id
 */
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

    // Si hay zone_id, verificar que la zona existe
    if (req.body.zone_id) {
      const zoneExists = await getZoneById(req.body.zone_id);
      if (!zoneExists) {
        return errorResponse(res, 400, "La zona especificada no existe");
      }
    }

    const updated = await updateTable(id, req.body);
    return successResponse(res, "Mesa actualizada correctamente", { table: updated });
  } catch (err) {
    if (err.message.includes("requerido") || err.message.includes("válido") || err.message.includes("inválido")) {
      return errorResponse(res, 400, err.message);
    }
    if (err.code === "23503") {
      return errorResponse(res, 400, "La zona especificada no existe");
    }
    if (err.code === "23505") {
      return errorResponse(res, 409, "El número de mesa ya existe en esta zona");
    }
    console.error("❌ Error en editTable:", err);
    next(err);
  }
};

/**
 * Actualiza parcialmente una mesa (PATCH)
 * @route PATCH /api/tables/:id
 */
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

    // Si hay zone_id, verificar que la zona existe
    if (req.body.zone_id) {
      const zoneExists = await getZoneById(req.body.zone_id);
      if (!zoneExists) {
        return errorResponse(res, 400, "La zona especificada no existe");
      }
    }

    const updated = await updateTablePartial(id, req.body);
    if (!updated) {
      return errorResponse(res, 400, "No se pudo actualizar la mesa");
    }

    return successResponse(res, "Mesa actualizada parcialmente", { table: updated });
  } catch (err) {
    if (err.message.includes("campo") || err.message.includes("válido") || err.message.includes("inválido")) {
      return errorResponse(res, 400, err.message);
    }
    if (err.code === "23503") {
      return errorResponse(res, 400, "La zona especificada no existe");
    }
    if (err.code === "23505") {
      return errorResponse(res, 409, "El número de mesa ya existe en esta zona");
    }
    console.error("❌ Error en patchTable:", err);
    next(err);
  }
};

/**
 * Elimina una mesa
 * @route DELETE /api/tables/:id
 */
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
    console.error("❌ Error en removeTable:", err);
    next(err);
  }
};
