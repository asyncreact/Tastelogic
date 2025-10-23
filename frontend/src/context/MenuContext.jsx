// context/MenuContext.jsx

import { createContext, useState, useEffect, useMemo } from 'react';
import { getPublicItems, getPublicCategories } from '../api/menu';

export const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos del menú al montar
  useEffect(() => {
    const fetchMenuData = async () => {
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
        console.error('Error al cargar el menú:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  // Refrescar menú manualmente
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
    } finally {
      setLoading(false);
    }
  };

  // Filtrar items por categoría
  const getItemsByCategory = (categoryId) => {
    return items.filter(item => item.category_id === categoryId);
  };

  // Obtener categoría por ID
  const getCategoryById = (categoryId) => {
    return categories.find(category => category.id === categoryId);
  };

  // Obtener item por ID
  const getItemById = (itemId) => {
    return items.find(item => item.id === itemId);
  };

  // Filtrar items disponibles
  const getAvailableItems = () => {
    return items.filter(item => item.is_available);
  };

  // Memoizar el valor del contexto para optimizar rendimiento
  const value = useMemo(() => ({
    items,
    categories,
    loading,
    error,
    refreshMenu,
    getItemsByCategory,
    getCategoryById,
    getItemById,
    getAvailableItems,
  }), [items, categories, loading, error]);

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};
