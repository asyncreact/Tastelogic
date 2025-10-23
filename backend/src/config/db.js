// src/config/db.js
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// 🧩 Configuración del pool de PostgreSQL
export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 10, // número máximo de conexiones simultáneas
  idleTimeoutMillis: 30000, // desconecta conexiones inactivas
  connectionTimeoutMillis: 5000, // tiempo máximo de espera de conexión
});

// 🧠 Asegurar codificación UTF-8 (soluciona acentos y caracteres especiales)
pool.on("connect", (client) => {
  client.query("SET client_encoding TO 'UTF8'");
});

// 🧠 Verificar conexión
export const connectDB = async () => {
  try {
    const { rows } = await pool.query("SELECT NOW()");
    console.log("🟢 Conectado a PostgreSQL:", rows[0].now);
  } catch (err) {
    console.error("❌ Error conectando a PostgreSQL:", err.message);
    throw err;
  }
};

// 🔁 Manejar errores globales de conexión
pool.on("error", (err) => {
  console.error("⚠️ Error inesperado en el cliente PostgreSQL:", err.message);
});
