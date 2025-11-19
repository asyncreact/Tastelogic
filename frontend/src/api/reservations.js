// src/api/reservations.js
import api from './auth';

// ============================================================
// 📅 RESERVAS
// ============================================================

// Listar todas las reservas (Admin ve todas, Customer solo las suyas)
export const getReservations = (params = {}) => api.get('/reservations', { params });

// Obtener una reserva específica
export const getReservation = (reservationId) => api.get(`/reservations/${reservationId}`);

// Crear nueva reserva
export const createReservation = (data) => api.post('/reservations', data);

// Actualizar reserva
export const updateReservation = (reservationId, data) => api.put(`/reservations/${reservationId}`, data);

// Actualizar estado de la reserva (solo admin)
export const updateReservationStatus = (reservationId, status) => 
  api.patch(`/reservations/${reservationId}/status`, { status });

// Cancelar reserva
export const cancelReservation = (reservationId) => api.patch(`/reservations/${reservationId}/cancel`);

// Eliminar reserva (solo admin)
export const deleteReservation = (reservationId) => api.delete(`/reservations/${reservationId}`);

// ============================================================
// 🔍 DISPONIBILIDAD
// ============================================================

// Verificar disponibilidad (pública)
export const checkAvailability = (data) => api.post('/reservations/public/check-availability', data);

// Obtener mesas disponibles (pública)
export const getAvailableTables = (params = {}) => api.get('/reservations/public/available-tables', { params });

// ============================================================
// 📊 ESTADÍSTICAS (Solo Admin)
// ============================================================

export const getReservationStats = () => api.get('/reservations/statistics/general');
export const getReservationStatsByDate = (params) => api.get('/reservations/statistics/by-date', { params });
export const getReservationStatsByZone = () => api.get('/reservations/statistics/by-zone');
export const getReservationStatsByStatus = () => api.get('/reservations/statistics/by-status');
