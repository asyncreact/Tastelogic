// src/validators/zone.validator.js

import { z } from "zod";

// ============================================================
// ESQUEMAS DE VALIDACIÓN
// ============================================================

/**
 * Esquema para crear/editar zona
 */
export const zoneSchema = z.object({
  name: z
    .string({
      required_error: "El nombre de la zona es obligatorio",
      invalid_type_error: "El nombre de la zona debe ser texto",
    })
    .trim()
    .min(2, "El nombre de la zona debe tener al menos 2 caracteres")
    .max(100, "El nombre de la zona no debe superar los 100 caracteres"),
  description: z
    .string({
      invalid_type_error: "La descripción debe ser texto",
    })
    .trim()
    .max(255, "La descripción no debe superar los 255 caracteres")
    .optional()
    .nullable(),
  image_url: z
    .string({
      invalid_type_error: "La imagen debe ser texto o URL",
    })
    .trim()
    .optional()
    .nullable()
    .refine(
      (url) =>
        !url || url === "" || /^https?:\/\/[^\s]+$/i.test(url) || url.startsWith("/uploads"),
      "Debe ser una URL válida o dejarse vacío"
    ),
  is_active: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        return val.toLowerCase() === "true";
      }
      return val;
    },
    z.boolean({
      invalid_type_error: "El estado activo debe ser booleano",
    })
  ).optional(),
});

// ============================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================

/**
 * Validar zona completa
 */
export const validateZone = (data) => zoneSchema.parse(data);

/**
 * Validar zona parcial (para PATCH)
 */
export const validatePartialZone = (data) =>
  zoneSchema.partial().parse(data);

// ============================================================
// MIDDLEWARES DE VALIDACIÓN
// ============================================================

/**
 * Middleware para validar zona completa (POST/PUT)
 */
export const validateZoneMiddleware = (req, res, next) => {
  try {
    req.body = validateZone(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para validar zona parcial (PATCH)
 */
export const validatePartialZoneMiddleware = (req, res, next) => {
  try {
    req.body = validatePartialZone(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
