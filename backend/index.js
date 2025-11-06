// app.js

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB, pool } from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import menuRoutes from "./src/routes/menu.routes.js";
import zoneRoutes from "./src/routes/zone.routes.js";
import tableRoutes from "./src/routes/table.routes.js";
import ordersRoutes from "./src/routes/orders.routes.js";
import { errorHandler } from "./src/middleware/errorHandler.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* MIDDLEWARE - PARSERS */

app.use(express.json({ limit: "10mb", type: "application/json" }));
app.use(express.urlencoded({ extended: true }));

/* MIDDLEWARE - HEADERS */

app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

/* MIDDLEWARE - CORS */

app.use(cors({
  origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
  credentials: true,
}));

/* MIDDLEWARE - LOGGING */

app.use(morgan("dev"));

/* MIDDLEWARE - STATIC FILES */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* RUTAS PÚBLICAS - HEALTH CHECK */

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

/* RUTAS API */

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/orders", ordersRoutes);

/* MIDDLEWARE - ERROR HANDLER */

app.use(errorHandler);

/* INICIAR SERVIDOR */

const startServer = async () => {
  try {
    await connectDB();
    console.log("Base de datos conectada");

    const { transporter } = await import("./src/config/mailer.js");
    const smtpOk = await transporter.verify();
    if (smtpOk) {
      console.log("SMTP conectado correctamente");
    } else {
      console.warn("No se pudo verificar la conexión SMTP");
    }

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Entorno: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("Error al iniciar el servidor:", err.message);
    process.exit(1);
  }
};

startServer();
