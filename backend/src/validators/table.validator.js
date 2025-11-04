// src/validators/table.validator.js

import { z } from "zod";

// ============================================================
// ESQUEMAS DE VALIDACIÓN
// ============================================================

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
    .string({
      required_error: "El número de mesa es obligatorio",
      invalid_type_error: "El número de mesa debe ser texto",
    })
    .trim()
    .min(1, "El número de mesa no puede estar vacío")
    .max(50, "El número de mesa no debe superar los 50 caracteres"),
  capacity: z.preprocess(
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
    .enum(["available", "occupied", "reserved"], {
      errorMap: () => ({
        message: "El estado debe ser: available, occupied o reserved",
      }),
    })
    .optional(),
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

/**
 * Esquema para actualizar SOLO el estado de la mesa
 */
export const tableStatusSchema = z.object({
  status: z.enum(["available", "occupied", "reserved"], {
    errorMap: () => ({
      message: "El estado debe ser: available, occupied o reserved",
    }),
  }),
});

// ============================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================

/**
 * Validar mesa completa
 */
export const validateTable = (data) => tableSchema.parse(data);

/**
 * Validar mesa parcial (para PATCH)
 */
export const validatePartialTable = (data) =>
  tableSchema.partial().parse(data);

/**
 * Validar estado de mesa
 */
export const validateTableStatus = (data) => {
  return tableStatusSchema.parse(data);
};

// ============================================================
// MIDDLEWARES DE VALIDACIÓN
// ============================================================

/**
 * Middleware para validar mesa completa (POST/PUT)
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
 * Middleware para validar mesa parcial (PATCH)
 */
export const validatePartialTableMiddleware = (req, res, next) => {
  try {
    req.body = validatePartialTable(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para validar estado de mesa
 */
export const validateTableStatusMiddleware = (req, res, next) => {
  try {
    req.body = validateTableStatus(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
