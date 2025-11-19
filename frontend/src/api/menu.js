// src/api/menu.js
import api from './auth';

// ============================================================
// 📁 CATEGORÍAS
// ============================================================

export const getCategories = () => api.get('/menu/categories');
export const getCategory = (categoryId) => api.get(`/menu/categories/${categoryId}`);
export const createCategory = (data) => api.post('/menu/categories', data);
export const updateCategory = (categoryId, data) => api.put(`/menu/categories/${categoryId}`, data);
export const deleteCategory = (categoryId) => api.delete(`/menu/categories/${categoryId}`);

// ============================================================
// 🍽️ ITEMS (Platos)
// ============================================================

export const getMenuItems = () => api.get('/menu/items');
export const getMenuItem = (itemId) => api.get(`/menu/items/${itemId}`);
export const createMenuItem = (data) => {
  // Si data contiene una imagen, usar FormData
  if (data.image instanceof File) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.post('/menu/items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return api.post('/menu/items', data);
};
export const updateMenuItem = (itemId, data) => {
  if (data.image instanceof File) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.put(`/menu/items/${itemId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return api.put(`/menu/items/${itemId}`, data);
};
export const deleteMenuItem = (itemId) => api.delete(`/menu/items/${itemId}`);
