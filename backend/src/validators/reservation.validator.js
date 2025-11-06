// src/validators/reservation.validator.js

import { z } from "zod";

// Esquema para crear una reserva
export const reservationCreateSchema = z.object({
  user_id: z.preprocess(
    (val) => {
      if (val === "" || val == null) {
        return val;
      }
      return Number(val);
    },
    z
      .number({
        required_error: "El ID de usuario es obligatorio",
        invalid_type_error: "El ID de usuario debe ser numérico",
      })
      .int("El ID de usuario debe ser un número entero")
      .positive("El ID de usuario debe ser positivo")
  ),
  zone_id: z.preprocess(
    (val) => {
      if (val === "" || val == null) {
        return val;
      }
      return Number(val);
    },
    z
      .number({
        required_error: "El ID de zona es obligatorio",
        invalid_type_error: "El ID de zona debe ser numérico",
      })
      .int("El ID de zona debe ser un número entero")
      .positive("El ID de zona debe ser positivo")
  ),
  table_id: z.preprocess(
    (val) => {
      if (val === "" || val == null) {
        return val;
      }
      return Number(val);
    },
    z
      .number({
        required_error: "El ID de mesa es obligatorio",
        invalid_type_error: "El ID de mesa debe ser numérico",
      })
      .int("El ID de mesa debe ser un número entero")
      .positive("El ID de mesa debe ser positivo")
  ),
  reservation_date: z
    .string({
      required_error: "La fecha de reserva es obligatoria",
      invalid_type_error: "La fecha de reserva debe ser texto",
    })
    .trim()
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      "La fecha de reserva debe ser válida (YYYY-MM-DD)"
    )
    .refine(
      (val) => {
        const reservationDate = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return reservationDate >= today;
      },
      "La fecha de reserva no puede ser en el pasado"
    ),
  reservation_time: z
    .string({
      required_error: "La hora de reserva es obligatoria",
      invalid_type_error: "La hora de reserva debe ser texto",
    })
    .trim()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/,
      "La hora debe estar en formato HH:MM o HH:MM:SS"
    ),
  guest_count: z.preprocess(
    (val) => {
      if (val === "" || val == null) {
        return val;
      }
      return Number(val);
    },
    z
      .number({
        required_error: "La cantidad de huéspedes es obligatoria",
        invalid_type_error: "La cantidad de huéspedes debe ser numérica",
      })
      .int("La cantidad de huéspedes debe ser un número entero")
      .min(1, "La cantidad mínima de huéspedes es 1")
      .max(50, "La cantidad máxima de huéspedes es 50")
  ),
  status: z
    .enum(["pending", "confirmed", "completed", "cancelled"], {
      errorMap: () => ({
        message: "El estado debe ser: pending, confirmed, completed o cancelled",
      }),
    })
    .optional(),
  special_requirements: z
    .string({
      invalid_type_error: "Los requerimientos especiales deben ser texto",
    })
    .trim()
    .max(500, "Los requerimientos especiales no deben superar los 500 caracteres")
    .optional()
    .nullable(),
});

// Esquema para actualizar una reserva (todos los campos opcionales)
export const reservationUpdateSchema = reservationCreateSchema.partial();

// Esquema para actualizar solo el estado de una reserva
export const reservationStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"], {
    errorMap: () => ({
      message: "El estado debe ser: pending, confirmed, completed o cancelled",
    }),
  }),
});

// Esquema para verificar disponibilidad
export const checkAvailabilitySchema = z.object({
  table_id: z.preprocess(
    (val) => {
      if (val === "" || val == null) {
        return val;
      }
      return Number(val);
    },
    z
      .number({
        required_error: "El ID de mesa es obligatorio",
        invalid_type_error: "El ID de mesa debe ser numérico",
      })
      .int("El ID de mesa debe ser un número entero")
      .positive("El ID de mesa debe ser positivo")
  ),
  reservation_date: z
    .string({
      required_error: "La fecha de reserva es obligatoria",
      invalid_type_error: "La fecha de reserva debe ser texto",
    })
    .trim()
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      "La fecha de reserva debe ser válida (YYYY-MM-DD)"
    ),
  reservation_time: z
    .string({
      required_error: "La hora de reserva es obligatoria",
      invalid_type_error: "La hora de reserva debe ser texto",
    })
    .trim()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/,
      "La hora debe estar en formato HH:MM o HH:MM:SS"
    ),
});

// Esquema para filtrar reservas
export const reservationFiltersSchema = z.object({
  user_id: z
    .preprocess(
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
  zone_id: z
    .preprocess(
      (val) => {
        if (val === "" || val == null) {
          return undefined;
        }
        return Number(val);
      },
      z
        .number({
          invalid_type_error: "El ID de zona debe ser numérico",
        })
        .int("El ID de zona debe ser un número entero")
        .positive("El ID de zona debe ser positivo")
        .optional()
    ),
  table_id: z
    .preprocess(
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
  status: z
    .enum(["pending", "confirmed", "completed", "cancelled"], {
      errorMap: () => ({
        message: "El estado debe ser: pending, confirmed, completed o cancelled",
      }),
    })
    .optional(),
  reservation_date: z
    .string({
      invalid_type_error: "La fecha de reserva debe ser texto",
    })
    .trim()
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      "La fecha de reserva debe ser válida (YYYY-MM-DD)"
    )
    .optional(),
});

// Función para validar creación de reserva
export const validateCreate = (data) => reservationCreateSchema.parse(data);

// Función para validar actualización de reserva
export const validateUpdate = (data) => reservationUpdateSchema.parse(data);

// Función para validar actualización de estado
export const validateStatusUpdate = (data) => reservationStatusSchema.parse(data);

// Función para validar verificación de disponibilidad
export const validateCheckAvailability = (data) => checkAvailabilitySchema.parse(data);

// Función para validar filtros de reservas
export const validateFilters = (data) => reservationFiltersSchema.parse(data);

// Middleware para validar creación de reserva
export const validateReservationCreate = (req, res, next) => {
  try {
    req.body = validateCreate(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware para validar actualización de reserva
export const validateReservationUpdate = (req, res, next) => {
  try {
    req.body = validateUpdate(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware para validar actualización de estado
export const validateReservationStatusUpdate = (req, res, next) => {
  try {
    req.body = validateStatusUpdate(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware para validar verificación de disponibilidad
export const validateCheckAvailabilityMiddleware = (req, res, next) => {
  try {
    req.body = validateCheckAvailability(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware para validar filtros de reservas
export const validateReservationFilters = (req, res, next) => {
  try {
    validateFilters(req.query);  // ✅ SOLO VALIDA - Sin asignación
    next();
  } catch (error) {
    next(error);
  }
};
