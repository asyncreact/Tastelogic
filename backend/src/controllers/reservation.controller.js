// src/controllers/reservation.controller.js

import {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  updateReservationStatus,
  cancelReservation,
  deleteReservation,
  checkTableAvailability,
  getAvailableTablesByZone,
  getReservationStatistics,
  getReservationStatisticsByDate,
  getReservationStatisticsByZone,
  getReservationStatisticsByStatus,
} from "../repositories/reservation.repository.js";
import { getZoneById } from "../repositories/zone.repository.js";
import { getTableById, updateTableStatus } from "../repositories/table.repository.js";
import { getUserById } from "../repositories/user.repository.js";
import { successResponse } from "../utils/response.js";

/* RESERVAS */

/* Obtiene todas las reservas con filtros opcionales */
export const listReservations = async (req, res, next) => {
  try {
    const filters = {};

    // Customer solo ve sus propias reservas, admin puede filtrar por user_id
    if (req.user.role === "customer") {
      filters.user_id = req.user.id;
    } else {
      if (req.query.user_id) {
        filters.user_id = Number(req.query.user_id);
      }
    }

    if (req.query.zone_id) {
      filters.zone_id = Number(req.query.zone_id);
    }
    if (req.query.table_id) {
      filters.table_id = Number(req.query.table_id);
    }
    if (req.query.status) {
      filters.status = req.query.status;
    }
    if (req.query.reservation_date) {
      filters.reservation_date = req.query.reservation_date;
    }

    const reservations = await getReservations(filters);
    return successResponse(
      res,
      "Reservas obtenidas correctamente",
      {
        reservations,
        count: reservations.length,
      }
    );
  } catch (err) {
    next(err);
  }
};

/* Obtiene una reserva específica por ID */
export const showReservation = async (req, res, next) => {
  try {
    const reservation_id = Number(req.params.reservation_id);
    
    if (isNaN(reservation_id) || reservation_id <= 0) {
      const error = new Error("No se pudo encontrar la reserva solicitada");
      error.status = 400;
      throw error;
    }

    const reservation = await getReservationById(reservation_id);
    
    if (!reservation) {
      const error = new Error("No encontramos tu reserva. Por favor, verifica tus datos.");
      error.status = 404;
      throw error;
    }

    // Customer solo puede ver sus propias reservas
    if (req.user.role === "customer" && reservation.user_id !== req.user.id) {
      const error = new Error("No tienes permiso para ver esta reserva");
      error.status = 403;
      throw error;
    }

    return successResponse(
      res,
      "Reserva encontrada",
      { reservation }
    );
  } catch (err) {
    next(err);
  }
};

/* Obtiene mesas disponibles por zona */
export const getAvailableTables = async (req, res, next) => {
  try {
    const { zone_id, guest_count } = req.query;
    
    if (!zone_id || !guest_count) {
      const error = new Error("Por favor, selecciona una zona y el número de personas");
      error.status = 400;
      throw error;
    }

    const validatedGuestCount = Number(guest_count);
    if (isNaN(validatedGuestCount) || validatedGuestCount < 1 || validatedGuestCount > 50) {
      const error = new Error("El número de personas debe estar entre 1 y 50");
      error.status = 400;
      throw error;
    }

    const zone = await getZoneById(Number(zone_id));
    if (!zone) {
      const error = new Error("La zona seleccionada no está disponible");
      error.status = 404;
      throw error;
    }

    const availableTables = await getAvailableTablesByZone(
      Number(zone_id),
      validatedGuestCount
    );

    if (availableTables.length === 0) {
      return successResponse(
        res,
        `Lo sentimos, no hay mesas disponibles en ${zone.name} para ${validatedGuestCount} persona${validatedGuestCount > 1 ? 's' : ''}`,
        { tables: [], count: 0, zone_name: zone.name }
      );
    }

    return successResponse(
      res,
      `Tenemos ${availableTables.length} mesa${availableTables.length > 1 ? 's' : ''} disponible${availableTables.length > 1 ? 's' : ''} en ${zone.name}`,
      {
        tables: availableTables,
        count: availableTables.length,
        zone_name: zone.name,
      }
    );
  } catch (err) {
    next(err);
  }
};

/* Verifica disponibilidad de una mesa específica */
export const checkAvailability = async (req, res, next) => {
  try {
    const { table_id, reservation_date, reservation_time } = req.body;
    
    if (!table_id || !reservation_date || !reservation_time) {
      const error = new Error("Por favor, completa todos los campos: mesa, fecha y hora");
      error.status = 400;
      throw error;
    }

    const table = await getTableById(Number(table_id));
    if (!table) {
      const error = new Error("La mesa seleccionada no está disponible");
      error.status = 404;
      throw error;
    }

    const availability = await checkTableAvailability(
      Number(table_id),
      reservation_date,
      reservation_time
    );

    const dateObj = new Date(reservation_date);
    const formattedDate = dateObj.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const message = availability.available
      ? `¡Perfecto! La mesa ${table.table_number} está disponible para el ${formattedDate} a las ${reservation_time}`
      : `Lo sentimos, la mesa ${table.table_number} ya está reservada para esa fecha y hora. Por favor, elige otro horario.`;

    return successResponse(res, message, {
      available: availability.available,
      table_number: table.table_number,
      table_capacity: table.capacity,
      conflict: availability.conflict,
    });
  } catch (err) {
    next(err);
  }
};

/* Crea una nueva reserva */
export const addReservation = async (req, res, next) => {
  try {
    const {
      zone_id,
      table_id,
      reservation_date,
      reservation_time,
      guest_count,
      status,
      special_requirements,
    } = req.body;

    // Customer crea reservas para sí mismo, admin puede crear para otros
    let user_id;
    if (req.user.role === "customer") {
      user_id = req.user.id;
    } else {
      user_id = req.body.user_id || req.user.id;
    }

    // Validación de campos requeridos
    const missingFields = [];
    if (!zone_id) missingFields.push("zona");
    if (!table_id) missingFields.push("mesa");
    if (!reservation_date) missingFields.push("fecha");
    if (!reservation_time) missingFields.push("hora");
    if (!guest_count) missingFields.push("número de personas");

    if (missingFields.length > 0) {
      const error = new Error(`Por favor, completa los siguientes campos: ${missingFields.join(", ")}`);
      error.status = 400;
      throw error;
    }

    const user = await getUserById(Number(user_id));
    if (!user) {
      const error = new Error("Tu cuenta no está registrada. Por favor, inicia sesión nuevamente.");
      error.status = 404;
      throw error;
    }

    const zone = await getZoneById(Number(zone_id));
    if (!zone) {
      const error = new Error("La zona seleccionada no está disponible");
      error.status = 404;
      throw error;
    }

    const table = await getTableById(Number(table_id));
    if (!table) {
      const error = new Error("La mesa seleccionada no está disponible");
      error.status = 404;
      throw error;
    }

    if (guest_count > table.capacity) {
      const error = new Error(
        `Lo sentimos, la mesa ${table.table_number} tiene capacidad para ${table.capacity} persona${table.capacity > 1 ? 's' : ''}, pero seleccionaste ${guest_count} persona${guest_count > 1 ? 's' : ''}. Por favor, elige una mesa más grande.`
      );
      error.status = 400;
      throw error;
    }

    const availability = await checkTableAvailability(
      Number(table_id),
      reservation_date,
      reservation_time
    );

    if (!availability.available) {
      const dateObj = new Date(reservation_date);
      const formattedDate = dateObj.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });

      const error = new Error(
        `Lo sentimos, la mesa ${table.table_number} ya está reservada para el ${formattedDate} a las ${reservation_time}. Por favor, elige otro horario o mesa.`
      );
      error.status = 409;
      throw error;
    }

    const reservation_data = {
      user_id: Number(user_id),
      zone_id: Number(zone_id),
      table_id: Number(table_id),
      reservation_date,
      reservation_time,
      guest_count: Number(guest_count),
      ...(status && req.user.role === "admin" && { status }),
      ...(special_requirements && { special_requirements }),
    };

    const reservation = await createReservation(reservation_data);
    
    const dateObj = new Date(reservation_date);
    const formattedDate = dateObj.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });

    return successResponse(
      res,
      `¡Reserva confirmada! Mesa ${table.table_number} en ${zone.name} para el ${formattedDate} a las ${reservation_time}`,
      { 
        reservation,
        details: {
          table_number: table.table_number,
          zone_name: zone.name,
          date: formattedDate,
          time: reservation_time,
          guests: guest_count
        }
      },
      201
    );
  } catch (err) {
    next(err);
  }
};

/* Actualiza una reserva */
export const editReservation = async (req, res, next) => {
  try {
    const reservation_id = Number(req.params.reservation_id);
    
    if (isNaN(reservation_id) || reservation_id <= 0) {
      const error = new Error("No se pudo encontrar la reserva que deseas modificar");
      error.status = 400;
      throw error;
    }

    const existing = await getReservationById(reservation_id);
    if (!existing) {
      const error = new Error("No encontramos tu reserva. Por favor, verifica tus datos.");
      error.status = 404;
      throw error;
    }

    // Customer solo puede editar sus propias reservas
    if (req.user.role === "customer" && existing.user_id !== req.user.id) {
      const error = new Error("No tienes permiso para modificar esta reserva");
      error.status = 403;
      throw error;
    }

    // Validar cambio de usuario (solo admin)
    if (req.body.user_id && req.user.role !== "admin") {
      const error = new Error("No tienes permiso para cambiar el usuario de la reserva");
      error.status = 403;
      throw error;
    }

    if (req.body.user_id && req.body.user_id !== existing.user_id) {
      const user = await getUserById(Number(req.body.user_id));
      if (!user) {
        const error = new Error("El usuario especificado no está registrado");
        error.status = 404;
        throw error;
      }
    }

    let newZone = null;
    if (req.body.zone_id && req.body.zone_id !== existing.zone_id) {
      newZone = await getZoneById(Number(req.body.zone_id));
      if (!newZone) {
        const error = new Error("La zona seleccionada no está disponible");
        error.status = 404;
        throw error;
      }
    }

    let tableToValidate = null;
    let newTable = null;
    if (req.body.table_id && req.body.table_id !== existing.table_id) {
      newTable = await getTableById(Number(req.body.table_id));
      if (!newTable) {
        const error = new Error("La mesa seleccionada no está disponible");
        error.status = 404;
        throw error;
      }
      tableToValidate = newTable;
    } else if (req.body.table_id === existing.table_id) {
      const table = await getTableById(Number(existing.table_id));
      tableToValidate = table;
    }

    if (tableToValidate) {
      const guestCount = req.body.guest_count || existing.guest_count;
      if (guestCount > tableToValidate.capacity) {
        const error = new Error(
          `Lo sentimos, la mesa ${tableToValidate.table_number} tiene capacidad para ${tableToValidate.capacity} persona${tableToValidate.capacity > 1 ? 's' : ''}, pero seleccionaste ${guestCount} persona${guestCount > 1 ? 's' : ''}. Por favor, elige una mesa más grande.`
        );
        error.status = 400;
        throw error;
      }
    }

    if (req.body.guest_count && !req.body.table_id) {
      const currentTable = await getTableById(Number(existing.table_id));
      if (req.body.guest_count > currentTable.capacity) {
        const error = new Error(
          `Lo sentimos, la mesa ${currentTable.table_number} tiene capacidad para ${currentTable.capacity} persona${currentTable.capacity > 1 ? 's' : ''}, pero seleccionaste ${req.body.guest_count} persona${req.body.guest_count > 1 ? 's' : ''}. Por favor, elige una mesa más grande.`
        );
        error.status = 400;
        throw error;
      }
    }

    const statusNames = {
      pending: "pendiente",
      confirmed: "confirmada",
      completed: "completada",
      cancelled: "cancelada"
    };

    if (req.body.status !== undefined) {
      const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
      if (!validStatuses.includes(req.body.status)) {
        const error = new Error(
          `El estado seleccionado no es válido. Elige entre: ${Object.values(statusNames).join(", ")}`
        );
        error.status = 400;
        throw error;
      }
    }

    const update_data = {
      ...(req.body.zone_id && { zone_id: req.body.zone_id }),
      ...(req.body.table_id && { table_id: req.body.table_id }),
      ...(req.body.reservation_date && { reservation_date: req.body.reservation_date }),
      ...(req.body.reservation_time && { reservation_time: req.body.reservation_time }),
      ...(req.body.guest_count && { guest_count: req.body.guest_count }),
      ...(req.body.special_requirements !== undefined && { special_requirements: req.body.special_requirements }),
    };

    // Solo admin puede cambiar status y user_id
    if (req.user.role === "admin") {
      if (req.body.status !== undefined) update_data.status = req.body.status;
      if (req.body.user_id) update_data.user_id = req.body.user_id;
    }

    if (Object.keys(update_data).length === 0) {
      const error = new Error("No realizaste ningún cambio. Por favor, modifica al menos un campo.");
      error.status = 400;
      throw error;
    }

    const updated = await updateReservation(reservation_id, update_data);
    
    // ACTUALIZAR ESTADO DE MESA SI SE CAMBIÓ EL STATUS
    if (req.body.status && req.body.status !== existing.status) {
      if (req.body.status === "confirmed") {
        await updateTableStatus(updated.table_id, "reserved");
      } else if (req.body.status === "completed" || req.body.status === "cancelled") {
        await updateTableStatus(updated.table_id, "available");
      }
    }
    
    let message = "¡Reserva actualizada correctamente!";
    if (newTable && newZone) {
      message = `Tu reserva fue actualizada: Mesa ${newTable.table_number} en ${newZone.name}`;
    } else if (newTable) {
      message = `Tu reserva fue actualizada: Mesa ${newTable.table_number}`;
    } else if (newZone) {
      message = `Tu reserva fue actualizada: ${newZone.name}`;
    }
    
    return successResponse(
      res,
      message,
      { reservation: updated }
    );
  } catch (err) {
    next(err);
  }
};

/* Actualiza el estado de una reserva */
export const updateStatus = async (req, res, next) => {
  try {
    const reservation_id = Number(req.params.reservation_id);
    const { status } = req.body;

    if (isNaN(reservation_id) || reservation_id <= 0) {
      const error = new Error("No se pudo encontrar la reserva que deseas modificar");
      error.status = 400;
      throw error;
    }

    if (!status) {
      const error = new Error("Por favor, selecciona un estado para la reserva");
      error.status = 400;
      throw error;
    }

    const statusNames = {
      pending: "pendiente",
      confirmed: "confirmada",
      completed: "completada",
      cancelled: "cancelada"
    };

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      const error = new Error(
        `El estado seleccionado no es válido. Elige entre: ${Object.values(statusNames).join(", ")}`
      );
      error.status = 400;
      throw error;
    }

    const existing = await getReservationById(reservation_id);
    if (!existing) {
      const error = new Error("No encontramos tu reserva. Por favor, verifica tus datos.");
      error.status = 404;
      throw error;
    }

    if (existing.status === status) {
      const error = new Error(`Tu reserva ya está ${statusNames[status]}. No se realizaron cambios.`);
      error.status = 400;
      throw error;
    }

    const updated = await updateReservationStatus(reservation_id, status);
    
    // ACTUALIZAR ESTADO DE LA MESA SEGÚN EL ESTADO DE LA RESERVA
    if (status === "confirmed") {
      await updateTableStatus(existing.table_id, "reserved");
    } else if (status === "completed" || status === "cancelled") {
      await updateTableStatus(existing.table_id, "available");
    }
    
    return successResponse(
      res,
      `Estado de tu reserva actualizado a "${statusNames[status]}"`,
      { 
        reservation: updated,
        table_status: status === "confirmed" ? "reserved" : 
                     (status === "completed" || status === "cancelled" ? "available" : "unchanged")
      }
    );
  } catch (err) {
    next(err);
  }
};

/* Cancela una reserva */
export const cancelReservationHandler = async (req, res, next) => {
  try {
    const reservation_id = Number(req.params.reservation_id);
    
    if (isNaN(reservation_id) || reservation_id <= 0) {
      const error = new Error("No se pudo encontrar la reserva que deseas cancelar");
      error.status = 400;
      throw error;
    }

    const existing = await getReservationById(reservation_id);
    if (!existing) {
      const error = new Error("No encontramos tu reserva. Por favor, verifica tus datos.");
      error.status = 404;
      throw error;
    }

    // Customer solo puede cancelar sus propias reservas
    if (req.user.role === "customer" && existing.user_id !== req.user.id) {
      const error = new Error("No tienes permiso para cancelar esta reserva");
      error.status = 403;
      throw error;
    }

    if (existing.status === "cancelled") {
      const error = new Error("Esta reserva ya fue cancelada anteriormente");
      error.status = 400;
      throw error;
    }

    if (existing.status === "completed") {
      const error = new Error("No puedes cancelar una reserva que ya fue completada");
      error.status = 400;
      throw error;
    }

    const cancelled = await cancelReservation(reservation_id);
    
    // LIBERAR LA MESA
    await updateTableStatus(existing.table_id, "available");
    
    return successResponse(
      res,
      "Tu reserva ha sido cancelada correctamente y la mesa está disponible nuevamente",
      { 
        reservation: cancelled,
        table_status: "available"
      }
    );
  } catch (err) {
    next(err);
  }
};

/* Elimina una reserva */
export const removeReservation = async (req, res, next) => {
  try {
    const reservation_id = Number(req.params.reservation_id);
    
    if (isNaN(reservation_id) || reservation_id <= 0) {
      const error = new Error("No se pudo encontrar la reserva que deseas eliminar");
      error.status = 400;
      throw error;
    }

    const reservation = await getReservationById(reservation_id);
    if (!reservation) {
      const error = new Error("No encontramos tu reserva. Por favor, verifica tus datos.");
      error.status = 404;
      throw error;
    }

    // SI LA RESERVA ESTABA CONFIRMADA, LIBERAR LA MESA
    if (reservation.status === "confirmed") {
      await updateTableStatus(reservation.table_id, "available");
    }

    await deleteReservation(reservation_id);
    
    return successResponse(
      res,
      "Tu reserva ha sido eliminada permanentemente"
    );
  } catch (err) {
    next(err);
  }
};

/* Obtiene estadísticas generales de reservas */
export const reservationStats = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.zone_id) {
      filters.zone_id = Number(req.query.zone_id);
    }
    if (req.query.reservation_date) {
      filters.reservation_date = req.query.reservation_date;
    }

    const stats = await getReservationStatistics(filters);
    
    if (!stats || Object.keys(stats).length === 0) {
      const error = new Error("No hay datos disponibles para mostrar estadísticas");
      error.status = 404;
      throw error;
    }

    return successResponse(
      res,
      "Estadísticas generadas correctamente",
      { statistics: stats }
    );
  } catch (err) {
    next(err);
  }
};

/* Obtiene estadísticas de reservas por fecha */
export const reservationStatsByDate = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.zone_id) {
      filters.zone_id = Number(req.query.zone_id);
    }

    const stats = await getReservationStatisticsByDate(filters);
    
    if (!stats || stats.length === 0) {
      const error = new Error("No hay datos disponibles para mostrar estadísticas por fecha");
      error.status = 404;
      throw error;
    }

    return successResponse(
      res,
      `Estadísticas generadas: ${stats.length} período${stats.length > 1 ? 's' : ''}`,
      { statistics: stats, count: stats.length }
    );
  } catch (err) {
    next(err);
  }
};

/* Obtiene estadísticas de reservas por zona */
export const reservationStatsByZone = async (req, res, next) => {
  try {
    const stats = await getReservationStatisticsByZone();
    
    if (!stats || stats.length === 0) {
      const error = new Error("No hay datos disponibles para mostrar estadísticas por zona");
      error.status = 404;
      throw error;
    }

    return successResponse(
      res,
      `Estadísticas generadas: ${stats.length} zona${stats.length > 1 ? 's' : ''}`,
      { statistics: stats, count: stats.length }
    );
  } catch (err) {
    next(err);
  }
};

/* Obtiene estadísticas de reservas por estado */
export const reservationStatsByStatus = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.zone_id) {
      filters.zone_id = Number(req.query.zone_id);
    }

    const stats = await getReservationStatisticsByStatus(filters);
    
    if (!stats || stats.length === 0) {
      const error = new Error("No hay datos disponibles para mostrar estadísticas por estado");
      error.status = 404;
      throw error;
    }

    return successResponse(
      res,
      `Estadísticas generadas: ${stats.length} estado${stats.length > 1 ? 's' : ''}`,
      { statistics: stats, count: stats.length }
    );
  } catch (err) {
    next(err);
  }
};
