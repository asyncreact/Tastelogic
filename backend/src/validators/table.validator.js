// src/validators/table.validator.js

import { z } from "zod";

// Esquema para crear una mesa
export const tableCreateSchema = z.object({
  zone_id: z
    .preprocess(
      (val) => {
        if (val === "" || val == null) {
          return val;
        }
        return Number(val);
      },
      z
        .number({
          invalid_type_error: "El ID de la zona debe ser numérico",
        })
        .int("El ID de la zona debe ser un número entero")
        .positive("El ID de la zona debe ser positivo")
    ),
  table_number: z
    .string({
      invalid_type_error: "El número de mesa debe ser texto",
    })
    .trim()
    .min(1, "El número de mesa no puede estar vacío")
    .max(50, "El número de mesa no debe superar los 50 caracteres")
    .optional(),
  capacity: z.preprocess(
    (val) => {
      if (val === "" || val == null) {
        return undefined;
      }
      return Number(val);
    },
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
    .enum(["available", "reserved"], {
      errorMap: () => ({
        message: "El estado debe ser: available o reserved",
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

// Esquema para actualizar una mesa (todos los campos opcionales)
export const tableUpdateSchema = tableCreateSchema.partial();

// Función para validar creación
export const validateCreate = (data) => tableCreateSchema.parse(data);

// Función para validar actualización
export const validateUpdate = (data) => tableUpdateSchema.parse(data);

// Middleware para validar creación de mesa
export const validateTableCreate = (req, res, next) => {
  try {
    req.body = validateCreate(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware para validar actualización de mesa
export const validateTableUpdate = (req, res, next) => {
  try {
    req.body = validateUpdate(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
