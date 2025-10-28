// context/TablesContext.jsx

import { createContext, useState, useMemo } from 'react';

export const TablesContext = createContext();

export const TablesProvider = ({ children }) => {
  const [zones, setZones] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para refrescar datos (será llamada desde los componentes cuando sea necesario)
  const refreshTables = async () => {
    // Esta función será implementada en los componentes que necesiten cargar datos
    // No cargamos datos automáticamente al montar el contexto
  };

  // Obtener mesas por zona
  const getTablesByZone = (zoneId) => {
    if (!zoneId) {
      return tables.filter(table => !table.zone_id);
    }
    return tables.filter(table => table.zone_id === zoneId);
  };

  // Obtener zona por ID
  const getZoneById = (zoneId) => {
    return zones.find(zone => zone.id === zoneId);
  };

  // Obtener mesa por ID
  const getTableById = (tableId) => {
    return tables.find(table => table.id === tableId);
  };

  // Filtrar mesas disponibles
  const getAvailableTables = () => {
    return tables.filter(table => table.status === 'available' && table.is_active);
  };

  // Filtrar mesas ocupadas
  const getOccupiedTables = () => {
    return tables.filter(table => table.status === 'occupied');
  };

  // Filtrar mesas reservadas
  const getReservedTables = () => {
    return tables.filter(table => table.status === 'reserved');
  };

  // Filtrar zonas activas
  const getActiveZones = () => {
    return zones.filter(zone => zone.is_active);
  };

  // Obtener estadísticas
  const getStatistics = () => {
    const totalTables = tables.length;
    const availableTables = tables.filter(t => t.status === 'available').length;
    const occupiedTables = tables.filter(t => t.status === 'occupied').length;
    const reservedTables = tables.filter(t => t.status === 'reserved').length;
    const totalCapacity = tables.reduce((sum, t) => sum + (t.capacity || 0), 0);

    return {
      totalTables,
      availableTables,
      occupiedTables,
      reservedTables,
      totalCapacity,
      occupancyRate: totalTables > 0 ? ((occupiedTables / totalTables) * 100).toFixed(1) : 0
    };
  };

  // Funciones para actualizar el estado (llamadas desde los componentes)
  const setZonesData = (data) => setZones(data);
  const setTablesData = (data) => setTables(data);
  const setLoadingState = (state) => setLoading(state);
  const setErrorState = (err) => setError(err);

  // Memoizar el valor del contexto para optimizar rendimiento
  const value = useMemo(() => ({
    zones,
    tables,
    loading,
    error,
    setZonesData,
    setTablesData,
    setLoadingState,
    setErrorState,
    refreshTables,
    getTablesByZone,
    getZoneById,
    getTableById,
    getAvailableTables,
    getOccupiedTables,
    getReservedTables,
    getActiveZones,
    getStatistics,
  }), [zones, tables, loading, error]);

  return (
    <TablesContext.Provider value={value}>
      {children}
    </TablesContext.Provider>
  );
};
