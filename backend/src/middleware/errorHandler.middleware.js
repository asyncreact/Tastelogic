// src/middleware/errorHandler.middleware.js
import { ZodError } from "zod";
import { errorResponse } from "../utils/response.js";

export const errorHandler = (err, req, res, next) => {
  console.error("Error capturado por middleware:", err);

  if (err instanceof ZodError) {
    const details = err.issues.map((e) => e.message);
    return errorResponse(res, 400, "Error de validación", details);
  }

  if (err.status === 401 || err.status === 403) {
    return errorResponse(res, err.status, err.message);
  }

  if (err.status) {
    return errorResponse(res, err.status, err.message, err.details || null);
  }

  return errorResponse(
    res,
    500,
    "Error interno del servidor. Por favor intenta más tarde."
  );
};
