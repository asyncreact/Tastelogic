// src/validators/menu.validator.js

import { z } from "zod";

/* ESQUEMAS DE VALIDACIÓN */

/* Schema para categoría */
export const categorySchema = z.object({
  name: z
    .string({
      required_error: "El nombre de la categoría es obligatorio",
      invalid_type_error: "El nombre de la categoría debe ser texto",
    })
    .trim()
    .min(2, "El nombre de la categoría debe tener al menos 2 caracteres")
    .max(100, "El nombre de la categoría no debe superar los 100 caracteres"),
  description: z
    .string({
      invalid_type_error: "La descripción debe ser texto",
    })
    .trim()
    .max(255, "La descripción no debe superar los 255 caracteres")
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

/* Schema para item del menú */
export const itemSchema = z.object({
  category_id: z
    .preprocess(
      (val) => (val === "" || val == null ? null : Number(val)),
      z
        .number({
          invalid_type_error: "El ID de la categoría debe ser numérico",
        })
        .int("El ID de la categoría debe ser un número entero")
        .nullable()
        .optional()
    ),
  name: z
    .string({
      required_error: "El nombre del plato es obligatorio",
      invalid_type_error: "El nombre debe ser texto",
    })
    .trim()
    .min(2, "El nombre del plato debe tener al menos 2 caracteres")
    .max(150, "El nombre del plato no debe superar los 150 caracteres"),
  description: z
    .string({
      invalid_type_error: "La descripción debe ser texto",
    })
    .trim()
    .max(500, "La descripción no debe superar los 500 caracteres")
    .optional()
    .nullable(),
  ingredients: z
    .string({
      invalid_type_error: "Los ingredientes deben ser texto",
    })
    .trim()
    .max(500, "El campo 'ingredientes' no debe superar los 500 caracteres")
    .optional()
    .nullable(),
  price: z.preprocess(
    (val) => (val === "" || val == null ? undefined : Number(val)),
    z
      .number({
        required_error: "El precio es obligatorio",
        invalid_type_error: "El precio debe ser numérico",
      })
      .nonnegative("El precio no puede ser negativo")
      .refine((val) => val >= 0.01, {
        message: "El precio mínimo permitido es 0.01",
      })
  ),
  image_url: z
    .string({
      invalid_type_error: "La imagen debe ser texto o URL",
    })
    .trim()
    .optional()
    .nullable()
    .refine(
      (url) => !url || url === "" || /^https?:\/\/[^\s]+$/i.test(url),
      "Debe ser una URL válida o dejarse vacío"
    ),
  estimated_prep_time: z.preprocess(
    (val) => (val === "" || val == null ? undefined : Number(val)),
    z
      .number({
        invalid_type_error: "El tiempo de preparación debe ser numérico",
      })
      .int("El tiempo de preparación debe ser un número entero")
      .min(5, "El tiempo mínimo es 5 minutos")
      .max(120, "El tiempo máximo es 120 minutos")
      .optional()
  ),
  is_available: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        return val.toLowerCase() === "true";
      }
      return val;
    },
    z
      .boolean({
        invalid_type_error: "El estado de disponibilidad debe ser booleano",
      })
      .optional()
  ),
});

/* FUNCIONES DE VALIDACIÓN */

/* Valida categoría completa o parcial según el método HTTP */
export const validateCategory = (data, isPartial = false) => {
  const schema = isPartial ? categorySchema.partial() : categorySchema;
  return schema.parse(data);
};

/* Valida item completo o parcial según el método HTTP */
export const validateItem = (data, isPartial = false) => {
  const schema = isPartial ? itemSchema.partial() : itemSchema;
  return schema.parse(data);
};

/* MIDDLEWARES DE VALIDACIÓN */

/* Middleware para validar categoría (completa o parcial según HTTP method) */
export const validateCategoryMiddleware = (req, res, next) => {
  try {
    const isPartial = req.method === "PATCH";
    req.body = validateCategory(req.body, isPartial);
    next();
  } catch (error) {
    next(error);
  }
};

/* ✅ Middleware mejorado para validar item */
export const validateItemMiddleware = (req, res, next) => {
  try {
    // ✅ PATCH y PUT con form-data se tratan como parciales
    // PUT con JSON sigue siendo completo
    const isPartial = req.method === "PATCH" || 
                     (req.method === "PUT" && req.is("multipart/form-data"));
    
    req.body = validateItem(req.body, isPartial);
    next();
  } catch (error) {
    next(error);
  }
};
