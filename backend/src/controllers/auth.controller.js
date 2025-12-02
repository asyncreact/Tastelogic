import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  getUserByEmail,
  createUser,
  verifyUserAccount,
  setResetToken,
  getUserByResetToken,
  updateUserPassword,
  clearResetToken,
  incrementTokenVersion,
} from "../repositories/user.repository.js";

import { generateToken } from "../utils/jwt.js";
import { sendMail } from "../config/mailer.js";
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";
import { successResponse } from "../utils/response.js";

/* Registra un nuevo usuario */
export const register = async (req, res, next) => {
  try {
    // Valida los datos de registro
    const { name, email, password } = registerSchema.parse(req.body);
    const existing = await getUserByEmail(email);

    // Verifica si el usuario ya existe
    if (existing) {
      const error = new Error(
        "Este correo electrónico ya está registrado. Por favor, usa otro o inicia sesión."
      );
      error.status = 409;
      throw error;
    }

    // Hashea la contraseña del usuario
    const hashed_password = await bcrypt.hash(password, 10);
    // Genera un token para verificación
    const verification_token = crypto.randomBytes(40).toString("hex");

    // Crea el usuario en la base de datos
    await createUser({
      name,
      email,
      password: hashed_password,
      verification_token,
    });

    const verify_url = `${process.env.FRONTEND_URL}/verify/${verification_token}`;

    // Envía correo de verificación
    Promise.resolve(
      sendMail({
        to: email,
        subject: "Verifica tu cuenta - TasteLogic",
        title: `¡Bienvenido, ${name}!`,
        message: `Gracias por registrarte en TasteLogic.
                  Verifica tu cuenta haciendo clic en el siguiente botón:`,
        buttonText: "Verificar mi cuenta",
        buttonUrl: verify_url,
      })
    ).catch((err) =>
      console.error("Error al enviar correo de verificación:", err)
    );

    // Devuelve respuesta exitosa
    return successResponse(
      res,
      "¡Registro exitoso! Revisa tu correo para verificar tu cuenta.",
      {},
      201
    );
  } catch (err) {
    next(err);
  }
};

/* Verifica la cuenta de un usuario */
export const verify = async (req, res, next) => {
  try {
    // Obtiene el token de la URL y verifica el usuario
    const { token } = req.params;
    const user = await verifyUserAccount(token);

    if (!user) {
      const error = new Error(
        "El enlace de verificación es inválido o ha expirado. Solicita uno nuevo."
      );
      error.status = 400;
      throw error;
    }

    // Respuesta exitosa de verificación
    return successResponse(
      res,
      "¡Tu cuenta ha sido verificada exitosamente! Ya puedes iniciar sesión.",
      {},
      200
    );
  } catch (err) {
    next(err);
  }
};

/* Inicia sesión de un usuario */
export const login = async (req, res, next) => {
  try {
    // Valida los datos de login
    const { email, password } = loginSchema.parse(req.body);
    const user = await getUserByEmail(email);

    // Verifica si el usuario existe
    if (!user) {
      const error = new Error(
        "No encontramos una cuenta con este correo electrónico."
      );
      error.status = 404;
      throw error;
    }

    // Verifica si la cuenta ha sido confirmada
    if (!user.is_verified) {
      const error = new Error(
        "Tu cuenta aún no está verificada. Por favor, revisa tu correo."
      );
      error.status = 403;
      throw error;
    }

    // Verifica la contraseña proporcionada
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      const error = new Error(
        "La contraseña es incorrecta. Por favor, intenta de nuevo."
      );
      error.status = 400;
      throw error;
    }

    // Genera y envía el token JWT de sesión
    const token = generateToken({
      id: user.id,
      role: user.role,
      token_version: user.token_version,
    });

    return successResponse(res, "¡Bienvenido de nuevo!", {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* Cierra la sesión de un usuario */
export const logout = async (req, res, next) => {
  try {
    // Invalida el token actual incrementando el token_version
    const user_id = req.user.id;
    await incrementTokenVersion(user_id);

    return successResponse(
      res,
      "Has cerrado sesión correctamente. ¡Hasta pronto!",
      {},
      200
    );
  } catch (err) {
    next(err);
  }
};

/* Inicia el proceso de reseteo de contraseña */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await getUserByEmail(email);

    // Verifica si el usuario existe para reset
    if (!user) {
      const error = new Error(
        "No encontramos una cuenta asociada a este correo electrónico."
      );
      error.status = 404;
      throw error;
    }

    // Genera un token de reseteo y lo asocia al usuario
    const reset_token = crypto.randomBytes(40).toString("hex");
    await setResetToken(user.id, reset_token);

    const reset_url = `${process.env.FRONTEND_URL}/reset-password/${reset_token}`;

    // Envía correo para restablecer contraseña
    Promise.resolve(
      sendMail({
        to: email,
        subject: "Restablece tu contraseña - TasteLogic",
        title: `Hola ${user.name},`,
        message: `Recibimos una solicitud para restablecer tu contraseña.
                  Si fuiste tú, haz clic en el botón para continuar:`,
        buttonText: "Restablecer contraseña",
        buttonUrl: reset_url,
      })
    ).catch((err) =>
      console.error("Error al enviar correo de restablecimiento:", err)
    );

    return successResponse(
      res,
      "Te hemos enviado un enlace para restablecer tu contraseña. Revisa tu correo.",
      {},
      200
    );
  } catch (err) {
    next(err);
  }
};

/* Restablece la contraseña de un usuario */
export const resetPassword = async (req, res, next) => {
  try {
    // Valida el token y la nueva contraseña
    const { token } = req.params;
    const { password } = resetPasswordSchema.parse(req.body);
    const user = await getUserByResetToken(token);

    if (!user) {
      const error = new Error(
        "El enlace para restablecer contraseña es inválido o ha expirado."
      );
      error.status = 400;
      throw error;
    }

    // Hashea la nueva contraseña y actualiza el usuario
    const hashed = await bcrypt.hash(password, 10);
    await updateUserPassword(user.id, hashed);
    await clearResetToken(user.id);

    return successResponse(
      res,
      "¡Tu contraseña ha sido actualizada exitosamente! Ya puedes iniciar sesión.",
      {},
      200
    );
  } catch (err) {
    next(err);
  }
};
