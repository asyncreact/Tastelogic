// src/api/reservations.js
import api from './auth';

/* Listar reservas */
export const getReservations = (params = {}) =>
  api.get('/reservations', { params });

/* Obtener una reserva por ID */
export const getReservation = (reservationId) =>
  api.get(`/reservations/${reservationId}`);

/* Crear reserva */
export const createReservation = (data) =>
  api.post('/reservations', data);

/* Actualizar reserva */
export const updateReservation = (reservationId, data) =>
  api.put(`/reservations/${reservationId}`, data);

/* Actualizar estado de reserva */
export const updateReservationStatus = (reservationId, status) =>
  api.patch(`/reservations/${reservationId}/status`, { status });

/* Cancelar reserva */
export const cancelReservation = (reservationId) =>
  api.patch(`/reservations/${reservationId}/cancel`);

/* Eliminar reserva */
export const deleteReservation = (reservationId) =>
  api.delete(`/reservations/${reservationId}`);

/* Verificar disponibilidad */
export const checkAvailability = (data) =>
  api.post('/reservations/public/check-availability', data);

/* Obtener mesas disponibles */
export const getAvailableTables = (params = {}) =>
  api.get('/reservations/public/available-tables', { params });

/* Obtener reserva activa del usuario */
export const getMyActiveReservation = () =>
  api.get('/reservations/me/active');
