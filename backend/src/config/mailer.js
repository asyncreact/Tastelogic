// src/config/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Transporte SMTP
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

// Paleta TasteLogic (moderna)
const DEFAULT_THEME = {
  primary: "#E53935",
  primaryDark: "#B71C1C",
  onPrimary: "#FFFFFF",
  surface: "#FFFFFF",
  onSurface: "#1A1B1E",
  outline: "#E8E8EA",
  background: "#F7F5F2",
  success: "#12B886",
  warning: "#F4B400",
  error: "#E03131",
  appName: "TasteLogic",
};

const baseStyles = (t) => `
  /* Reset básico */
  * { box-sizing: border-box; }
  body { margin:0; padding:0; background:${t.background}; color:${t.onSurface}; }
  img { border:0; outline:none; text-decoration:none; }
  a { text-decoration:none; color:inherit; }
  table { border-collapse:collapse; }

  /* Tipografía moderna */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  .root {
    font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
    background:${t.background};
    padding:28px 16px;
  }

  /* Contenedor con efecto glass */
  .container {
    max-width: 680px;
    margin: 0 auto;
    background:${t.surface};
    border-radius: 18px;
    border: 1px solid ${t.outline};
    box-shadow: 0 10px 30px rgba(16, 18, 27, 0.06), 0 4px 12px rgba(16, 18, 27, 0.04);
    overflow: hidden;
    backdrop-filter: blur(6px);
  }

  /* Header con gradiente radial suave */
  .header {
    width:100%;
    color:${t.onPrimary};
    padding: 36px 28px 28px;
    text-align: center;
    background:
      radial-gradient(1200px 300px at 50% -20%, rgba(255,255,255,0.25), transparent 60%),
      linear-gradient(135deg, ${t.primary}, ${t.primaryDark});
  }

  .brand-name {
    display:inline-block;
    font-weight:700;
    letter-spacing:0.3px;
    font-size:15px;
    padding:6px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.14);
    color:${t.onPrimary};
  }

  .title {
    margin: 18px 0 6px;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.15;
    color:${t.onPrimary};
  }

  .subtle {
    font-size: 13px;
    opacity: 0.92;
    color:${t.onPrimary};
  }

  /* Cuerpo centrado */
  .content {
    padding: 28px;
    text-align: center;
    color:${t.onSurface};
    font-size:15px;
    line-height:1.7;
  }

  /* Tarjeta de mensaje con borde suave */
  .message {
    margin: 10px 0 22px;
    padding: 16px 18px;
    border: 1px solid ${t.outline};
    border-radius: 14px;
    background: #FFFDFC;
  }

  /* Botón moderno accesible */
  .btn {
    display:inline-block;
    min-width: 184px;
    text-align:center;
    padding: 13px 20px;
    border-radius: 999px;
    background:${t.primary};
    color:${t.onPrimary} !important;
    font-weight:700;
    letter-spacing:0.2px;
    border: 1px solid rgba(255,255,255,0.24);
    box-shadow: 0 6px 18px rgba(229,57,53,0.28), inset 0 -2px 0 rgba(0,0,0,0.1);
    transition: transform 0.06s ease-in, box-shadow 0.25s ease, background 0.2s ease;
  }
  .btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(229,57,53,0.32);
    background: ${t.primaryDark};
  }
  .btn:active {
    transform: translateY(0);
    box-shadow: 0 6px 12px rgba(229,57,53,0.28);
  }
  .btn:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(229,57,53,0.2), 0 10px 22px rgba(229,57,53,0.28);
  }

  /* Etiqueta de estado */
  .badge {
    display:inline-block;
    padding: 5px 10px;
    border-radius: 999px;
    font-size:12px;
    font-weight:700;
    letter-spacing:0.3px;
    background: rgba(255,255,255,0.18);
    color:${t.onPrimary};
    margin-top: 10px;
  }
  .badge.success { background: rgba(18,184,134,0.18); }
  .badge.warning { background: rgba(244,180,0,0.22); }
  .badge.error   { background: rgba(224,49,49,0.22); }

  /* Separador */
  .divider {
    height:1px; background:${t.outline}; margin: 26px 0;
  }

  /* Footer limpio */
  .footer {
    padding: 18px 28px 28px;
    color: #6B7280;
    font-size: 12px;
    text-align: center;
  }
  .meta {
    margin-top: 8px;
  }

  /* Responsive */
  @media (max-width: 480px) {
    .content, .footer { padding: 20px; }
    .title { font-size: 22px; }
    .btn { min-width: 100%; }
  }

  /* Dark mode refinado */
  @media (prefers-color-scheme: dark) {
    .root { background:#0F1115; }
    .container { background:#14151A; border-color:#242634; }
    .content { color:#E6E7EB; }
    .message { background:#17191F; border-color:#242634; }
    .footer { color:#9CA3AF; }
    .divider { background:#242634; }
    .brand-name { background: rgba(255,255,255,0.12); }
  }
`;

/* Plantilla HTML moderna y centrada (sin logo) */
const template = ({
  theme,
  title,
  subtitle,
  message,
  buttonText,
  buttonUrl,
  status,   // "success" | "warning" | "error"
  appName,
}) => {
  const t = { ...DEFAULT_THEME, ...(theme || {}), appName: appName || DEFAULT_THEME.appName };
  const badgeClass = status ? `badge ${status}` : "";
  return `
  <!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>${escapeHtml(title || t.appName)}</title>
      <style>${baseStyles(t)}</style>
    </head>
    <body>
      <div class="root">
        <table role="presentation" class="container" width="100%">
          <tr>
            <td>
              <div class="header">
                <span class="brand-name">${escapeHtml(t.appName)}</span>
                ${title ? `<div class="title">${escapeHtml(title)}</div>` : ""}
                ${subtitle ? `<div class="subtle">${escapeHtml(subtitle)}</div>` : ""}
                ${status ? `<div class="${badgeClass}">${statusLabel(status)}</div>` : ""}
              </div>
              <div class="content">
                ${message ? `<div class="message">${message}</div>` : ""}
                ${buttonText && buttonUrl ? `
                  <a class="btn" href="${buttonUrl}" target="_blank" rel="noopener noreferrer">
                    ${escapeHtml(buttonText)}
                  </a>
                ` : ""}
                <div class="divider"></div>
                <div class="footer">
                  <div>Este mensaje fue enviado automáticamente por ${escapeHtml(t.appName)}.</div>
                  <div class="meta">Si no fuiste tú quien inició esta acción, ignora este correo o contáctanos.</div>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </body>
  </html>
`;
};

// Utilidades
const escapeHtml = (str = "") =>
  String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const statusLabel = (s) =>
  s === "success" ? "Operación exitosa" :
  s === "warning" ? "Atención requerida" :
  s === "error"   ? "Se produjo un error" :
  "";

// API principal
export const sendStyledMail = async ({
  to,
  subject,
  title,
  subtitle,   // NUEVO: texto breve bajo el título
  message,    // HTML permitido
  buttonText,
  buttonUrl,
  status,
  theme,
  appName,
  from,
}) => {
  const html = template({
    theme,
    title,
    subtitle,
    message,
    buttonText,
    buttonUrl,
    status,
    appName,
  });

  const mailOptions = {
    from: from || `"${appName || DEFAULT_THEME.appName}" <${process.env.EMAIL_USER}>`,
    to,
    subject: subject || title || (appName || DEFAULT_THEME.appName),
    html,
  };

  return transporter.sendMail(mailOptions);
};
