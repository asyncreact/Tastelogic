import rateLimit, { ipKeyGenerator } from "express-rate-limit";

/* Limita intentos fallidos de autenticación en un periodo corto */
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 5,
  keyGenerator: (req) => req.body.email || ipKeyGenerator(req.ip),
  skipSuccessfulRequests: true,
  message: {
    message:
      "Has excedido el número de intentos fallidos. Espera 5 minutos antes de intentar de nuevo.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/* Limita la cantidad de correos que se pueden enviar en un periodo */
export const emailLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 3,
  message: {
    message:
      "Has alcanzado el límite de envío de correos. Intenta nuevamente más tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
