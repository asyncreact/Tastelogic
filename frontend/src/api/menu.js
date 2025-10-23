// api/menu.js

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// ============================================================
// 🌐 RUTAS PÚBLICAS (sin autenticación)
// ============================================================

/**
 * Obtiene todos los platos disponibles públicamente
 */
export const getPublicItems = () => 
  axios.get(`${API_URL}/menu/public/items`);

/**
 * Obtiene todas las categorías disponibles públicamente
 */
export const getPublicCategories = () => 
  axios.get(`${API_URL}/menu/public/categories`);

// ============================================================
// 🗂️ CATEGORÍAS (requieren autenticación)
// ============================================================

/**
 * Obtiene todas las categorías
 */
export const getCategories = (token) =>
  axios.get(`${API_URL}/menu/categories`, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

/**
 * Obtiene una categoría por ID
 */
export const getCategory = (id, token) =>
  axios.get(`${API_URL}/menu/categories/${id}`, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

/**
 * Crea una nueva categoría (solo admin)
 */
export const createCategory = (data, token) =>
  axios.post(`${API_URL}/menu/categories`, data, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

/**
 * Actualiza una categoría completa (solo admin)
 */
export const updateCategory = (id, data, token) =>
  axios.put(`${API_URL}/menu/categories/${id}`, data, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

/**
 * Actualiza parcialmente una categoría (solo admin)
 */
export const patchCategory = (id, data, token) =>
  axios.patch(`${API_URL}/menu/categories/${id}`, data, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

/**
 * Elimina una categoría (solo admin)
 */
export const deleteCategory = (id, token) =>
  axios.delete(`${API_URL}/menu/categories/${id}`, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

// ============================================================
// 🍽️ PLATOS DEL MENÚ (requieren autenticación)
// ============================================================

/**
 * Obtiene todos los platos
 */
export const getItems = (token) =>
  axios.get(`${API_URL}/menu/items`, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

/**
 * Obtiene un plato por ID
 */
export const getItem = (id, token) =>
  axios.get(`${API_URL}/menu/items/${id}`, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

/**
 * Crea un nuevo plato (solo admin)
 */
export const createItem = (data, token) =>
  axios.post(`${API_URL}/menu/items`, data, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

/**
 * Actualiza un plato completo (solo admin)
 */
export const updateItem = (id, data, token) =>
  axios.put(`${API_URL}/menu/items/${id}`, data, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

/**
 * Actualiza parcialmente un plato (solo admin)
 */
export const patchItem = (id, data, token) =>
  axios.patch(`${API_URL}/menu/items/${id}`, data, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

/**
 * Elimina un plato (solo admin)
 */
export const deleteItem = (id, token) =>
  axios.delete(`${API_URL}/menu/items/${id}`, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

// ============================================================
// 📸 SUBIR IMAGEN (solo admin)
// ============================================================

/**
 * Sube una imagen para el menú
 * @param {File} file - Archivo de imagen
 * @param {string} token - Token de autenticación
 * @returns {Promise} - Respuesta con URL de la imagen subida
 */
export const uploadImage = (file, token) => {
  const formData = new FormData();
  formData.append("image", file);
  
  return axios.post(`${API_URL}/menu/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};
