// src/controllers/zone.controller.js

import {
  getZones,
  getZoneById,
  createZone,
  updateZone,
  deleteZone,
} from "../repositories/zone.repository.js";

import { deleteImage } from "../config/multer.js";
import { successResponse, errorResponse } from "../utils/response.js";

/* ZONAS */

/* Obtiene todas las zonas con filtro opcional */
export const listZone = async (req, res, next) => {
  try {
    const filters = {};

    if (req.query.is_active !== undefined) {
      filters.is_active = req.query.is_active === "true";
    }

    const zones = await getZones(filters);
    return successResponse(res, "Zonas obtenidas correctamente", { zones });
  } catch (err) {
    console.error("Error en listZone:", err);
    next(err);
  }
};

/* Obtiene una zona específica por ID */
export const showZone = async (req, res, next) => {
  try {
    const zone_id = Number(req.params.zone_id);
    if (isNaN(zone_id) || zone_id <= 0) {
      return errorResponse(res, 400, "ID de zona inválido");
    }

    const zone = await getZoneById(zone_id);
    if (!zone) {
      return errorResponse(res, 404, "Zona no encontrada");
    }

    return successResponse(res, "Zona obtenida correctamente", { zone });
  } catch (err) {
    console.error("Error en showZone:", err);
    next(err);
  }
};

/* Crea una nueva zona */
export const addZone = async (req, res, next) => {
  try {
    const { name, description = null, is_active = true } = req.body;
    let image_url = null;

    if (req.file) {
      image_url = `/uploads/zones/${req.file.filename}`;
    }

    const new_zone = await createZone({
      name,
      description,
      image_url,
      is_active,
    });

    return successResponse(res, "Zona creada correctamente", { zone: new_zone }, 201);
  } catch (err) {
    if (req.file) {
      deleteImage(`uploads/zones/${req.file.filename}`);
    }

    if (err.message.includes("ya existe")) {
      return errorResponse(res, 409, err.message);
    }
    if (err.message.includes("requerido") || err.message.includes("válido")) {
      return errorResponse(res, 400, err.message);
    }

    console.error("Error en addZone:", err);
    next(err);
  }
};

/* Actualiza una zona (PUT o PATCH - completo o parcial) */
export const editZone = async (req, res, next) => {
  try {
    const zone_id = Number(req.params.zone_id);
    if (isNaN(zone_id) || zone_id <= 0) {
      return errorResponse(res, 400, "ID de zona inválido");
    }

    const existing = await getZoneById(zone_id);
    if (!existing) {
      return errorResponse(res, 404, "Zona no encontrada");
    }

    let image_url = existing.image_url;

    if (req.file) {
      image_url = `/uploads/zones/${req.file.filename}`;
      if (existing.image_url) {
        deleteImage(existing.image_url);
      }
    }

    const update_data = {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.description !== undefined && { description: req.body.description }),
      ...(req.file && { image_url }),
      ...(req.body.is_active !== undefined && { is_active: req.body.is_active }),
    };

    if (Object.keys(update_data).length === 0) {
      return errorResponse(res, 400, "No se proporcionaron campos para actualizar");
    }

    const updated = await updateZone(zone_id, update_data);
    if (!updated) {
      if (req.file) {
        deleteImage(image_url);
      }
      return errorResponse(res, 404, "Zona no encontrada");
    }

    return successResponse(res, "Zona actualizada correctamente", {
      zone: updated,
    });
  } catch (err) {
    if (req.file) {
      deleteImage(`uploads/zones/${req.file.filename}`);
    }

    if (err.message.includes("ya existe")) {
      return errorResponse(res, 409, err.message);
    }
    if (err.message.includes("requerido") || err.message.includes("válido")) {
      return errorResponse(res, 400, err.message);
    }

    console.error("Error en editZone:", err);
    next(err);
  }
};

/* Elimina una zona */
export const removeZone = async (req, res, next) => {
  try {
    const zone_id = Number(req.params.zone_id);
    if (isNaN(zone_id) || zone_id <= 0) {
      return errorResponse(res, 400, "ID de zona inválido");
    }

    const zone = await getZoneById(zone_id);
    if (!zone) {
      return errorResponse(res, 404, "Zona no encontrada");
    }

    if (zone.image_url) {
      deleteImage(zone.image_url);
    }

    const result = await deleteZone(zone_id);
    return successResponse(res, result.message);
  } catch (err) {
    console.error("Error en removeZone:", err);
    next(err);
  }
};
