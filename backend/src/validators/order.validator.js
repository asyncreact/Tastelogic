// src/validators/order.validator.js

import { z } from "zod";

/* Esquema para items del pedido (unit_price y subtotal se calculan en backend) */
const orderItemSchema = z.object({
  menu_item_id: z.preprocess(
    (val) => {
      if (val === "" || val == null) {
        return val;
      }
      return Number(val);
    },
    z
      .number({
        required_error: "El ID del item del menú es obligatorio",
        invalid_type_error: "El ID del item del menú debe ser numérico",
      })
      .int("El ID del item del menú debe ser un número entero")
      .positive("El ID del item del menú debe ser positivo")
  ),
  quantity: z.preprocess(
    (val) => {
      if (val === "" || val == null) {
        return val;
      }
      return Number(val);
    },
    z
      .number({
        required_error: "La cantidad es obligatoria",
        invalid_type_error: "La cantidad debe ser numérica",
      })
      .int("La cantidad debe ser un número entero")
      .min(1, "La cantidad mínima es 1")
      .max(100, "La cantidad máxima es 100")
  ),
  special_notes: z
    .string({
      invalid_type_error: "Las notas especiales deben ser texto",
    })
    .trim()
    .max(500, "Las notas especiales no deben superar los 500 caracteres")
    .optional()
    .nullable(),
});

/* Esquema para crear un pedido */
export const orderCreateSchema = z.object({
  user_id: z.preprocess(
    (val) => {
      if (val === "" || val == null) {
        return val;
      }
      return Number(val);
    },
    z
      .number({
        invalid_type_error: "El ID de usuario debe ser numérico",
      })
      .int("El ID de usuario debe ser un número entero")
      .positive("El ID de usuario debe ser positivo")
      .optional()
  ),
  reservation_id: z.preprocess(
    (val) => {
      if (val === "" || val == null) {
        return null;
      }
      return Number(val);
    },
    z
      .number({
        invalid_type_error: "El ID de reserva debe ser numérico",
      })
      .int("El ID de reserva debe ser un número entero")
      .positive("El ID de reserva debe ser positivo")
      .optional()
      .nullable()
  ),
  table_id: z.preprocess(
    (val) => {
      if (val === "" || val == null) {
        return null;
      }
      return Number(val);
    },
    z
      .number({
        invalid_type_error: "El ID de mesa debe ser numérico",
      })
      .int("El ID de mesa debe ser un número entero")
      .positive("El ID de mesa debe ser positivo")
      .optional()
      .nullable()
  ),
  order_type: z.enum(["dine-in", "takeout", "delivery"], {
    errorMap: () => ({
      message: "El tipo de pedido debe ser: dine-in, takeout o delivery",
    }),
  }),
  status: z
    .enum(
      ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"],
      {
        errorMap: () => ({
          message:
            "El estado debe ser: pending, confirmed, preparing, ready, completed o cancelled",
        }),
      }
    )
    .optional(),
  payment_method: z
    .enum(["cash", "card", "transfer", "mobile"], {
      errorMap: () => ({
        message: "El método de pago debe ser: cash, card, transfer o mobile",
      }),
    })
    .optional()
    .nullable(),
  payment_status: z
    .enum(["pending", "paid", "refunded"], {
      errorMap: () => ({
        message: "El estado de pago debe ser: pending, paid o refunded",
      }),
    })
    .optional(),
  special_instructions: z
    .string({
      invalid_type_error: "Las instrucciones especiales deben ser texto",
    })
    .trim()
    .max(500, "Las instrucciones especiales no deben superar los 500 caracteres")
    .optional()
    .nullable(),
  items: z
    .array(orderItemSchema, {
      required_error: "Los items del pedido son obligatorios",
      invalid_type_error: "Los items deben ser un array",
    })
    .min(1, "Debes agregar al menos un item al pedido")
    .max(50, "No puedes agregar más de 50 items en un pedido"),
});

/* Esquema para actualizar un pedido */
export const orderUpdateSchema = z.object({
  user_id: z.preprocess(
    (val) => {
      if (val === "" || val == null) {
        return undefined;
      }
      return Number(val);
    },
    z
      .number({
        invalid_type_error: "El ID de usuario debe ser numérico",
      })
      .int("El ID de usuario debe ser un número entero")
      .positive("El ID de usuario debe ser positivo")
      .optional()
  ),
  table_id: z.preprocess(
    (val) => {
      if (val === "" || val == null) {
        return undefined;
      }
      return Number(val);
    },
    z
      .number({
        invalid_type_error: "El ID de mesa debe ser numérico",
      })
      .int("El ID de mesa debe ser un número entero")
      .positive("El ID de mesa debe ser positivo")
      .optional()
  ),
  order_type: z
    .enum(["dine-in", "takeout", "delivery"], {
      errorMap: () => ({
        message: "El tipo de pedido debe ser: dine-in, takeout o delivery",
      }),
    })
    .optional(),
  status: z
    .enum(
      ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"],
      {
        errorMap: () => ({
          message:
            "El estado debe ser: pending, confirmed, preparing, ready, completed o cancelled",
        }),
      }
    )
    .optional(),
  payment_method: z
    .enum(["cash", "card", "transfer", "mobile"], {
      errorMap: () => ({
        message: "El método de pago debe ser: cash, card, transfer o mobile",
      }),
    })
    .optional()
    .nullable(),
  payment_status: z
    .enum(["pending", "paid", "refunded"], {
      errorMap: () => ({
        message: "El estado de pago debe ser: pending, paid o refunded",
      }),
    })
    .optional(),
  special_instructions: z
    .string({
      invalid_type_error: "Las instrucciones especiales deben ser texto",
    })
    .trim()
    .max(500, "Las instrucciones especiales no deben superar los 500 caracteres")
    .optional()
    .nullable(),
});

/* Esquema para actualizar solo el estado de un pedido */
export const orderStatusSchema = z.object({
  status: z.enum(
    ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"],
    {
      errorMap: () => ({
        message:
          "El estado debe ser: pending, confirmed, preparing, ready, completed o cancelled",
      }),
    }
  ),
});

/* Esquema para actualizar solo el estado de pago */
export const orderPaymentStatusSchema = z.object({
  payment_status: z.enum(["pending", "paid", "refunded"], {
    errorMap: () => ({
      message: "El estado de pago debe ser: pending, paid o refunded",
    }),
  }),
});

/* Esquema para filtros de pedidos */
export const orderFiltersSchema = z.object({
  user_id: z.preprocess(
    (val) => {
      if (val === "" || val == null) {
        return undefined;
      }
      return Number(val);
    },
    z
      .number({
        invalid_type_error: "El ID de usuario debe ser numérico",
      })
      .int("El ID de usuario debe ser un número entero")
      .positive("El ID de usuario debe ser positivo")
      .optional()
  ),
  table_id: z.preprocess(
    (val) => {
      if (val === "" || val == null) {
        return undefined;
      }
      return Number(val);
    },
    z
      .number({
        invalid_type_error: "El ID de mesa debe ser numérico",
      })
      .int("El ID de mesa debe ser un número entero")
      .positive("El ID de mesa debe ser positivo")
      .optional()
  ),
  order_type: z
    .enum(["dine-in", "takeout", "delivery"], {
      errorMap: () => ({
        message: "El tipo de pedido debe ser: dine-in, takeout o delivery",
      }),
    })
    .optional(),
  status: z
    .enum(
      ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"],
      {
        errorMap: () => ({
          message:
            "El estado debe ser: pending, confirmed, preparing, ready, completed o cancelled",
        }),
      }
    )
    .optional(),
  payment_status: z
    .enum(["pending", "paid", "refunded"], {
      errorMap: () => ({
        message: "El estado de pago debe ser: pending, paid o refunded",
      }),
    })
    .optional(),
  order_date: z
    .string({
      invalid_type_error: "La fecha del pedido debe ser texto",
    })
    .trim()
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      "La fecha del pedido debe ser válida (YYYY-MM-DD)"
    )
    .optional(),
});

/* Funciones de validación puras */
export const validateCreate = (data) => orderCreateSchema.parse(data);
export const validateUpdate = (data) => orderUpdateSchema.parse(data);
export const validateStatusUpdate = (data) => orderStatusSchema.parse(data);
export const validatePaymentStatusUpdate = (data) =>
  orderPaymentStatusSchema.parse(data);
export const validateFilters = (data) => orderFiltersSchema.parse(data);

/* Middlewares de validación */

/* Middleware para validar datos al crear un pedido */
export const validateOrderCreate = (req, res, next) => {
  try {
    req.body = validateCreate(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

/* Middleware para validar datos al actualizar un pedido */
export const validateOrderUpdate = (req, res, next) => {
  try {
    req.body = validateUpdate(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

/* Middleware para validar el cambio de estado de un pedido */
export const validateOrderStatusUpdate = (req, res, next) => {
  try {
    req.body = validateStatusUpdate(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

/* Middleware para validar el cambio de estado de pago de un pedido */
export const validateOrderPaymentStatusUpdate = (req, res, next) => {
  try {
    req.body = validatePaymentStatusUpdate(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

/* Middleware para validar los filtros usados al listar pedidos */
export const validateOrderFilters = (req, res, next) => {
  try {
    validateFilters(req.query);
    next();
  } catch (error) {
    next(error);
  }
};
