// hooks/useTables.js

import { useContext } from 'react';
import { TablesContext } from '../context/TablesContext';

/**
 * Custom hook para acceder al contexto de mesas y zonas
 * @returns {Object} Datos y funciones de mesas y zonas
 * @throws {Error} Si se usa fuera del TablesProvider
 */
export const useTables = () => {
  const context = useContext(TablesContext);

  if (!context) {
    throw new Error('useTables debe usarse dentro de un TablesProvider');
  }

  return context;
};
