// src/context/AiContext.jsx
import { createContext, useState, useCallback, useMemo } from "react";
import {
  getTopSold,
  getTodayTop,
  getTopPredicted,
  getSeasonTop,
} from "../api/ai";

export const AiContext = createContext();

export function AiProvider({ children }) {
  const [topSold, setTopSold] = useState([]);
  const [todayTop, setTodayTop] = useState(null);
  const [topPredicted, setTopPredicted] = useState([]);
  const [seasonTop, setSeasonTop] = useState([]);
  const [seasonFilter, setSeasonFilter] = useState("winter");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const parseApiError = useCallback((err, fallback) => {
    const errorData = err?.response?.data || {};
    if (errorData.details && Array.isArray(errorData.details)) {
      const message = errorData.message || fallback;
      return { message, details: errorData.details };
    }
    const message = errorData.message || err.message || fallback;
    return { message };
  }, []);

  const fetchTopSold = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTopSold(params);
      const items =
        response.data?.items ||
        response.data?.data ||
        response.data ||
        [];
      const safeItems = Array.isArray(items) ? items : [];
      setTopSold(safeItems);
      return safeItems;
    } catch (err) {
      const parsed = parseApiError(err, "Error al cargar top de vendidos");
      setError(parsed.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [parseApiError]);

  const fetchTodayTop = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTodayTop();
      const item =
        response.data?.item ||
        response.data?.data ||
        response.data ||
        null;
      setTodayTop(item);
      return item;
    } catch (err) {
      const parsed = parseApiError(err, "Error al cargar producto más vendido hoy");
      setError(parsed.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [parseApiError]);

  const fetchTopPredicted = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTopPredicted(params);
      const items =
        response.data?.items ||
        response.data?.data ||
        response.data ||
        [];
      const safeItems = Array.isArray(items) ? items : [];
      setTopPredicted(safeItems);
      return safeItems;
    } catch (err) {
      const parsed = parseApiError(err, "Error al cargar top previsto");
      setError(parsed.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [parseApiError]);

  const fetchSeasonTop = useCallback(async (season = seasonFilter, params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSeasonTop(season, params);
      const items =
        response.data?.items ||
        response.data?.data ||
        response.data ||
        [];
      const safeItems = Array.isArray(items) ? items : [];
      setSeasonFilter(season);
      setSeasonTop(safeItems);
      return safeItems;
    } catch (err) {
      const parsed = parseApiError(err, "Error al cargar top por temporada");
      setError(parsed.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [parseApiError, seasonFilter]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      topSold,
      todayTop,
      topPredicted,
      seasonTop,
      seasonFilter,
      loading,
      error,
      fetchTopSold,
      fetchTodayTop,
      fetchTopPredicted,
      fetchSeasonTop,
      clearError,
    }),
    [
      topSold,
      todayTop,
      topPredicted,
      seasonTop,
      seasonFilter,
      loading,
      error,
      fetchTopSold,
      fetchTodayTop,
      fetchTopPredicted,
      fetchSeasonTop,
      clearError,
    ]
  );

  return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
}
