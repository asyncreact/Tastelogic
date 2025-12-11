// src/repositories/ai.repository.js

import { pool } from "../config/db.js";

/**
 * Top 10 más vendidos (reales) en un rango de fechas
 * fromDate / toDate en formato 'YYYY-MM-DD'
 */
export const getTop10SoldItems = async ({ fromDate, toDate }) => {
  try {
    const params = [];
    let where = "WHERE 1=1";

    if (fromDate) {
      where += ` AND o.order_date >= $${params.length + 1}`;
      params.push(fromDate);
    }

    if (toDate) {
      where += ` AND o.order_date <= $${params.length + 1}`;
      params.push(toDate);
    }

    // Solo pedidos completados (ajusta si usas otro status)
    where += ` AND o.status IN ('completed')`;

    const query = `
      SELECT
        oi.menu_item_id AS menuitemid,
        m.name AS itemname,
        m.price,
        SUM(oi.quantity) AS totalquantity,
        SUM(oi.subtotal) AS totalsales
      FROM public.orders o
      JOIN public.order_items oi ON oi.order_id = o.id
      JOIN public.menu_items m ON m.id = oi.menu_item_id
      ${where}
      GROUP BY oi.menu_item_id, m.name, m.price
      ORDER BY totalquantity DESC
      LIMIT 10
    `;

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Error en getTop10SoldItems:", error);
    throw error;
  }
};

/**
 * Ítem más vendido hoy (real)
 */
export const getTodayTopItem = async () => {
  try {
    const query = `
      SELECT
        oi.menu_item_id AS menuitemid,
        m.name AS itemname,
        m.price,
        SUM(oi.quantity) AS totalquantity,
        SUM(oi.subtotal) AS totalsales
      FROM public.orders o
      JOIN public.order_items oi ON oi.order_id = o.id
      JOIN public.menu_items m ON m.id = oi.menu_item_id
      WHERE o.order_date = CURRENT_DATE
        AND o.status IN ('completed')
      GROUP BY oi.menu_item_id, m.name, m.price
      ORDER BY totalquantity DESC
      LIMIT 3
    `;

    const result = await pool.query(query);
    // ahora devolvemos SIEMPRE un array (0–3 elementos)
    return result.rows;
  } catch (error) {
    console.error("Error en getTodayTopItem:", error);
    throw error;
  }
};

/**
 * Top 10 demandados previstos en un rango de fechas
 * fromDate / toDate en formato 'YYYY-MM-DD'
 */
export const getTop10Predicted = async ({ fromDate, toDate }) => {
  try {
    const params = [];
    let where = "WHERE 1=1";

    if (fromDate) {
      where += ` AND p.prediction_date >= $${params.length + 1}`;
      params.push(fromDate);
    }

    if (toDate) {
      where += ` AND p.prediction_date <= $${params.length + 1}`;
      params.push(toDate);
    }

    const query = `
      SELECT
        p.menu_item_id AS menuitemid,
        m.name AS itemname,
        m.price,
        SUM(p.predicted_quantity) AS totalpredicted,
        AVG(p.confidence_score) AS avgconfidence
      FROM public.demand_predictions p
      JOIN public.menu_items m ON m.id = p.menu_item_id
      ${where}
      GROUP BY p.menu_item_id, m.name, m.price
      ORDER BY totalpredicted DESC
      LIMIT 10
    `;

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Error en getTop10Predicted:", error);
    throw error;
  }
};

/**
 * Top ítems por temporada (previsto)
 * season: 'spring' | 'summer' | 'fall' | 'winter'
 */
export const getSeasonTopItems = async (season) => {
  try {
    const query = `
      SELECT
        p.menu_item_id AS menuitemid,
        m.name AS itemname,
        m.price,
        p.season,
        SUM(p.predicted_quantity) AS totalpredicted,
        AVG(p.confidence_score) AS avgconfidence
      FROM public.demand_predictions p
      JOIN public.menu_items m ON m.id = p.menu_item_id
      WHERE p.season = $1
      GROUP BY p.menu_item_id, m.name, m.price, p.season
      ORDER BY totalpredicted DESC
      LIMIT 10
    `;

    const result = await pool.query(query, [season]);
    return result.rows;
  } catch (error) {
    console.error("Error en getSeasonTopItems:", error);
    throw error;
  }
};
