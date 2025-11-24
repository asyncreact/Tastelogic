// src/context/ReservationContext.jsx
import { createContext, useState } from 'react';
import {
  getReservations,
  getReservation,
  createReservation,
  updateReservation,
  updateReservationStatus,
  cancelReservation,
  deleteReservation,
  checkAvailability,
  getAvailableTables,
  getReservationStats,
  getReservationStatsByDate,
  getReservationStatsByZone,
  getReservationStatsByStatus,
} from '../api/reservations';

export const ReservationContext = createContext();

export function ReservationProvider({ children }) {
  const [reservations, setReservations] = useState([]);
  const [currentReservation, setCurrentReservation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Obtener todas las reservas
  const fetchReservations = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getReservations(params);
      setReservations(response.data?.reservations || response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar reservas');
      console.error('Error fetchReservations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener una reserva específica
  const fetchReservation = async (reservationId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getReservation(reservationId);
      const reservationData = response.data?.reservation || response.data?.data || response.data;
      setCurrentReservation(reservationData);
      return reservationData;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar reserva');
      console.error('Error fetchReservation:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva reserva
  const addReservation = async (reservationData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createReservation(reservationData);
      const newReservation = response.data?.reservation || response.data?.data;
      setReservations((prev) => [newReservation, ...prev]);
      return newReservation;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear reserva');
      console.error('Error addReservation:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar reserva
  const editReservation = async (reservationId, reservationData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateReservation(reservationId, reservationData);
      const updatedReservation = response.data?.reservation || response.data?.data;
      setReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? updatedReservation : r))
      );
      if (currentReservation?.id === reservationId) {
        setCurrentReservation(updatedReservation);
      }
      return updatedReservation;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar reserva');
      console.error('Error editReservation:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de reserva (admin)
  const changeReservationStatus = async (reservationId, status) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateReservationStatus(reservationId, status);
      const updatedReservation = response.data?.reservation || response.data?.data;
      setReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? updatedReservation : r))
      );
      if (currentReservation?.id === reservationId) {
        setCurrentReservation(updatedReservation);
      }
      return updatedReservation;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar estado');
      console.error('Error changeReservationStatus:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancelar reserva
  const removeReservation = async (reservationId) => {
    try {
      setLoading(true);
      setError(null);
      await cancelReservation(reservationId);
      await fetchReservations(); // Recargar lista
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cancelar reserva');
      console.error('Error removeReservation:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar reserva (solo admin)
  const deleteReservationById = async (reservationId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteReservation(reservationId);
      setReservations((prev) => prev.filter((r) => r.id !== reservationId));
      if (currentReservation?.id === reservationId) {
        setCurrentReservation(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar reserva');
      console.error('Error deleteReservationById:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verificar disponibilidad
  const verifyAvailability = async (data) => {
    try {
      const response = await checkAvailability(data);
      return response.data;
    } catch (err) {
      console.error('Error verifyAvailability:', err);
      throw err;
    }
  };

  // Obtener mesas disponibles
  const fetchAvailableTables = async (params) => {
    try {
      const response = await getAvailableTables(params);
      return response.data?.tables || response.data?.data || [];
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar mesas disponibles');
      console.error('Error fetchAvailableTables:', err);
      throw err;
    }
  };

  // Obtener estadísticas generales (admin)
  const fetchReservationStats = async () => {
    try {
      setLoading(true);
      const response = await getReservationStats();
      setStats(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar estadísticas');
      console.error('Error fetchReservationStats:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener estadísticas por fecha (admin)
  const fetchStatsByDate = async (params) => {
    try {
      const response = await getReservationStatsByDate(params);
      return response.data;
    } catch (err) {
      console.error('Error fetchStatsByDate:', err);
      throw err;
    }
  };

  // Obtener estadísticas por zona (admin)
  const fetchStatsByZone = async () => {
    try {
      const response = await getReservationStatsByZone();
      return response.data;
    } catch (err) {
      console.error('Error fetchStatsByZone:', err);
      throw err;
    }
  };

  // Obtener estadísticas por estado (admin)
  const fetchStatsByStatus = async () => {
    try {
      const response = await getReservationStatsByStatus();
      return response.data;
    } catch (err) {
      console.error('Error fetchStatsByStatus:', err);
      throw err;
    }
  };

  // Limpiar error
  const clearError = () => setError(null);

  const value = {
    // Estado
    reservations,
    currentReservation,
    loading,
    error,
    stats,

    // Funciones de reservas
    fetchReservations,
    fetchReservation,
    addReservation,
    editReservation,
    changeReservationStatus,
    removeReservation,
    deleteReservationById,

    // Disponibilidad
    verifyAvailability,
    fetchAvailableTables,

    // Estadísticas (admin)
    fetchReservationStats,
    fetchStatsByDate,
    fetchStatsByZone,
    fetchStatsByStatus,

    // Utilidades
    clearError,
  };

  return <ReservationContext.Provider value={value}>{children}</ReservationContext.Provider>;
}
