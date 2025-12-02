// context/MenuContext.jsx
import { createContext, useState, useEffect } from "react";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../api/menu";

export const MenuContext = createContext(null);

export const MenuProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* Cargar categorías e items al iniciar */
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [categoriesRes, itemsRes] = await Promise.all([
          getCategories(),
          getMenuItems(),
        ]);

        const categoriesData =
          categoriesRes.data?.data?.categories ||
          categoriesRes.data?.categories ||
          [];
        const itemsData =
          itemsRes.data?.data?.items || itemsRes.data?.items || [];

        setCategories(categoriesData);
        setItems(itemsData);
      } catch (err) {
        console.error("Error al cargar datos del menú:", err);
        setError("Error al cargar el menú");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  /* Obtener todas las categorías */
  const fetchCategories = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await getCategories();
      const categoriesData =
        response.data?.data?.categories ||
        response.data?.categories ||
        [];
      setCategories(categoriesData);
      return { success: true, data: categoriesData };
    } catch (err) {
      const errorData = err.response?.data || {};
      const message =
        errorData.message || err.message || "Error al obtener categorías";
      setError(message);
      throw { message };
    } finally {
      setLoading(false);
    }
  };

  /* Obtener una categoría por ID */
  const fetchCategory = async (categoryId) => {
    try {
      setError(null);
      const response = await getCategory(categoryId);
      const categoryData =
        response.data?.data?.category || response.data?.category;
      return { success: true, data: categoryData };
    } catch (err) {
      const errorData = err.response?.data || {};
      const message =
        errorData.message || err.message || "Error al obtener categoría";
      setError(message);
      throw { message };
    }
  };

  /* Crear categoría */
  const addCategory = async (data) => {
    try {
      setError(null);
      const response = await createCategory(data);

      const categoryData =
        response.data?.data?.category || response.data?.category;
      const message = response.data?.message || "Categoría creada exitosamente";

      setCategories((prev) => [...prev, categoryData]);

      return {
        success: true,
        message,
        data: categoryData,
      };
    } catch (err) {
      const errorData = err.response?.data || {};

      /* Manejo de errores de validación */
      if (errorData.details && Array.isArray(errorData.details)) {
        const errorMessage = errorData.message || "Errores de validación";
        setError(errorMessage);
        throw {
          message: errorMessage,
          details: errorData.details,
        };
      }

      const message =
        errorData.message || err.message || "Error al crear categoría";
      setError(message);
      throw { message };
    }
  };

  /* Actualizar categoría */
  const editCategory = async (categoryId, data) => {
    try {
      setError(null);
      const response = await updateCategory(categoryId, data);

      const categoryData =
        response.data?.data?.category || response.data?.category;
      const message =
        response.data?.message || "Categoría actualizada exitosamente";

      setCategories((prev) =>
        prev.map((cat) => (cat.id === categoryId ? categoryData : cat))
      );

      return {
        success: true,
        message,
        data: categoryData,
      };
    } catch (err) {
      const errorData = err.response?.data || {};

      /* Manejo de errores de validación */
      if (errorData.details && Array.isArray(errorData.details)) {
        const errorMessage = errorData.message || "Errores de validación";
        setError(errorMessage);
        throw {
          message: errorMessage,
          details: errorData.details,
        };
      }

      const message =
        errorData.message || err.message || "Error al actualizar categoría";
      setError(message);
      throw { message };
    }
  };

  /* Eliminar categoría */
  const removeCategory = async (categoryId) => {
    try {
      setError(null);
      const response = await deleteCategory(categoryId);
      const message =
        response.data?.message || "Categoría eliminada exitosamente";

      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));

      return { success: true, message };
    } catch (err) {
      const errorData = err.response?.data || {};
      const message =
        errorData.message || err.message || "Error al eliminar categoría";
      setError(message);
      throw { message };
    }
  };

  /* Obtener todos los items */
  const fetchItems = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await getMenuItems();
      const itemsData =
        response.data?.data?.items || response.data?.items || [];
      setItems(itemsData);
      return { success: true, data: itemsData };
    } catch (err) {
      const errorData = err.response?.data || {};
      const message =
        errorData.message || err.message || "Error al obtener items";
      setError(message);
      throw { message };
    } finally {
      setLoading(false);
    }
  };

  /* Obtener item por ID */
  const fetchItem = async (itemId) => {
    try {
      setError(null);
      const response = await getMenuItem(itemId);
      const itemData = response.data?.data?.item || response.data?.item;
      return { success: true, data: itemData };
    } catch (err) {
      const errorData = err.response?.data || {};
      const message =
        errorData.message || err.message || "Error al obtener item";
      setError(message);
      throw { message };
    }
  };

  /* Crear item */
  const addItem = async (data) => {
    try {
      setError(null);
      const response = await createMenuItem(data);

      const itemData = response.data?.data?.item || response.data?.item;
      const message = response.data?.message || "Item creado exitosamente";

      setItems((prev) => [...prev, itemData]);

      return {
        success: true,
        message,
        data: itemData,
      };
    } catch (err) {
      const errorData = err.response?.data || {};

      /* Manejo de errores de validación */
      if (errorData.details && Array.isArray(errorData.details)) {
        const errorMessage = errorData.message || "Errores de validación";
        setError(errorMessage);
        throw {
          message: errorMessage,
          details: errorData.details,
        };
      }

      const message =
        errorData.message || err.message || "Error al crear item";
      setError(message);
      throw { message };
    }
  };

  /* Actualizar item */
  const editItem = async (itemId, data) => {
    try {
      setError(null);
      const response = await updateMenuItem(itemId, data);

      const itemData = response.data?.data?.item || response.data?.item;
      const message =
        response.data?.message || "Item actualizado exitosamente";

      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? itemData : item))
      );

      return {
        success: true,
        message,
        data: itemData,
      };
    } catch (err) {
      const errorData = err.response?.data || {};

      /* Manejo de errores de validación */
      if (errorData.details && Array.isArray(errorData.details)) {
        const errorMessage = errorData.message || "Errores de validación";
        setError(errorMessage);
        throw {
          message: errorMessage,
          details: errorData.details,
        };
      }

      const message =
        errorData.message || err.message || "Error al actualizar item";
      setError(message);
      throw { message };
    }
  };

  /* Eliminar item */
  const removeItem = async (itemId) => {
    try {
      setError(null);
      const response = await deleteMenuItem(itemId);
      const message = response.data?.message || "Item eliminado exitosamente";

      setItems((prev) => prev.filter((item) => item.id !== itemId));

      return { success: true, message };
    } catch (err) {
      const errorData = err.response?.data || {};
      const message =
        errorData.message || err.message || "Error al eliminar item";
      setError(message);
      throw { message };
    }
  };

  /* Limpiar error almacenado */
  const clearError = () => {
    setError(null);
  };

  const value = {
    categories,
    items,
    loading,
    error,
    fetchCategories,
    fetchCategory,
    addCategory,
    editCategory,
    removeCategory,
    fetchItems,
    fetchItem,
    addItem,
    editItem,
    removeItem,
    clearError,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};
