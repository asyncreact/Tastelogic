// api/tables.js

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// ============================================================
// 🗂️ ZONAS DEL RESTAURANTE
// ============================================================

export const getZones = (token) =>
  axios.get(`${API_URL}/tables/zones`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getZone = (id, token) =>
  axios.get(`${API_URL}/tables/zones/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const createZone = (data, token) =>
  axios.post(`${API_URL}/tables/zones`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const updateZone = (id, data, token) =>
  axios.put(`${API_URL}/tables/zones/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const deleteZone = (id, token) =>
  axios.delete(`${API_URL}/tables/zones/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

// ============================================================
// 🪑 MESAS DEL RESTAURANTE
// ============================================================

export const getTables = (token) =>
  axios.get(`${API_URL}/tables`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getTable = (id, token) =>
  axios.get(`${API_URL}/tables/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const createTable = (data, token) =>
  axios.post(`${API_URL}/tables`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const updateTable = (id, data, token) =>
  axios.put(`${API_URL}/tables/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const deleteTable = (id, token) =>
  axios.delete(`${API_URL}/tables/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

// ============================================================
// 📸 SUBIR IMAGEN PARA ZONAS
// ============================================================

/**
 * Sube una imagen para una zona
 * @param {File} file - Archivo de imagen
 * @param {string} token - Token de autenticación
 * @returns {Promise} - Respuesta con URL de la imagen subida
 */
export const uploadZoneImage = (file, token) => {
  const formData = new FormData();
  formData.append("image", file);

  return axios.post(`${API_URL}/tables/zones/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};
