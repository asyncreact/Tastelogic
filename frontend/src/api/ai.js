// src/api/ai.js
import api from './auth';

/* Top 10 más vendidos (reales) */
export const getTopSold = (params = {}) =>
  api.get('/ai/public/top-sold', { params });

/* Ítem más vendido hoy (real) */
export const getTodayTop = () =>
  api.get('/ai/public/today-top');

/* Top 10 demandados previstos */
export const getTopPredicted = (params = {}) =>
  api.get('/ai/public/top-predicted', { params });

/* Top previstos por temporada */
export const getSeasonTop = (season, params = {}) =>
  api.get('/ai/public/season-top', {
    params: { season, ...params },
  });
