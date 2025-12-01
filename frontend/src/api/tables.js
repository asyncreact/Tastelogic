// src/api/tables.js
import api from './auth';

// 🏢 ZONAS
export const getZones = () => api.get('/zones');
export const getZone = (zoneId) => api.get(`/zones/${zoneId}`);

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

export const deleteZone = (zoneId) => api.delete(`/zones/${zoneId}`);

// 🪑 MESAS (igual que ya tienes)
export const getTables = () => api.get('/tables');
export const getTable = (tableId) => api.get(`/tables/${tableId}`);
export const createTable = (data) => api.post('/tables', data);
export const updateTable = (tableId, data) => api.put(`/tables/${tableId}`, data);
export const deleteTable = (tableId) => api.delete(`/tables/${tableId}`);
export const getTableStats = () => api.get('/tables/statistics');
