// context/MenuContext.jsx

import { createContext, useState, useEffect, useMemo } from 'react';
import { 
  getPublicItems, 
  getPublicCategories,
  getItemPrepTime,
  getAllItemsPrepTimes 
} from '../api/menu';

export const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [prepTimes, setPrepTimes] = useState({}); // 🆕 Tiempos de preparación
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Cargar datos del menú al montar
   */
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        const [itemsRes, categoriesRes] = await Promise.all([
          getPublicItems(),
          getPublicCategories()
        ]);
        
        // ✅ Manejo correcto de respuestas
        const itemsData = itemsRes.data.data?.items || itemsRes.data.items || [];
        const categoriesData = categoriesRes.data.data?.categories || categoriesRes.data.categories || [];
        
        setItems(itemsData);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error al cargar el menú:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  /**
   * Refrescar menú manualmente
   */
  const refreshMenu = async () => {
    try {
      setLoading(true);
      const [itemsRes, categoriesRes] = await Promise.all([
        getPublicItems(),
        getPublicCategories()
      ]);
      
      // ✅ Manejo correcto de respuestas
      setItems(itemsRes.data.data?.items || itemsRes.data.items || []);
      setCategories(categoriesRes.data.data?.categories || categoriesRes.data.categories || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error al refrescar el menú:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener tiempo de preparación de un plato específico
   * @param {string} itemId - ID del plato
   * @param {string} token - Token de autenticación (opcional)
   */
  const fetchItemPrepTime = async (itemId, token = null) => {
    try {
      if (!token) {
        console.warn('Token requerido para obtener tiempo de preparación');
        return null;
      }
      
      const res = await getItemPrepTime(itemId, token);
      const prepTimeData = res.data.data || res.data;
      
      // Actualizar el estado
      setPrepTimes(prev => ({
        ...prev,
        [itemId]: prepTimeData
      }));
      
      return prepTimeData;
    } catch (err) {
      console.error(`Error al obtener tiempo de preparación para ${itemId}:`, err);
      return null;
    }
  };

  /**
   * Obtener todos los tiempos de preparación (solo admin)
   * @param {string} token - Token de autenticación
   */
  const fetchAllPrepTimes = async (token) => {
    try {
      if (!token) {
        console.warn('Token requerido para obtener tiempos de preparación');
        return null;
      }
      
      const res = await getAllItemsPrepTimes(token);
      const allPrepTimesData = res.data.data || res.data;
      
      // Construir objeto con tiempos indexados por ID
      const prepTimesMap = {};
      if (Array.isArray(allPrepTimesData)) {
        allPrepTimesData.forEach(pt => {
          prepTimesMap[pt.item_id] = pt;
        });
      }
      
      setPrepTimes(prepTimesMap);
      return allPrepTimesData;
    } catch (err) {
      console.error('Error al obtener todos los tiempos de preparación:', err);
      return null;
    }
  };

  /**
   * Obtener tiempo de preparación de un item (desde caché si existe)
   * @param {string} itemId - ID del plato
   */
  const getPrepTime = (itemId) => {
    return prepTimes[itemId] || null;
  };

  /**
   * Filtrar items por categoría
   */
  const getItemsByCategory = (categoryId) => {
    return items.filter(item => item.category_id === categoryId);
  };

  /**
   * Obtener categoría por ID
   */
  const getCategoryById = (categoryId) => {
    return categories.find(category => category.id === categoryId);
  };

  /**
   * Obtener item por ID con su tiempo de preparación (si existe)
   */
  const getItemById = (itemId) => {
    const item = items.find(item => item.id === itemId);
    if (item && prepTimes[itemId]) {
      return {
        ...item,
        prepTime: prepTimes[itemId]
      };
    }
    return item;
  };

  /**
   * Filtrar items disponibles
   */
  const getAvailableItems = () => {
    return items.filter(item => item.is_available);
  };

  /**
   * Obtener items disponibles con sus tiempos de preparación
   */
  const getAvailableItemsWithPrepTime = () => {
    return getAvailableItems().map(item => ({
      ...item,
      prepTime: prepTimes[item.id] || null
    }));
  };

  /**
   * Limpiar caché de tiempos de preparación
   */
  const clearPrepTimesCache = () => {
    setPrepTimes({});
  };

  // Memoizar el valor del contexto para optimizar rendimiento
  const value = useMemo(() => ({
    // Estados
    items,
    categories,
    prepTimes,
    loading,
    error,
    
    // Métodos de menú
    refreshMenu,
    getItemsByCategory,
    getCategoryById,
    getItemById,
    getAvailableItems,
    
    // 🆕 Métodos de tiempos de preparación
    fetchItemPrepTime,
    fetchAllPrepTimes,
    getPrepTime,
    getAvailableItemsWithPrepTime,
    clearPrepTimesCache,
  }), [items, categories, prepTimes, loading, error]);

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};
