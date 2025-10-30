import { z } from "zod";
import validator from "validator";

const emailValidation = z
  .string()
  .trim()
  .refine((val) => validator.isEmail(val), {
    message: "Correo electrónico no válido",
  });

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

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: emailValidation,
  password: passwordValidation,
});

export const loginSchema = z.object({
  email: emailValidation,
  password: z.string().min(1, { message: "La contraseña es obligatoria" }),
});

export const resetPasswordSchema = z.object({
  password: passwordValidation,
});
