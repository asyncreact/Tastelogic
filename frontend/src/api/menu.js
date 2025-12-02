// src/api/menu.js
import api from './auth';

/* Obtener todas las categorías */
export const getCategories = () => api.get('/menu/categories');

/* Obtener una categoría por ID */
export const getCategory = (categoryId) => api.get(`/menu/categories/${categoryId}`);

/* Crear categoría */
export const createCategory = (data) => api.post('/menu/categories', data);

/* Actualizar categoría */
export const updateCategory = (categoryId, data) => api.put(`/menu/categories/${categoryId}`, data);

/* Eliminar categoría */
export const deleteCategory = (categoryId) => api.delete(`/menu/categories/${categoryId}`);

/* Obtener todos los ítems */
export const getMenuItems = () => api.get('/menu/items');

/* Obtener un ítem por ID */
export const getMenuItem = (itemId) => api.get(`/menu/items/${itemId}`);

/* Crear ítem con soporte para FormData */
export const createMenuItem = (data) => {
  if (data.image instanceof File) {
    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    return api.post('/menu/items', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  return api.post('/menu/items', data);
};

/* Actualizar ítem con soporte para FormData */
export const updateMenuItem = (itemId, data) => {
  if (data.image instanceof File) {
    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    return api.put(`/menu/items/${itemId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  return api.put(`/menu/items/${itemId}`, data);
};

/* Eliminar ítem */
export const deleteMenuItem = (itemId) => api.delete(`/menu/items/${itemId}`);
