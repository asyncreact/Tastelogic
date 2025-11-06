// src/validators/auth.validator.js

import { z } from "zod";
import validator from "validator";

/* VALIDACIONES REUTILIZABLES */

/* Valida que el email sea correcto */
const emailValidation = z
  .string()
  .trim()
  .refine((val) => validator.isEmail(val), {
    message: "Correo electrónico no válido",
  });

/* Valida que la contraseña cumpla los requisitos de seguridad */
const passwordValidation = z
  .string()
  .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
  .refine((val) => /[A-Z]/.test(val), {
    message: "Debe contener al menos una letra mayúscula",
  })
  .refine((val) => /[a-z]/.test(val), {
    message: "Debe contener al menos una letra minúscula",
  })
  .refine((val) => /\d/.test(val), {
    message: "Debe contener al menos un número",
  })
  .refine((val) => /[@$!%*?&]/.test(val), {
    message: "Debe contener al menos un carácter especial (@$!%*?&)",
  });

/* ESQUEMAS DE VALIDACIÓN */

/* Schema para registro de usuario */
export const registerSchema = z.object({
  name: z
    .string({ required_error: "El nombre es obligatorio" })
    .trim()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(100, { message: "El nombre no debe superar 100 caracteres" }),
  email: emailValidation,
  password: passwordValidation,
});

/* Schema para login */
export const loginSchema = z.object({
  email: emailValidation,
  password: z
    .string({ required_error: "La contraseña es obligatoria" })
    .min(1, { message: "La contraseña es obligatoria" }),
});

/* Schema para reseteo de contraseña */
export const resetPasswordSchema = z.object({
  password: passwordValidation,
});

/* FUNCIONES DE VALIDACIÓN */

/* Valida datos de registro */
export const validateRegister = (data) => registerSchema.parse(data);

/* Valida datos de login */
export const validateLogin = (data) => loginSchema.parse(data);

/* Valida datos de reseteo de contraseña */
export const validateResetPassword = (data) => resetPasswordSchema.parse(data);

/* MIDDLEWARES DE VALIDACIÓN */

/* Middleware para validar registro */
export const validateRegisterMiddleware = (req, res, next) => {
  try {
    req.body = validateRegister(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

/* Middleware para validar login */
export const validateLoginMiddleware = (req, res, next) => {
  try {
    req.body = validateLogin(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

/* Middleware para validar reseteo de contraseña */
export const validateResetPasswordMiddleware = (req, res, next) => {
  try {
    req.body = validateResetPassword(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
