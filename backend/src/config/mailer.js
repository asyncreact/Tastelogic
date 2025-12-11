// src/config/mailer.js

import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";

dotenv.config();

// Configura SendGrid con la API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/** Escapa caracteres especiales en HTML para prevenir inyecciones */
const escapeHtml = (unsafe = "") => {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/** Genera un color naranja aleatorio en formato HSL */
const randomOrange = () => {
  const hue = 20 + Math.random() * 20;      // 20–40 (naranjas)
  const sat = 80 + Math.random() * 10;      // 80–90%
  const light = 40 + Math.random() * 20;    // 40–60%
  return `hsl(${hue.toFixed(0)}, ${sat.toFixed(0)}%, ${light.toFixed(0)}%)`;
};

/** Crea un gradiente linear tipo "lava" con stops aleatorios */
const lavaGradient = () => {
  const c1 = randomOrange();
  const c2 = randomOrange();
  const c3 = randomOrange();
  const c4 = randomOrange();
  const c5 = randomOrange();

  const stops = [
    { color: c1, pos: 0 },
    { color: c2, pos: 18 + Math.random() * 10 },  // 18–28
    { color: c3, pos: 40 + Math.random() * 10 },  // 40–50
    { color: c4, pos: 65 + Math.random() * 10 },  // 65–75
    { color: c5, pos: 100 },
  ].sort((a, b) => a.pos - b.pos);

  const stopsCss = stops
    .map((s) => `${s.color} ${s.pos.toFixed(0)}%`)
    .join(", ");

  const angle = Math.random() * 360; // Ángulo aleatorio 0-360°

  return `linear-gradient(${angle.toFixed(0)}deg, ${stopsCss})`;
};

/** Genera una plantilla HTML de correo con diseño y gradiente dinámico */
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

  // Gradientes para encabezado y botón
  const headerGradient = lavaGradient();
  const buttonGradient = lavaGradient();

  return `
  <!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>${safeAppName}</title>
    </head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f5;padding:24px 12px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
              <!-- Header con gradiente tipo lámpara de lava -->
              <tr>
                <td
                  style="
                    padding:24px 24px 20px;
                    text-align:left;
                    color:#ffffff;
                    background:${headerGradient};
                  "
                >
                  <div style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;opacity:.9;">
                    ${safeAppName}
                  </div>
                  ${
                    safeTitle
                      ? `<h1 style="margin:10px 0 4px;font-size:20px;font-weight:700;line-height:1.25;">${safeTitle}</h1>`
                      : ""
                  }
                  ${
                    safeSubtitle
                      ? `<p style="margin:0;font-size:13px;opacity:.9;line-height:1.5;">${safeSubtitle}</p>`
                      : ""
                  }
                </td>
              </tr>

              <!-- Contenido -->
              <tr>
                <td style="padding:20px 24px 24px;text-align:left;">
                  ${
                    safeMessage
                      ? `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#111827;white-space:pre-line;">${safeMessage}</p>`
                      : ""
                  }

                  ${
                    safeButtonText && safeButtonUrl
                      ? `
                        <p style="margin:0 0 8px;">
                          <a
                            href="${safeButtonUrl}"
                            style="
                              display:inline-block;
                              padding:10px 20px;
                              border-radius:999px;
                              background:${buttonGradient};
                              color:#ffffff;
                              text-decoration:none;
                              font-size:14px;
                              font-weight:600;
                            "
                          >
                            ${safeButtonText}
                          </a>
                        </p>
                      `
                      : ""
                  }

                  <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#6B7280;">
                    Este mensaje se generó automáticamente en relación con tu cuenta o reserva en ${safeAppName}.
                  </p>
                </td>
              </tr>

              <!-- Footer minimalista -->
              <tr>
                <td style="padding:12px 24px 18px;text-align:left;border-top:1px solid #E5E7EB;">
                  <p style="margin:0;font-size:11px;color:#9CA3AF;line-height:1.5;">
                    Si no reconoces este correo, puedes ignorarlo.
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

/** Envía un correo usando SendGrid + la plantilla anterior */
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

  const msg = {
    to,
    from: from || process.env.EMAIL_FROM,
    subject,
    text: message || "",
    html,
  };

  return sgMail.send(msg);
};
