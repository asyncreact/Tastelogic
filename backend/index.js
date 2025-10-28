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
import { errorHandler } from "./src/middleware/errorHandler.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "10mb", type: "application/json" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
  })
);

app.use(morgan("dev"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "TasteLogic API funcionando correctamente" });
});

app.use("/api/auth", authRoutes);

app.use("/api/menu", menuRoutes);

app.use("/api/tables", tablesRoutes);

app.get("/api/ping", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Pong!", db_time: result.rows[0].now });
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    const { transporter } = await import("./src/config/mailer.js");
    const smtpOk = await transporter.verify();
    if (smtpOk) {
      console.log("SMTP conectado correctamente");
    } else {
      console.warn("No se pudo verificar la conexión SMTP");
    }

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Error al iniciar el servidor:", err.message);
    process.exit(1);
  }
};

startServer();
