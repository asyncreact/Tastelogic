// backend/index.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB, pool } from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import menuRoutes from "./src/routes/menu.routes.js";
import { errorHandler } from "./src/middleware/errorHandler.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================
// ⚙️ Middlewares globales
// ==========================
app.use(express.json({ limit: "10mb", type: "application/json" }));
app.use(express.urlencoded({ extended: true }));

// 🔤 Forzar codificación UTF-8 para evitar errores de acentos
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// 🌍 Configuración CORS
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
  })
);

// 📋 Logs HTTP
app.use(morgan("dev"));

// ✅ NUEVO: Servir archivos estáticos de uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================
// 🔗 Rutas principales
// ==========================
app.get("/", (req, res) => {
  res.json({ message: "✅ TasteLogic API funcionando correctamente" });
});

// 🔐 Rutas de autenticación
app.use("/api/auth", authRoutes);

// 🍽️ Rutas del menú (con autenticación y roles incluidas)
app.use("/api/menu", menuRoutes);

// 🏓 Endpoint de prueba de conexión DB
app.get("/api/ping", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "🏓 Pong!", db_time: result.rows[0].now });
  } catch (err) {
    next(err);
  }
});

// ==========================
// 🧱 Middleware Global de Errores
// ==========================
app.use(errorHandler); // 🔥 Siempre al final de las rutas

// ==========================
// 🚀 Iniciar Servidor
// ==========================
const startServer = async () => {
  try {
    // 🧩 1. Conectar a la base de datos
    await connectDB();

    // 📨 2. Verificar conexión SMTP (opcional)
    const { transporter } = await import("./src/config/mailer.js");
    const smtpOk = await transporter.verify();
    if (smtpOk) {
      console.log("📨 SMTP conectado correctamente");
    } else {
      console.warn("⚠️ No se pudo verificar la conexión SMTP");
    }

    // 🚀 3. Iniciar el servidor Express
    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error al iniciar el servidor:", err.message);
    process.exit(1);
  }
};

startServer();
