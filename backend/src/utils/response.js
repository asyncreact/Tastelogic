// src/utils/response.js

// ✅ Respuesta exitosa
export const successResponse = (res, message, data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    ...data,
  });
};

// ❌ Respuesta de error
export const errorResponse = (res, status, message, details = null) => {
  return res.status(status).json({
    success: false,
    message,
    ...(details && { details }),
  });
};
