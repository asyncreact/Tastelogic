// src/api/tables.js
import api from './auth';

/* Obtener zonas */
export const getZones = () => api.get('/zones');

/* Obtener zona por ID */
export const getZone = (zoneId) => api.get(`/zones/${zoneId}`);

/* Crear zona con soporte para FormData */
export const createZone = (data) => {
  if (data.image instanceof File) {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    return api.post('/zones', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return api.post('/zones', data);
};

/* Actualizar zona con soporte para FormData */
export const updateZone = (zoneId, data) => {
  if (data.image instanceof File) {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    return api.put(`/zones/${zoneId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return api.put(`/zones/${zoneId}`, data);
};

/* Eliminar zona */
export const deleteZone = (zoneId) => api.delete(`/zones/${zoneId}`);

/* Obtener mesas */
export const getTables = () => api.get('/tables');

/* Obtener mesa por ID */
export const getTable = (tableId) => api.get(`/tables/${tableId}`);

/* Crear mesa */
export const createTable = (data) => api.post('/tables', data);

/* Actualizar mesa */
export const updateTable = (tableId, data) => api.put(`/tables/${tableId}`, data);

/* Eliminar mesa */
export const deleteTable = (tableId) => api.delete(`/tables/${tableId}`);
