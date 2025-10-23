// src/controllers/auth.controller.js
import bcrypt from "bcrypt";
import crypto from "crypto";
import { UserRepository } from "../repositories/user.repository.js";
import { generateToken } from "../utils/jwt.js";
import { sendStyledMail } from "../config/mailer.js"; // ✅ nuevo import
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";
import { successResponse } from "../utils/response.js";

export class AuthController {
  // =========================
  // 🧾 Registro
  // =========================
  static async register(req, res, next) {
    try {
      const { name, email, password } = registerSchema.parse(req.body);

      const existing = await UserRepository.findByEmail(email);
      if (existing) {
        const err = new Error("El correo ya está registrado");
        err.status = 400;
        throw err;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(40).toString("hex");

      await UserRepository.createUser({
        name,
        email,
        password: hashedPassword,
        verification_token: verificationToken,
      });

      const verifyUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

      // ✉️ Envío de correo con plantilla profesional
      Promise.resolve(
        sendStyledMail({
          to: email,
          subject: "Verifica tu cuenta - TasteLogic",
          title: `¡Bienvenido, ${name}!`,
          message: `
            Gracias por registrarte en <b>TasteLogic</b>.<br><br>
            Verifica tu cuenta haciendo clic en el siguiente botón:
          `,
          buttonText: "Verificar mi cuenta",
          buttonUrl: verifyUrl,
        })
      ).catch((err) => console.error("❌ Error al enviar correo de verificación:", err));

      return successResponse(
        res,
        "Usuario registrado correctamente. Revisa tu correo para verificar la cuenta.",
        {},
        201
      );
    } catch (err) {
      next(err);
    }
  }

  // =========================
  // ✅ Verificación
  // =========================
  static async verify(req, res, next) {
    try {
      const { token } = req.params;
      const user = await UserRepository.verifyAccount(token);

      if (!user) {
        const err = new Error("Token inválido o expirado");
        err.status = 400;
        throw err;
      }

      return successResponse(res, "Cuenta verificada correctamente", {}, 200);
    } catch (err) {
      next(err);
    }
  }

  // =========================
  // 🔐 Login
  // =========================
  static async login(req, res, next) {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await UserRepository.findByEmail(email);
      if (!user) {
        const err = new Error("Usuario no encontrado");
        err.status = 404;
        throw err;
      }

      if (!user.is_verified) {
        const err = new Error("Cuenta no verificada. Revisa tu correo.");
        err.status = 403;
        throw err;
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        const err = new Error("Contraseña incorrecta");
        err.status = 400;
        throw err;
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
  }

  // =========================
  // 🚪 Cerrar sesión
  // =========================
  static async logout(req, res, next) {
    try {
      const userId = req.user.id;
      await UserRepository.incrementTokenVersion(userId);
      return successResponse(res, "Sesión cerrada correctamente", {}, 200);
    } catch (err) {
      next(err);
    }
  }

  // =========================
  // 🔑 Solicitar restablecimiento de contraseña
  // =========================
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const user = await UserRepository.findByEmail(email);

      if (!user) {
        const err = new Error("Usuario no encontrado");
        err.status = 404;
        throw err;
      }

      const resetToken = crypto.randomBytes(40).toString("hex");
      await UserRepository.setResetToken(user.id, resetToken);

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

      // ✉️ Envío de correo con diseño profesional
      Promise.resolve(
        sendStyledMail({
          to: email,
          subject: "Restablece tu contraseña - TasteLogic",
          title: `Hola ${user.name},`,
          message: `
            Recibimos una solicitud para restablecer tu contraseña.<br><br>
            Si fuiste tú, haz clic en el botón para continuar:
          `,
          buttonText: "Restablecer contraseña",
          buttonUrl: resetUrl,
        })
      ).catch((err) => console.error("❌ Error al enviar correo de restablecimiento:", err));

      return successResponse(
        res,
        "Se ha enviado un enlace de restablecimiento a tu correo.",
        {},
        200
      );
    } catch (err) {
      next(err);
    }
  }

  // =========================
  // 🔄 Restablecer contraseña
  // =========================
  static async resetPassword(req, res, next) {
    try {
      const { token } = req.params;
      const { password } = resetPasswordSchema.parse(req.body);

      const user = await UserRepository.findByResetToken(token);
      if (!user) {
        const err = new Error("Token inválido o expirado");
        err.status = 400;
        throw err;
      }

      const hashed = await bcrypt.hash(password, 10);
      await UserRepository.updatePassword(user.id, hashed);

      // 🧹 Limpieza manual del token (doble seguridad)
      await UserRepository.clearResetToken(user.id);

      return successResponse(
        res,
        "Contraseña restablecida correctamente. Vuelve a iniciar sesión.",
        {},
        200
      );
    } catch (err) {
      next(err);
    }
  }
}
