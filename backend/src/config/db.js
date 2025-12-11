// src/config/db.js
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === "production";

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ...(isProduction && {
    ssl: { rejectUnauthorized: false },
  }),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Asegurar codificación UTF-8
pool.on("connect", (client) => {
  client.query("SET client_encoding TO 'UTF8'");
});

export const connectDB = async () => {
  try {
    const { rows } = await pool.query("SELECT NOW()");
    console.log("Conectado a PostgreSQL:", rows[0].now);
  } catch (err) {
    console.error("Error conectando a PostgreSQL:", err.message);
    throw err;
  }
};

pool.on("error", (err) => {
  console.error("Error inesperado en el cliente PostgreSQL:", err.message);
});

