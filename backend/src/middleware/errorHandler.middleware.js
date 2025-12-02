// src/middleware/errorHandler.middleware.js
import { ZodError } from "zod";
import { errorResponse } from "../utils/response.js";

/* Middleware centralizado para manejar y formatear errores de la API */
export const errorHandler = (err, req, res, next) => {
  console.error("Error capturado por middleware:", {
    message: err.message,
    status: err.status,
    code: err.code,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  /* Errores de validación Zod */
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      campo: issue.path.join("."),
      mensaje: issue.message,
    }));

    return errorResponse(
      res,
      400,
      "Por favor, verifica los datos ingresados",
      details
    );
  }

  /* Errores de autenticación y autorización */
  if (err.status === 401) {
    return errorResponse(
      res,
      401,
      err.message || "Debes iniciar sesión para continuar"
    );
  }

  if (err.status === 403) {
    return errorResponse(
      res,
      403,
      err.message || "No tienes permisos para realizar esta acción"
    );
  }

  /* Errores de base de datos PostgreSQL */
  if (err.code) {
    switch (err.code) {
      case "23505": // Unique constraint violation
        return errorResponse(
          res,
          409,
          "Ya existe un registro con estos datos. Por favor, verifica la información.",
          { detalle: err.detail }
        );

      case "23503": // Foreign key constraint violation
        return errorResponse(
          res,
          409,
          "No se puede completar la operación porque está relacionada con otros registros",
          { detalle: err.detail }
        );

      case "23502": // Not null constraint violation
        return errorResponse(
          res,
          400,
          "Falta información requerida. Por favor, completa todos los campos obligatorios.",
          { detalle: err.detail }
        );

      case "22P02": // Invalid text representation
        return errorResponse(
          res,
          400,
          "El formato de los datos no es válido. Por favor, verifica la información.",
          { detalle: err.detail }
        );

      case "23514": // Check constraint violation
        return errorResponse(
          res,
          400,
          "Los datos no cumplen con las reglas establecidas",
          { detalle: err.detail }
        );

      case "42P01": // Undefined table
        return errorResponse(
          res,
          500,
          "Error de configuración del sistema. Por favor, contacta al soporte.",
          {
            detalle:
              process.env.NODE_ENV === "development" ? err.detail : undefined,
          }
        );

      case "42703": // Undefined column
        return errorResponse(
          res,
          500,
          "Error de configuración del sistema. Por favor, contacta al soporte.",
          {
            detalle:
              process.env.NODE_ENV === "development" ? err.detail : undefined,
          }
        );

      case "ECONNREFUSED": // Database connection refused
        return errorResponse(
          res,
          503,
          "No pudimos conectar con la base de datos. Por favor, intenta nuevamente en unos momentos."
        );

      case "ETIMEDOUT": // Connection timeout
        return errorResponse(
          res,
          504,
          "La operación tardó demasiado tiempo. Por favor, intenta nuevamente."
        );

      default:
        console.error("Código de error DB no manejado:", err.code);
        break;
    }
  }

  /* Errores personalizados con status 4xx */
  if (err.status && err.status >= 400 && err.status < 500) {
    return errorResponse(
      res,
      err.status,
      err.message || "Error en la solicitud",
      err.details || null
    );
  }

  /* Errores personalizados con status 5xx */
  if (err.status && err.status >= 500) {
    return errorResponse(
      res,
      err.status,
      err.message || "Error en el servidor",
      process.env.NODE_ENV === "development" ? { detalle: err.message } : null
    );
  }

  /* Error genérico 500 */
  return errorResponse(
    res,
    500,
    "Algo salió mal. Por favor, intenta nuevamente.",
    process.env.NODE_ENV === "development"
      ? {
          mensaje: err.message,
          tipo: err.name,
        }
      : null
  );
};
