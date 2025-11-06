// src/controllers/auth.controller.js

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
import { sendStyledMail } from "../config/mailer.js";
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";
import { successResponse, errorResponse } from "../utils/response.js";

/* AUTENTICACIÓN - REGISTRO */

/* Registra un nuevo usuario */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const existing = await getUserByEmail(email);

    if (existing) {
      return errorResponse(res, 409, "El correo ya está registrado");
    }

    const hashed_password = await bcrypt.hash(password, 10);
    const verification_token = crypto.randomBytes(40).toString("hex");

    await createUser({
      name,
      email,
      password: hashed_password,
      verification_token,
    });

    const verify_url = `${process.env.FRONTEND_URL}/verify/${verification_token}`;

    Promise.resolve(
      sendStyledMail({
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

    return successResponse(
      res,
      "Usuario registrado correctamente. Revisa tu correo para verificar la cuenta.",
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
    const { token } = req.params;
    const user = await verifyUserAccount(token);

    if (!user) {
      return errorResponse(res, 400, "Token inválido o expirado");
    }

    return successResponse(res, "Cuenta verificada correctamente", {}, 200);
  } catch (err) {
    next(err);
  }
};

/* AUTENTICACIÓN - LOGIN Y LOGOUT */

/* Inicia sesión de un usuario */
export const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await getUserByEmail(email);

    if (!user) {
      return errorResponse(res, 404, "Usuario no encontrado");
    }

    if (!user.is_verified) {
      return errorResponse(
        res,
        403,
        "Cuenta no verificada. Revisa tu correo."
      );
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return errorResponse(res, 400, "Contraseña incorrecta");
    }

    const token = generateToken({
      id: user.id,
      role: user.role,
      token_version: user.token_version,
    });

    return successResponse(res, "Inicio de sesión exitoso", {
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
    const user_id = req.user.id;
    await incrementTokenVersion(user_id);

    return successResponse(res, "Sesión cerrada correctamente", {}, 200);
  } catch (err) {
    next(err);
  }
};

/* AUTENTICACIÓN - RESET DE CONTRASEÑA */

/* Inicia el proceso de reseteo de contraseña */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await getUserByEmail(email);

    if (!user) {
      return errorResponse(res, 404, "Usuario no encontrado");
    }

    const reset_token = crypto.randomBytes(40).toString("hex");
    await setResetToken(user.id, reset_token);

    const reset_url = `${process.env.FRONTEND_URL}/reset-password/${reset_token}`;

    Promise.resolve(
      sendStyledMail({
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
      "Se ha enviado un enlace de restablecimiento a tu correo.",
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
    const { token } = req.params;
    const { password } = resetPasswordSchema.parse(req.body);
    const user = await getUserByResetToken(token);

    if (!user) {
      return errorResponse(res, 400, "Token inválido o expirado");
    }

    const hashed = await bcrypt.hash(password, 10);
    await updateUserPassword(user.id, hashed);
    await clearResetToken(user.id);

    return successResponse(
      res,
      "Contraseña restablecida correctamente. Vuelve a iniciar sesión.",
      {},
      200
    );
  } catch (err) {
    next(err);
  }
};
