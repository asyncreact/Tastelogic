// src/utils/response.js

/* Respuesta estándar de éxito */
export const successResponse = (res, message, data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    ...data,
  });
};

/* Respuesta estándar de error */
export const errorResponse = (res, status, message, details = null) => {
  return res.status(status).json({
    success: false,
    message,
    ...(details && { details }),
  });
};
