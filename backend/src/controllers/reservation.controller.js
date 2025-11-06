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
import { getTableById } from "../repositories/table.repository.js";
import { getUserById } from "../repositories/user.repository.js";
import { successResponse, errorResponse } from "../utils/response.js";

// Obtiene todas las reservas con filtros opcionales
export const listReservations = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.user_id) {
      filters.user_id = Number(req.query.user_id);
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
    console.error("Error en listReservations:", err);
    next(err);
  }
};

// Obtiene una reserva específica por ID
export const showReservation = async (req, res, next) => {
  try {
    const reservation_id = Number(req.params.reservation_id);
    if (isNaN(reservation_id) || reservation_id <= 0) {
      return errorResponse(res, 400, "ID de reserva inválido");
    }

    const reservation = await getReservationById(reservation_id);
    if (!reservation) {
      return errorResponse(res, 404, "Reserva no encontrada");
    }

    return successResponse(
      res,
      "Reserva obtenida correctamente",
      { reservation }
    );
  } catch (err) {
    console.error("Error en showReservation:", err);
    next(err);
  }
};

// Obtiene mesas disponibles para una zona y cantidad de huéspedes
export const getAvailableTables = async (req, res, next) => {
  try {
    const { zone_id, guest_count } = req.query;
    if (!zone_id || !guest_count) {
      return errorResponse(
        res,
        400,
        "zone_id y guest_count son requeridos"
      );
    }

    // Validar guest_count
    const validatedGuestCount = Number(guest_count);
    if (isNaN(validatedGuestCount) || validatedGuestCount < 1 || validatedGuestCount > 50) {
      return errorResponse(
        res,
        400,
        "guest_count debe estar entre 1 y 50"
      );
    }

    const zone = await getZoneById(Number(zone_id));
    if (!zone) {
      return errorResponse(res, 404, `Zona con ID ${zone_id} no existe`);
    }

    const availableTables = await getAvailableTablesByZone(
      Number(zone_id),
      validatedGuestCount
    );
    return successResponse(
      res,
      "Mesas disponibles obtenidas correctamente",
      {
        tables: availableTables,
        count: availableTables.length,
      }
    );
  } catch (err) {
    console.error("Error en getAvailableTables:", err);
    next(err);
  }
};

// Verifica la disponibilidad de una mesa en una fecha y hora específica
export const checkAvailability = async (req, res, next) => {
  try {
    const { table_id, reservation_date, reservation_time } = req.body;
    if (!table_id || !reservation_date || !reservation_time) {
      return errorResponse(
        res,
        400,
        "table_id, reservation_date y reservation_time son requeridos"
      );
    }

    const availability = await checkTableAvailability(
      Number(table_id),
      reservation_date,
      reservation_time
    );
    return successResponse(
      res,
      "Disponibilidad verificada correctamente",
      {
        available: availability.available,
        table: availability.table,
        conflict: availability.conflict,
      }
    );
  } catch (err) {
    console.error("Error en checkAvailability:", err);
    next(err);
  }
};

// Crea una nueva reserva con validación completa
export const addReservation = async (req, res, next) => {
  try {
    const {
      user_id,
      zone_id,
      table_id,
      reservation_date,
      reservation_time,
      guest_count,
      status,
      special_requirements,
    } = req.body;

    if (!user_id || !zone_id || !table_id || !reservation_date || !reservation_time || !guest_count) {
      return errorResponse(
        res,
        400,
        "user_id, zone_id, table_id, reservation_date, reservation_time y guest_count son requeridos"
      );
    }

    // Validar que el usuario existe
    const user = await getUserById(Number(user_id));
    if (!user) {
      return errorResponse(res, 404, `Usuario con ID ${user_id} no existe`);
    }

    // Validar que la zona existe
    const zone = await getZoneById(Number(zone_id));
    if (!zone) {
      return errorResponse(res, 404, `Zona con ID ${zone_id} no existe`);
    }

    // Validar que la mesa existe
    const table = await getTableById(Number(table_id));
    if (!table) {
      return errorResponse(res, 404, `Mesa con ID ${table_id} no existe`);
    }

    // Validar capacidad de mesa
    if (guest_count > table.capacity) {
      return errorResponse(
        res,
        400,
        `La mesa ${table.table_number} tiene capacidad de ${table.capacity} personas, pero se solicitan ${guest_count}`
      );
    }

    const reservation_data = {
      user_id: Number(user_id),
      zone_id: Number(zone_id),
      table_id: Number(table_id),
      reservation_date,
      reservation_time,
      guest_count: Number(guest_count),
      ...(status && { status }),
      ...(special_requirements && { special_requirements }),
    };

    console.log("📥 Data para crear reserva:", reservation_data);
    const reservation = await createReservation(reservation_data);
    return successResponse(
      res,
      "Reserva creada correctamente",
      { reservation },
      201
    );
  } catch (err) {
    console.error("Error en addReservation:", err);
    next(err);
  }
};

// Actualiza una reserva existente con validación
export const editReservation = async (req, res, next) => {
  try {
    const reservation_id = Number(req.params.reservation_id);
    if (isNaN(reservation_id) || reservation_id <= 0) {
      return errorResponse(res, 400, "ID de reserva inválido");
    }

    const existing = await getReservationById(reservation_id);
    if (!existing) {
      return errorResponse(res, 404, "Reserva no encontrada");
    }

    // Validar cambio de usuario
    if (req.body.user_id && req.body.user_id !== existing.user_id) {
      const user = await getUserById(Number(req.body.user_id));
      if (!user) {
        return errorResponse(
          res,
          404,
          `Usuario con ID ${req.body.user_id} no existe`
        );
      }
    }

    // Validar cambio de zona
    if (req.body.zone_id && req.body.zone_id !== existing.zone_id) {
      const zone = await getZoneById(Number(req.body.zone_id));
      if (!zone) {
        return errorResponse(
          res,
          404,
          `Zona con ID ${req.body.zone_id} no existe`
        );
      }
    }

    // Validar cambio de mesa
    let tableToValidate = null;
    if (req.body.table_id && req.body.table_id !== existing.table_id) {
      const table = await getTableById(Number(req.body.table_id));
      if (!table) {
        return errorResponse(
          res,
          404,
          `Mesa con ID ${req.body.table_id} no existe`
        );
      }
      tableToValidate = table;
    } else if (req.body.table_id === existing.table_id) {
      const table = await getTableById(Number(existing.table_id));
      tableToValidate = table;
    }

    // Validar capacidad si se cambia mesa o guest_count
    if (tableToValidate) {
      const guestCount = req.body.guest_count || existing.guest_count;
      if (guestCount > tableToValidate.capacity) {
        return errorResponse(
          res,
          400,
          `La mesa ${tableToValidate.table_number} tiene capacidad de ${tableToValidate.capacity} personas, pero se solicitan ${guestCount}`
        );
      }
    }

    // Si se cambia guest_count pero no la mesa, validar capacidad
    if (req.body.guest_count && !req.body.table_id) {
      const currentTable = await getTableById(Number(existing.table_id));
      if (req.body.guest_count > currentTable.capacity) {
        return errorResponse(
          res,
          400,
          `La mesa ${currentTable.table_number} tiene capacidad de ${currentTable.capacity} personas, pero se solicitan ${req.body.guest_count}`
        );
      }
    }

    const update_data = {
      ...(req.body.user_id && { user_id: req.body.user_id }),
      ...(req.body.zone_id && { zone_id: req.body.zone_id }),
      ...(req.body.table_id && { table_id: req.body.table_id }),
      ...(req.body.reservation_date && { reservation_date: req.body.reservation_date }),
      ...(req.body.reservation_time && { reservation_time: req.body.reservation_time }),
      ...(req.body.guest_count && { guest_count: req.body.guest_count }),
      ...(req.body.status && { status: req.body.status }),
      ...(req.body.special_requirements && { special_requirements: req.body.special_requirements }),
    };

    if (Object.keys(update_data).length === 0) {
      return errorResponse(
        res,
        400,
        "No se proporcionaron campos para actualizar"
      );
    }

    console.log("📝 Data para actualizar reserva:", update_data);
    const updated = await updateReservation(reservation_id, update_data);
    return successResponse(
      res,
      "Reserva actualizada correctamente",
      { reservation: updated }
    );
  } catch (err) {
    console.error("Error en editReservation:", err);
    next(err);
  }
};

// Actualiza el estado de una reserva
export const updateStatus = async (req, res, next) => {
  try {
    const reservation_id = Number(req.params.reservation_id);
    const { status } = req.body;

    if (isNaN(reservation_id) || reservation_id <= 0) {
      return errorResponse(res, 400, "ID de reserva inválido");
    }

    if (!status) {
      return errorResponse(res, 400, "status es requerido");
    }

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return errorResponse(
        res,
        400,
        `Estado inválido. Debe ser uno de: ${validStatuses.join(", ")}`
      );
    }

    const existing = await getReservationById(reservation_id);
    if (!existing) {
      return errorResponse(res, 404, "Reserva no encontrada");
    }

    console.log(`🔄 Actualizando estado de reserva ${reservation_id} a: ${status}`);
    const updated = await updateReservationStatus(reservation_id, status);
    return successResponse(
      res,
      `Estado de reserva actualizado a ${status}`,
      { reservation: updated }
    );
  } catch (err) {
    console.error("Error en updateStatus:", err);
    next(err);
  }
};

// Cancela una reserva
export const cancelReservationHandler = async (req, res, next) => {
  try {
    const reservation_id = Number(req.params.reservation_id);
    if (isNaN(reservation_id) || reservation_id <= 0) {
      return errorResponse(res, 400, "ID de reserva inválido");
    }

    const existing = await getReservationById(reservation_id);
    if (!existing) {
      return errorResponse(res, 404, "Reserva no encontrada");
    }

    if (existing.status === "completed") {
      return errorResponse(
        res,
        400,
        "No se puede cancelar una reserva completada"
      );
    }

    console.log(`❌ Cancelando reserva ${reservation_id}`);
    const cancelled = await cancelReservation(reservation_id);
    return successResponse(
      res,
      "Reserva cancelada correctamente",
      { reservation: cancelled }
    );
  } catch (err) {
    console.error("Error en cancelReservationHandler:", err);
    next(err);
  }
};

// Elimina una reserva de forma permanente
export const removeReservation = async (req, res, next) => {
  try {
    const reservation_id = Number(req.params.reservation_id);
    if (isNaN(reservation_id) || reservation_id <= 0) {
      return errorResponse(res, 400, "ID de reserva inválido");
    }

    const reservation = await getReservationById(reservation_id);
    if (!reservation) {
      return errorResponse(res, 404, "Reserva no encontrada");
    }

    console.log(`🗑️ Eliminando reserva ${reservation_id}`);
    const result = await deleteReservation(reservation_id);
    return successResponse(res, result.message);
  } catch (err) {
    console.error("Error en removeReservation:", err);
    next(err);
  }
};

// Obtiene estadísticas generales de reservas
export const reservationStats = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.zone_id) {
      filters.zone_id = Number(req.query.zone_id);
    }
    if (req.query.reservation_date) {
      filters.reservation_date = req.query.reservation_date;
    }

    console.log("📊 Obteniendo estadísticas generales con filtros:", filters);
    const stats = await getReservationStatistics(filters);
    if (!stats || Object.keys(stats).length === 0) {
      return errorResponse(res, 404, "No se pudo obtener estadísticas");
    }

    return successResponse(
      res,
      "Estadísticas de reservas obtenidas correctamente",
      { statistics: stats }
    );
  } catch (err) {
    console.error("Error en reservationStats:", err);
    next(err);
  }
};

// Obtiene estadísticas de reservas por fecha
export const reservationStatsByDate = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.zone_id) {
      filters.zone_id = Number(req.query.zone_id);
    }

    console.log("📅 Obteniendo estadísticas por fecha con filtros:", filters);
    const stats = await getReservationStatisticsByDate(filters);
    if (!stats || stats.length === 0) {
      return errorResponse(
        res,
        404,
        "No hay datos de estadísticas por fecha"
      );
    }

    return successResponse(
      res,
      "Estadísticas por fecha obtenidas correctamente",
      { statistics: stats, count: stats.length }
    );
  } catch (err) {
    console.error("Error en reservationStatsByDate:", err);
    next(err);
  }
};

// Obtiene estadísticas de reservas por zona
export const reservationStatsByZone = async (req, res, next) => {
  try {
    console.log("🏢 Obteniendo estadísticas por zona");
    const stats = await getReservationStatisticsByZone();
    if (!stats || stats.length === 0) {
      return errorResponse(
        res,
        404,
        "No hay datos de estadísticas por zona"
      );
    }

    return successResponse(
      res,
      "Estadísticas por zona obtenidas correctamente",
      { statistics: stats, count: stats.length }
    );
  } catch (err) {
    console.error("Error en reservationStatsByZone:", err);
    next(err);
  }
};

// Obtiene estadísticas de reservas por estado
export const reservationStatsByStatus = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.zone_id) {
      filters.zone_id = Number(req.query.zone_id);
    }

    console.log("📈 Obteniendo estadísticas por estado con filtros:", filters);
    const stats = await getReservationStatisticsByStatus(filters);
    if (!stats || stats.length === 0) {
      return errorResponse(
        res,
        404,
        "No hay datos de estadísticas por estado"
      );
    }

    return successResponse(
      res,
      "Estadísticas por estado obtenidas correctamente",
      { statistics: stats, count: stats.length }
    );
  } catch (err) {
    console.error("Error en reservationStatsByStatus:", err);
    next(err);
  }
};
