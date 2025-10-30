import rateLimit from "express-rate-limit";

// Límite general para endpoints sensibles
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: "Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Límite para envío de correos
export const emailLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 3,
  message: {
    message: "Has alcanzado el límite de envío de correos. Intenta nuevamente más tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
