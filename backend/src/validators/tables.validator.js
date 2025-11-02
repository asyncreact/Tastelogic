// src/validators/tables.validator.js

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

  location: z
    .string({
      invalid_type_error: "La ubicación debe ser texto",
    })
    .trim()
    .max(100, "La ubicación no debe superar los 100 caracteres")
    .optional()
    .nullable(),

  is_active: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        return val.toLowerCase() === "true";
      }
      return val;
    },
    z
      .boolean({
        invalid_type_error: "El estado activo debe ser booleano",
      })
      .optional()
  ),
});

/**
 * Esquema para crear/editar mesa
 */
export const tableSchema = z.object({
  zone_id: z
    .preprocess(
      (val) => (val === "" || val == null ? null : Number(val)),
      z
        .number({
          invalid_type_error: "El ID de la zona debe ser numérico",
        })
        .int("El ID de la zona debe ser un número entero")
        .nullable()
        .optional()
    ),

  table_number: z
    .preprocess(
      (val) => (val === "" || val == null ? undefined : Number(val)),
      z
        .number({
          required_error: "El número de mesa es obligatorio",
          invalid_type_error: "El número de mesa debe ser numérico",
        })
        .int("El número de mesa debe ser un número entero")
        .positive("El número de mesa debe ser mayor que 0")
        .max(999, "El número de mesa no debe superar 999")
    ),

  capacity: z
    .preprocess(
      (val) => (val === "" || val == null ? undefined : Number(val)),
      z
        .number({
          required_error: "La capacidad es obligatoria",
          invalid_type_error: "La capacidad debe ser numérica",
        })
        .int("La capacidad debe ser un número entero")
        .min(1, "La capacidad mínima es 1 persona")
        .max(20, "La capacidad máxima es 20 personas")
    ),

  status: z
    .enum(["available", "occupied", "reserved", "maintenance"])
    .optional()
    .default("available"),

  is_active: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        return val.toLowerCase() === "true";
      }
      return val;
    },
    z
      .boolean({
        invalid_type_error: "El estado activo debe ser booleano",
      })
      .optional()
  ),
});

// ============================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================

/**
 * Validar zona completa
 */
export const validateZone = (data) => zoneSchema.parse(data);

/**
 * Validar tabla completa
 */
export const validateTable = (data) => tableSchema.parse(data);

/**
 * Validar zona parcial (para PATCH)
 */
export const validatePartialZone = (data) =>
  zoneSchema.partial().parse(data);

/**
 * Validar tabla parcial (para PATCH)
 */
export const validatePartialTable = (data) =>
  tableSchema.partial().parse(data);

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
 * Middleware para validar tabla completa (POST/PUT)
 */
export const validateTableMiddleware = (req, res, next) => {
  try {
    req.body = validateTable(req.body);
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

/**
 * Middleware para validar tabla parcial (PATCH)
 */
export const validatePartialTableMiddleware = (req, res, next) => {
  try {
    req.body = validatePartialTable(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
