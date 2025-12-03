// src/context/ReservationContext.jsx
import { createContext, useState } from "react";
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
  getMyActiveReservation,
} from "../api/reservations";

export const ReservationContext = createContext();

export function ReservationProvider({ children }) {
  const [reservations, setReservations] = useState([]);
  const [currentReservation, setCurrentReservation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const parseApiError = (err, fallback) => {
    const status = err?.response?.status;
    const errorData = err?.response?.data || {};
    if (status === 401) {
      return { message: "Debes iniciar sesión para crear tu reserva." };
    }
    if (errorData.details && Array.isArray(errorData.details)) {
      const message = errorData.message || fallback;
      return { message, details: errorData.details };
    }
    const message = errorData.message || err.message || fallback;
    return { message };
  };

  const fetchReservations = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getReservations(params);
      setReservations(
        response.data?.reservations || response.data?.data || []
      );
    } catch (err) {
      const parsed = parseApiError(err, "Error al cargar reservas");
      setError(parsed.message);
      console.error("Error fetchReservations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservation = async (reservationId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getReservation(reservationId);
      const reservationData =
        response.data?.reservation || response.data?.data || response.data;
      setCurrentReservation(reservationData);
      return reservationData;
    } catch (err) {
      const parsed = parseApiError(err, "Error al cargar reserva");
      setError(parsed.message);
      console.error("Error fetchReservation:", err);
      throw parsed;
    } finally {
      setLoading(false);
    }
  };

  const fetchMyActiveReservation = async () => {
    try {
      const response = await getMyActiveReservation();
      const reservationData =
        response.data?.data || response.data?.reservation || response.data;
      return reservationData;
    } catch (err) {
      const parsed = parseApiError(
        err,
        "Error al cargar reserva activa para hoy"
      );
      console.error("Error fetchMyActiveReservation:", err);
      throw parsed;
    }
  };

  const addReservation = async (reservationData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createReservation(reservationData);
      const newReservation =
        response.data?.reservation || response.data?.data;
      setReservations((prev) => [newReservation, ...prev]);
      return {
        success: true,
        message: response.data?.message || "Reserva creada correctamente",
        reservation: newReservation,
      };
    } catch (err) {
      const parsed = parseApiError(err, "Error al crear reserva");
      setError(parsed.message);
      console.error("Error addReservation:", err);
      throw parsed;
    } finally {
      setLoading(false);
    }
  };

  const editReservation = async (reservationId, reservationData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateReservation(reservationId, reservationData);
      const updatedReservation =
        response.data?.reservation || response.data?.data;
      setReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? updatedReservation : r))
      );
      if (currentReservation?.id === reservationId) {
        setCurrentReservation(updatedReservation);
      }
      return {
        success: true,
        message:
          response.data?.message || "Reserva actualizada correctamente",
        reservation: updatedReservation,
      };
    } catch (err) {
      const parsed = parseApiError(err, "Error al actualizar reserva");
      setError(parsed.message);
      console.error("Error editReservation:", err);
      throw parsed;
    } finally {
      setLoading(false);
    }
  };

  const changeReservationStatus = async (reservationId, status) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateReservationStatus(reservationId, status);
      const updatedReservation =
        response.data?.reservation || response.data?.data;
      setReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? updatedReservation : r))
      );
      if (currentReservation?.id === reservationId) {
        setCurrentReservation(updatedReservation);
      }
      return {
        success: true,
        message:
          response.data?.message ||
          "Estado de la reserva actualizado",
        reservation: updatedReservation,
      };
    } catch (err) {
      const parsed = parseApiError(err, "Error al actualizar estado");
      setError(parsed.message);
      console.error("Error changeReservationStatus:", err);
      throw parsed;
    } finally {
      setLoading(false);
    }
  };

  const removeReservation = async (reservationId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await cancelReservation(reservationId);
      await fetchReservations();
      return {
        success: true,
        message:
          response.data?.message ||
          "Reserva cancelada correctamente",
      };
    } catch (err) {
      const parsed = parseApiError(err, "Error al cancelar reserva");
      setError(parsed.message);
      console.error("Error removeReservation:", err);
      throw parsed;
    } finally {
      setLoading(false);
    }
  };

  const deleteReservationById = async (reservationId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await deleteReservation(reservationId);
      setReservations((prev) =>
        prev.filter((r) => r.id !== reservationId)
      );
      if (currentReservation?.id === reservationId) {
        setCurrentReservation(null);
      }
      return {
        success: true,
        message:
          response.data?.message ||
          "Reserva eliminada correctamente",
      };
    } catch (err) {
      const parsed = parseApiError(err, "Error al eliminar reserva");
      setError(parsed.message);
      console.error("Error deleteReservationById:", err);
      throw parsed;
    } finally {
      setLoading(false);
    }
  };

  const verifyAvailability = async (data) => {
    try {
      const response = await checkAvailability(data);
      return response.data;
    } catch (err) {
      const parsed = parseApiError(err, "Error al verificar disponibilidad");
      console.error("Error verifyAvailability:", err);
      throw parsed;
    }
  };

  const fetchAvailableTables = async (params) => {
    try {
      const response = await getAvailableTables(params);
      return response.data?.tables || response.data?.data || [];
    } catch (err) {
      const parsed = parseApiError(
        err,
        "Error al cargar mesas disponibles"
      );
      setError(parsed.message);
      console.error("Error fetchAvailableTables:", err);
      throw parsed;
    }
  };

  const clearError = () => setError(null);

  const value = {
    reservations,
    currentReservation,
    loading,
    error,
    fetchReservations,
    fetchReservation,
    addReservation,
    editReservation,
    changeReservationStatus,
    removeReservation,
    deleteReservationById,
    fetchMyActiveReservation,
    verifyAvailability,
    fetchAvailableTables,
    clearError,
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
}
