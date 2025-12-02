// src/controllers/zone.controller.js

import {
  getZones,
  getZoneById,
  createZone,
  updateZone,
  deleteZone,
} from "../repositories/zone.repository.js";

import { deleteImage } from "../config/multer.js";
import { successResponse } from "../utils/response.js";

/* ZONAS */

/* Obtiene todas las zonas con filtro opcional de estado activo */
export const listZone = async (req, res, next) => {
  try {
    const filters = {};

    if (req.query.is_active !== undefined) {
      filters.is_active = req.query.is_active === "true";
    }

    const zones = await getZones(filters);
    return successResponse(res, "Zonas obtenidas correctamente", { zones });
  } catch (err) {
    next(err);
  }
};

/* Obtiene una zona específica por ID */
export const showZone = async (req, res, next) => {
  try {
    const zone_id = Number(req.params.zone_id);
    
    /* Valida que el ID de zona sea un número positivo */
    if (isNaN(zone_id) || zone_id <= 0) {
      const error = new Error("El ID de la zona debe ser un número válido");
      error.status = 400;
      throw error;
    }

    const zone = await getZoneById(zone_id);
    
    if (!zone) {
      const error = new Error("No encontramos la zona que buscas");
      error.status = 404;
      throw error;
    }

    return successResponse(res, "Zona obtenida correctamente", { zone });
  } catch (err) {
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
    /* Elimina la imagen subida si la creación falla */
    if (req.file) {
      deleteImage(`/uploads/zones/${req.file.filename}`);
    }
    next(err);
  }
};

/* Actualiza una zona (PUT o PATCH - completo o parcial) */
export const editZone = async (req, res, next) => {
  try {
    const zone_id = Number(req.params.zone_id);
    
    /* Valida el ID de zona antes de actualizar */
    if (isNaN(zone_id) || zone_id <= 0) {
      const error = new Error("El ID de la zona debe ser un número válido");
      error.status = 400;
      throw error;
    }

    const existing = await getZoneById(zone_id);
    
    if (!existing) {
      const error = new Error("No encontramos la zona que deseas actualizar");
      error.status = 404;
      throw error;
    }

    let image_url = existing.image_url;

    if (req.file) {
      image_url = `/uploads/zones/${req.file.filename}`;
      /* Elimina la imagen anterior si existe */
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
      const error = new Error("Debes proporcionar al menos un campo para actualizar");
      error.status = 400;
      throw error;
    }

    const updated = await updateZone(zone_id, update_data);
    
    if (!updated) {
      /* Limpia la nueva imagen si la actualización falla */
      if (req.file) {
        deleteImage(image_url);
      }
      const error = new Error("No se pudo actualizar la zona");
      error.status = 404;
      throw error;
    }

    return successResponse(res, "Zona actualizada correctamente", {
      zone: updated,
    });
  } catch (err) {
    /* Limpia imagen subida solo si no es error 404 (zona no existe) */
    if (req.file && err.status !== 404) {
      deleteImage(`/uploads/zones/${req.file.filename}`);
    }
    next(err);
  }
};

/* Elimina una zona */
export const removeZone = async (req, res, next) => {
  try {
    const zone_id = Number(req.params.zone_id);
    
    /* Valida el ID de zona antes de eliminar */
    if (isNaN(zone_id) || zone_id <= 0) {
      const error = new Error("El ID de la zona debe ser un número válido");
      error.status = 400;
      throw error;
    }

    const zone = await getZoneById(zone_id);
    
    if (!zone) {
      const error = new Error("No encontramos la zona que deseas eliminar");
      error.status = 404;
      throw error;
    }

    /* Elimina la imagen asociada si existe */
    if (zone.image_url) {
      deleteImage(zone.image_url);
    }

    const result = await deleteZone(zone_id);
    return successResponse(res, result.message);
  } catch (err) {
    next(err);
  }
};
