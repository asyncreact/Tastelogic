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
import tablesRoutes from "./src/routes/tables.routes.js";
import ordersRoutes from "./src/routes/orders.routes.js";
import { errorHandler } from "./src/middleware/errorHandler.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// MIDDLEWARES - Parsers
// ============================================================

app.use(express.json({ limit: "10mb", type: "application/json" }));
app.use(express.urlencoded({ extended: true }));

// ============================================================
// MIDDLEWARES - Headers
// ============================================================

app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// ============================================================
// MIDDLEWARES - CORS
// ============================================================

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
  })
);

// ============================================================
// MIDDLEWARES - Logging
// ============================================================

app.use(morgan("dev"));

// ============================================================
// MIDDLEWARES - Static Files
// ============================================================

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ============================================================
// RUTAS - Health Check
// ============================================================

app.get("/", (req, res) => {
  res.json({ message: "TasteLogic API funcionando correctamente" });
});

app.get("/api/ping", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Pong!", db_time: result.rows[0].now });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// RUTAS - API
// ============================================================

/**
 * Autenticación - Registro, Login, Recuperación de contraseña
 * Rutas públicas: /api/auth/register, /api/auth/login
 * Rutas protegidas: /api/auth/me, /api/auth/logout
 */
app.use("/api/auth", authRoutes);

/**
 * Menú - Categorías e Items
 * Rutas públicas: /api/menu/public/items, /api/menu/public/categories
 * Rutas protegidas: gestión de menú (admin only)
 */
app.use("/api/menu", menuRoutes);

/**
 * Mesas y Zonas - Gestión de zonas del restaurante
 * Rutas públicas: /api/tables/public/zones, /api/tables/public/tables
 * Rutas protegidas: gestión de mesas (admin only)
 */
app.use("/api/tables", tablesRoutes);

/**
 * Órdenes - Gestión completa de pedidos
 * Rutas públicas: /api/orders/public/statistics, /api/orders/public/top-items, /api/orders/public/demand
 * Rutas protegidas: crear, ver, editar órdenes
 * Rutas admin: gestión completa, analytics
 */
app.use("/api/orders", ordersRoutes);

// ============================================================
// MIDDLEWARES - Error Handler (debe ser el último)
// ============================================================

app.use(errorHandler);

// ============================================================
// INICIO DEL SERVIDOR
// ============================================================

const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();
    console.log("✅ Base de datos conectada");

    // Verificar SMTP
    const { transporter } = await import("./src/config/mailer.js");
    const smtpOk = await transporter.verify();
    if (smtpOk) {
      console.log("✅ SMTP conectado correctamente");
    } else {
      console.warn("⚠️  No se pudo verificar la conexión SMTP");
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📍 Entorno: ${process.env.NODE_ENV || "development"}`);
      console.log("");
      console.log("Rutas disponibles:");
      console.log("  📝 POST   /api/auth/register          - Registrar usuario");
      console.log("  🔓 POST   /api/auth/login             - Iniciar sesión");
      console.log("  🍽️  GET    /api/menu/public/items      - Ver menú público");
      console.log("  🪑 GET    /api/tables/public/zones     - Ver zonas públicas");
      console.log("  📦 POST   /api/orders/checkout        - Crear orden");
      console.log("  📊 GET    /api/orders/public/demand   - Ver demanda");
      console.log("");
    });
  } catch (err) {
    console.error("❌ Error al iniciar el servidor:", err.message);
    process.exit(1);
  }
};

startServer();

