// context/TableContext.jsx

import { createContext, useState, useEffect } from "react";
import {
  getZones,
  getZone,
  createZone,
  updateZone,
  deleteZone,
  getTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  getTableStats,
} from "../api/tables";

export const TableContext = createContext(null);

export const TableProvider = ({ children }) => {
  // Estado
  const [zones, setZones] = useState([]);
  const [tables, setTables] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar zonas, mesas y estadísticas al iniciar
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [zonesRes, tablesRes, statsRes] = await Promise.all([
          getZones(),
          getTables(),
          getTableStats(),
        ]);

        const zonesData =
          zonesRes.data?.data?.zones || zonesRes.data?.zones || [];
        const tablesData =
          tablesRes.data?.data?.tables || tablesRes.data?.tables || [];
        const statsData =
          statsRes.data?.data?.statistics ||
          statsRes.data?.statistics ||
          statsRes.data ||
          null;

        setZones(zonesData);
        setTables(tablesData);
        setStats(statsData);
      } catch (err) {
        console.error("Error al cargar datos de mesas:", err);
        setError("Error al cargar zonas y mesas");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // ============================================================
  // 🏢 ZONAS
  // ============================================================

  const fetchZones = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await getZones();
      const zonesData =
        response.data?.data?.zones || response.data?.zones || [];
      setZones(zonesData);
      return { success: true, data: zonesData };
    } catch (err) {
      const errorData = err.response?.data || {};
      const message =
        errorData.message || err.message || "Error al obtener zonas";
      setError(message);
      throw { message };
    } finally {
      setLoading(false);
    }
  };

  const fetchZone = async (zoneId) => {
    try {
      setError(null);
      const response = await getZone(zoneId);
      const zoneData = response.data?.data?.zone || response.data?.zone;
      return { success: true, data: zoneData };
    } catch (err) {
      const errorData = err.response?.data || {};
      const message =
        errorData.message || err.message || "Error al obtener zona";
      setError(message);
      throw { message };
    }
  };

  const addZone = async (data) => {
    try {
      setError(null);
      const response = await createZone(data);
      const zoneData = response.data?.data?.zone || response.data?.zone;
      const message = response.data?.message || "Zona creada exitosamente";

      setZones((prev) => [...prev, zoneData]);

      return {
        success: true,
        message,
        data: zoneData,
      };
    } catch (err) {
      const errorData = err.response?.data || {};
      if (errorData.details && Array.isArray(errorData.details)) {
        const errorMessage = errorData.message || "Errores de validación";
        setError(errorMessage);
        throw {
          message: errorMessage,
          details: errorData.details,
        };
      }

      const message =
        errorData.message || err.message || "Error al crear zona";
      setError(message);
      throw { message };
    }
  };

  const editZone = async (zoneId, data) => {
    try {
      setError(null);
      const response = await updateZone(zoneId, data);
      const zoneData = response.data?.data?.zone || response.data?.zone;
      const message =
        response.data?.message || "Zona actualizada exitosamente";

      setZones((prev) =>
        prev.map((zone) => (zone.id === zoneId ? zoneData : zone))
      );

      return {
        success: true,
        message,
        data: zoneData,
      };
    } catch (err) {
      const errorData = err.response?.data || {};
      if (errorData.details && Array.isArray(errorData.details)) {
        const errorMessage = errorData.message || "Errores de validación";
        setError(errorMessage);
        throw {
          message: errorMessage,
          details: errorData.details,
        };
      }

      const message =
        errorData.message || err.message || "Error al actualizar zona";
      setError(message);
      throw { message };
    }
  };

  const removeZone = async (zoneId) => {
    try {
      setError(null);
      const response = await deleteZone(zoneId);
      const message =
        response.data?.message || "Zona eliminada exitosamente";

      setZones((prev) => prev.filter((zone) => zone.id !== zoneId));

      return { success: true, message };
    } catch (err) {
      const errorData = err.response?.data || {};
      const message =
        errorData.message || err.message || "Error al eliminar zona";
      setError(message);
      throw { message };
    }
  };

  // ============================================================
  // 🪑 MESAS
  // ============================================================

  const fetchTables = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await getTables();
      const tablesData =
        response.data?.data?.tables || response.data?.tables || [];
      setTables(tablesData);
      return { success: true, data: tablesData };
    } catch (err) {
      const errorData = err.response?.data || {};
      const message =
        errorData.message || err.message || "Error al obtener mesas";
      setError(message);
      throw { message };
    } finally {
      setLoading(false);
    }
  };

  const fetchTable = async (tableId) => {
    try {
      setError(null);
      const response = await getTable(tableId);
      const tableData = response.data?.data?.table || response.data?.table;
      return { success: true, data: tableData };
    } catch (err) {
      const errorData = err.response?.data || {};
      const message =
        errorData.message || err.message || "Error al obtener mesa";
      setError(message);
      throw { message };
    }
  };

  const addTable = async (data) => {
    try {
      setError(null);
      const response = await createTable(data);
      const tableData = response.data?.data?.table || response.data?.table;
      const message = response.data?.message || "Mesa creada exitosamente";

      setTables((prev) => [...prev, tableData]);

      return {
        success: true,
        message,
        data: tableData,
      };
    } catch (err) {
      const errorData = err.response?.data || {};
      if (errorData.details && Array.isArray(errorData.details)) {
        const errorMessage = errorData.message || "Errores de validación";
        setError(errorMessage);
        throw {
          message: errorMessage,
          details: errorData.details,
        };
      }

      const message =
        errorData.message || err.message || "Error al crear mesa";
      setError(message);
      throw { message };
    }
  };

  const editTable = async (tableId, data) => {
    try {
      setError(null);
      const response = await updateTable(tableId, data);
      const tableData = response.data?.data?.table || response.data?.table;
      const message =
        response.data?.message || "Mesa actualizada exitosamente";

      setTables((prev) =>
        prev.map((table) => (table.id === tableId ? tableData : table))
      );

      return {
        success: true,
        message,
        data: tableData,
      };
    } catch (err) {
      const errorData = err.response?.data || {};
      if (errorData.details && Array.isArray(errorData.details)) {
        const errorMessage = errorData.message || "Errores de validación";
        setError(errorMessage);
        throw {
          message: errorMessage,
          details: errorData.details,
        };
      }

      const message =
        errorData.message || err.message || "Error al actualizar mesa";
      setError(message);
      throw { message };
    }
  };

  const removeTable = async (tableId) => {
    try {
      setError(null);
      const response = await deleteTable(tableId);
      const message =
        response.data?.message || "Mesa eliminada exitosamente";

      setTables((prev) => prev.filter((table) => table.id !== tableId));

      return { success: true, message };
    } catch (err) {
      const errorData = err.response?.data || {};
      const message =
        errorData.message || err.message || "Error al eliminar mesa";
      setError(message);
      throw { message };
    }
  };

  // ============================================================
  // 📊 ESTADÍSTICAS
  // ============================================================

  const fetchTableStatistics = async () => {
    try {
      setError(null);
      const response = await getTableStats();
      const statsData =
        response.data?.data?.statistics ||
        response.data?.statistics ||
        response.data ||
        null;
      setStats(statsData);
      return { success: true, data: statsData };
    } catch (err) {
      const errorData = err.response?.data || {};
      const message =
        errorData.message || err.message || "Error al obtener estadísticas";
      setError(message);
      throw { message };
    }
  };

  // ============================================================
  // 🔧 Utilidades
  // ============================================================

  const clearError = () => setError(null);

  const value = {
    // Estado
    zones,
    tables,
    stats,
    loading,
    error,

    // Zonas
    fetchZones,
    fetchZone,
    addZone,
    editZone,
    removeZone,

    // Mesas
    fetchTables,
    fetchTable,
    addTable,
    editTable,
    removeTable,

    // Estadísticas
    fetchTableStatistics,

    // Utilidades
    clearError,
  };

  return (
    <TableContext.Provider value={value}>
      {children}
    </TableContext.Provider>
  );
};
