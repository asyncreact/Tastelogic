import {
  getTop10SoldItems,
  getTodayTopItem,
  getTop10Predicted,
  getSeasonTopItems,
} from "../repositories/ai.repository.js";
import { successResponse } from "../utils/response.js";

/* ANALYTICS IA / DASHBOARD */

/* Top 10 más vendidos (reales) */
export const iaTopSold = async (req, res, next) => {
  try {
    const { from_date, to_date } = req.query;

    const data = await getTop10SoldItems({
      fromDate: from_date || null,
      toDate: to_date || null,
    });

    return successResponse(res, "Top 10 más vendidos obtenido correctamente", {
      items: data,
    });
  } catch (err) {
    next(err);
  }
};

/* Ítem más vendido hoy (real) */
export const iaTodayTop = async (req, res, next) => {
  try {
    const item = await getTodayTopItem();

    if (!item) {
      const error = new Error("No hay ventas registradas para hoy");
      error.status = 404;
      throw error;
    }

    return successResponse(res, "Producto más vendido hoy obtenido correctamente", {
      item,
    });
  } catch (err) {
    next(err);
  }
};

/* Top 10 demandados previstos (predict) */
export const iaTopPredicted = async (req, res, next) => {
  try {
    const { from_date, to_date } = req.query;

    const data = await getTop10Predicted({
      fromDate: from_date || null,
      toDate: to_date || null,
    });

    return successResponse(
      res,
      "Top 10 de productos previstos obtenido correctamente",
      { items: data }
    );
  } catch (err) {
    next(err);
  }
};

/* Top previstos por temporada */
export const iaSeasonTop = async (req, res, next) => {
  try {
    const { season } = req.query;

    if (!season) {
      const error = new Error("Debes especificar una temporada (season)");
      error.status = 400;
      throw error;
    }

    const validSeasons = ["spring", "summer", "fall", "winter"];
    if (!validSeasons.includes(season)) {
      const error = new Error(
        "La temporada debe ser una de: spring, summer, fall, winter"
      );
      error.status = 400;
      throw error;
    }

    const items = await getSeasonTopItems(season);

    if (!items || items.length === 0) {
      const error = new Error("No hay predicciones registradas para esta temporada");
      error.status = 404;
      throw error;
    }

    return successResponse(
      res,
      "Top de productos previstos por temporada obtenido correctamente",
      { items }
    );
  } catch (err) {
    next(err);
  }
};
