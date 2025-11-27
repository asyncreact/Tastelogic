// src/config/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Transporter básico
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Función para escapar HTML básico
const escapeHtml = (unsafe = "") => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Template de correo simple (sin diseño recargado)
const simpleTemplate = ({
  title,
  subtitle,
  message,
  buttonText,
  buttonUrl,
  appName,
}) => {
  const safeAppName = escapeHtml(appName || "TasteLogic");
  const safeTitle = title ? escapeHtml(title) : "";
  const safeSubtitle = subtitle ? escapeHtml(subtitle) : "";
  const safeMessage = message ? escapeHtml(message) : "";
  const safeButtonText = buttonText ? escapeHtml(buttonText) : "";
  const safeButtonUrl = buttonUrl ? escapeHtml(buttonUrl) : "";

  return `
  <!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>${safeAppName}</title>
    </head>
    <body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#ffffff;color:#000000;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center">
            <table width="600" cellpadding="16" cellspacing="0" border="0" style="border:1px solid #dddddd;">
              <tr>
                <td align="left">
                  <h1 style="margin:0 0 8px 0;font-size:20px;">${safeAppName}</h1>
                  ${safeTitle ? `<h2 style="margin:0 0 8px 0;font-size:18px;">${safeTitle}</h2>` : ""}
                  ${safeSubtitle ? `<p style="margin:0 0 12px 0;font-size:14px;">${safeSubtitle}</p>` : ""}
                  ${safeMessage ? `<p style="margin:0 0 16px 0;font-size:14px;line-height:1.5;">${safeMessage}</p>` : ""}
                  ${
                    safeButtonText && safeButtonUrl
                      ? `
                        <p style="margin:0 0 16px 0;">
                          <a href="${safeButtonUrl}" style="display:inline-block;padding:8px 16px;border:1px solid #000000;text-decoration:none;color:#000000;font-size:14px;">
                            ${safeButtonText}
                          </a>
                        </p>
                      `
                      : ""
                  }
                  <p style="margin:16px 0 0 0;font-size:12px;color:#666666;">
                    Este es un mensaje automático de ${safeAppName}.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};

// Función para enviar correo usando el template simple
export const sendMail = async ({
  to,
  subject,
  title,
  subtitle,
  message,
  buttonText,
  buttonUrl,
  appName,
  from,
}) => {
  const html = simpleTemplate({
    title,
    subtitle,
    message,
    buttonText,
    buttonUrl,
    appName,
  });

  const mailOptions = {
    from: from || process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};
