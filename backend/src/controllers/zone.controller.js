// src/controllers/zone.controller.js

import {
  getAllZones,
  getZoneById,
  getActiveZones,
  createZone,
  updateZone,
  updateZonePartial,
  deleteZone,
} from "../repositories/zone.repository.js";
import { deleteImage } from "../config/multer.js";
import { successResponse, errorResponse } from "../utils/response.js";

// ============================================================
// ZONAS
// ============================================================

export const getZones = async (req, res, next) => {
  try {
    const zones = await getAllZones();
    return successResponse(res, "Zonas obtenidas correctamente", { zones });
  } catch (err) {
    console.error("Error en getZones:", err);
    next(err);
  }
};

export const getActiveZonesController = async (req, res, next) => {
  try {
    const zones = await getActiveZones();
    return successResponse(res, "Zonas activas obtenidas correctamente", { zones });
  } catch (err) {
    console.error("Error en getActiveZonesController:", err);
    next(err);
  }
};

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
    console.error("Error en getZone:", err);
    next(err);
  }
};

export const addZone = async (req, res, next) => {
  try {
    const { name, description = null, is_active = true } = req.body;
    let image_url = null;

    if (req.file) {
      image_url = `/uploads/zones/${req.file.filename}`;
    }

    const newZone = await createZone({
      name,
      description,
      image_url,
      is_active,
    });

    return successResponse(
      res,
      "Zona creada correctamente",
      { zone: newZone },
      201
    );
  } catch (err) {
    if (req.file) {
      deleteImage(`/uploads/zones/${req.file.filename}`);
    }

    if (err.message === "El nombre de la zona ya existe") {
      return errorResponse(res, 409, err.message);
    }

    if (err.message.includes("requerido") || err.message.includes("válido")) {
      return errorResponse(res, 400, err.message);
    }

    console.error("Error en addZone:", err);
    next(err);
  }
};

export const editZone = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return errorResponse(res, 400, "ID de zona inválido");
    }

    const existing = await getZoneById(id);
    if (!existing) {
      return errorResponse(res, 404, "Zona no encontrada");
    }

    const { name, description, is_active } = req.body;
    let image_url = existing.image_url;

    if (req.file) {
      image_url = `/uploads/zones/${req.file.filename}`;
      if (existing.image_url) {
        deleteImage(existing.image_url);
      }
    }

    const updated = await updateZone(id, {
      name,
      description,
      image_url,
      is_active,
    });

    if (!updated) {
      if (req.file) {
        deleteImage(image_url);
      }
      return errorResponse(res, 404, "Zona no encontrada");
    }

    return successResponse(res, "Zona actualizada correctamente", { zone: updated });
  } catch (err) {
    if (req.file) {
      deleteImage(`/uploads/zones/${req.file.filename}`);
    }

    if (err.message === "El nombre de la zona ya existe") {
      return errorResponse(res, 409, err.message);
    }

    if (err.message.includes("requerido") || err.message.includes("válido")) {
      return errorResponse(res, 400, err.message);
    }

    console.error("Error en editZone:", err);
    next(err);
  }
};

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

    const data = { ...req.body };

    if (req.file) {
      data.image_url = `/uploads/zones/${req.file.filename}`;
      if (existing.image_url) {
        deleteImage(existing.image_url);
      }
    }

    const updated = await updateZonePartial(id, data);
    if (!updated) {
      if (req.file) {
        deleteImage(data.image_url);
      }
      return errorResponse(res, 400, "No se pudo actualizar la zona");
    }

    return successResponse(res, "Zona actualizada parcialmente", { zone: updated });
  } catch (err) {
    if (req.file) {
      deleteImage(`/uploads/zones/${req.file.filename}`);
    }

    if (err.message === "El nombre de la zona ya existe") {
      return errorResponse(res, 409, err.message);
    }

    if (err.message.includes("campo") || err.message.includes("válido")) {
      return errorResponse(res, 400, err.message);
    }

    console.error("Error en patchZone:", err);
    next(err);
  }
};

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

    if (zone.image_url) {
      deleteImage(zone.image_url);
    }

    const result = await deleteZone(id);
    return successResponse(res, result.message);
  } catch (err) {
    console.error("Error en removeZone:", err);
    next(err);
  }
};

// ============================================================
// SUBIDA DE IMÁGENES
// ============================================================

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, "No se proporcionó ninguna imagen");
    }

    const imageUrl = `/uploads/zones/${req.file.filename}`;
    return successResponse(res, "Imagen subida exitosamente", {
      url: imageUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    if (req.file) {
      deleteImage(`/uploads/zones/${req.file.filename}`);
    }
    console.error("Error al subir imagen de zona:", error);
    next(error);
  }
};
