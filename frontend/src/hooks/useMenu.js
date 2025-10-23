// hooks/useMenu.js

import { useContext } from 'react';
import { MenuContext } from '../context/MenuContext';

/**
 * Custom hook para acceder al contexto del menú
 * @returns {Object} Datos y funciones del menú
 * @throws {Error} Si se usa fuera del MenuProvider
 */
export const useMenu = () => {
  const context = useContext(MenuContext);
  
  if (!context) {
    throw new Error('useMenu debe usarse dentro de un MenuProvider');
  }
  
  return context;
};
