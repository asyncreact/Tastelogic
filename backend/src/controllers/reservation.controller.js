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

// Función auxiliar para auditoría
const logAudit = (action, userId, reservationId, changes = null) => {
  console.log(`📋 AUDIT [${new Date().toISOString()}] - USER: ${userId} | ACTION: ${action} | RESERVATION: ${reservationId}${changes ? ` | CHANGES: ${JSON.stringify(changes)}` : ""}`);
};

/**
 * LISTAR RESERVAS
 */

export const listReservations = async (req, res, next) => {
  try {
    const filters = {};

    // Si es cliente, solo sus reservas
    if (req.user.role === "customer") {
      filters.user_id = req.user.id;
    } else if (req.query.user_id) {
      filters.user_id = Number(req.query.user_id);
    }

    if (req.query.zone_id) filters.zone_id = Number(req.query.zone_id);
    if (req.query.table_id) filters.table_id = Number(req.query.table_id);
    if (req.query.status) filters.status = req.query.status;
    if (req.query.reservation_date)
      filters.reservation_date = req.query.reservation_date;

    const reservations = await getReservations(filters);

    return successResponse(res, "Reservas obtenidas correctamente", {
      reservations,
      count: reservations.length,
    });
  } catch (err) {
    console.error("Error en listReservations:", err);
    next(err);
  }
};

/**
 * MOSTRAR UNA RESERVA
 */

export const showReservation = async (req, res, next) => {
  try {
    const reservation_id = Number(req.params.reservation_id);

    if (isNaN(reservation_id) || reservation_id <= 0)
      return errorResponse(res, 400, "ID de reserva inválido");

    const reservation = await getReservationById(reservation_id);

    if (!reservation)
      return errorResponse(res, 404, "Reserva no encontrada");

    // Si es cliente, validar propiedad
    if (
      req.user.role === "customer" &&
      reservation.user_id !== req.user.id
    ) {
      logAudit("UNAUTHORIZED_VIEW", req.user.id, reservation_id);
      return errorResponse(
        res,
        403,
        "No tienes permiso para ver esta reserva"
      );
    }

    return successResponse(res, "Reserva obtenida correctamente", {
      reservation,
    });
  } catch (err) {
    console.error("Error en showReservation:", err);
    next(err);
  }
};

/**
 * MESAS DISPONIBLES (público)
 */

export const getAvailableTables = async (req, res, next) => {
  try {
    const { zone_id, guest_count } = req.query;

    if (!zone_id || !guest_count)
      return errorResponse(
        res,
        400,
        "zone_id y guest_count son requeridos"
      );

    const validatedGuestCount = Number(guest_count);

    if (
      isNaN(validatedGuestCount) ||
      validatedGuestCount < 1 ||
      validatedGuestCount > 50
    )
      return errorResponse(
        res,
        400,
        "guest_count debe estar entre 1 y 50"
      );

    const zone = await getZoneById(Number(zone_id));

    if (!zone)
      return errorResponse(res, 404, `Zona con ID ${zone_id} no existe`);

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

/**
 * VERIFICAR DISPONIBILIDAD DE MESA (público)
 */

export const checkAvailability = async (req, res, next) => {
  try {
    const { table_id, reservation_date, reservation_time } = req.body;

    if (!table_id || !reservation_date || !reservation_time)
      return errorResponse(
        res,
        400,
        "table_id, reservation_date y reservation_time son requeridos"
      );

    const availability = await checkTableAvailability(
      Number(table_id),
      reservation_date,
      reservation_time
    );

    return successResponse(res, "Disponibilidad verificada correctamente", {
      available: availability.available,
      table: availability.table,
      conflict: availability.conflict,
    });
  } catch (err) {
    console.error("Error en checkAvailability:", err);
    next(err);
  }
};

/**
 * CREAR RESERVA
 */

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

    if (
      !zone_id ||
      !table_id ||
      !reservation_date ||
      !reservation_time ||
      !guest_count
    )
      return errorResponse(res, 400, "Faltan campos obligatorios");

    // Determinar el usuario que crea la reserva
    let effectiveUserId = user_id;

    if (req.user.role === "customer") {
      effectiveUserId = req.user.id; // forzar su propio ID
    }

    // Validar existencia
    const user = await getUserById(Number(effectiveUserId));
    if (!user)
      return errorResponse(res, 404, `Usuario con ID ${effectiveUserId} no existe`);

    const zone = await getZoneById(Number(zone_id));
    if (!zone)
      return errorResponse(res, 404, `Zona con ID ${zone_id} no existe`);

    const table = await getTableById(Number(table_id));
    if (!table)
      return errorResponse(res, 404, `Mesa con ID ${table_id} no existe`);

    if (guest_count > table.capacity)
      return errorResponse(
        res,
        400,
        `La mesa ${table.table_number} tiene capacidad de ${table.capacity} personas`
      );

    const reservation_data = {
      user_id: Number(effectiveUserId),
      zone_id: Number(zone_id),
      table_id: Number(table_id),
      reservation_date,
      reservation_time,
      guest_count: Number(guest_count),
      special_requirements,
      status:
        req.user.role === "customer" ? "pending" : status || "confirmed",
    };

    const reservation = await createReservation(reservation_data);

    logAudit("CREATE", req.user.id, reservation.id, {
      user_id: effectiveUserId,
      zone_id,
      table_id,
      guest_count,
    });

    return successResponse(res, "Reserva creada correctamente", { reservation }, 201);
  } catch (err) {
    console.error("Error en addReservation:", err);
    next(err);
  }
};

/**
 * EDITAR RESERVA
 */

export const editReservation = async (req, res, next) => {
  try {
    const reservation_id = Number(req.params.reservation_id);

    if (isNaN(reservation_id) || reservation_id <= 0)
      return errorResponse(res, 400, "ID de reserva inválido");

    const existing = await getReservationById(reservation_id);

    if (!existing) return errorResponse(res, 404, "Reserva no encontrada");

    // ✅ NUEVO: Validar propiedad para clientes
    if (
      req.user.role === "customer" &&
      existing.user_id !== req.user.id
    ) {
      logAudit("UNAUTHORIZED_EDIT", req.user.id, reservation_id);
      return errorResponse(
        res,
        403,
        "No tienes permiso para modificar esta reserva"
      );
    }

    // Validaciones
    let tableToValidate = null;

    if (req.body.table_id && req.body.table_id !== existing.table_id) {
      const table = await getTableById(Number(req.body.table_id));
      if (!table)
        return errorResponse(
          res,
          404,
          `Mesa con ID ${req.body.table_id} no existe`
        );
      tableToValidate = table;
    } else {
      tableToValidate = await getTableById(Number(existing.table_id));
    }

    const guestCount = req.body.guest_count || existing.guest_count;

    if (guestCount > tableToValidate.capacity)
      return errorResponse(
        res,
        400,
        `La mesa ${tableToValidate.table_number} tiene capacidad de ${tableToValidate.capacity} personas`
      );

    const update_data = {
      ...(req.body.zone_id && { zone_id: req.body.zone_id }),
      ...(req.body.table_id && { table_id: req.body.table_id }),
      ...(req.body.reservation_date && {
        reservation_date: req.body.reservation_date,
      }),
      ...(req.body.reservation_time && {
        reservation_time: req.body.reservation_time,
      }),
      ...(req.body.guest_count && { guest_count: req.body.guest_count }),
      ...(req.body.special_requirements && {
        special_requirements: req.body.special_requirements,
      }),
    };

    if (Object.keys(update_data).length === 0)
      return errorResponse(
        res,
        400,
        "No se proporcionaron campos para actualizar"
      );

    const updated = await updateReservation(reservation_id, update_data);

    logAudit("UPDATE", req.user.id, reservation_id, update_data);

    return successResponse(res, "Reserva actualizada correctamente", {
      reservation: updated,
    });
  } catch (err) {
    console.error("Error en editReservation:", err);
    next(err);
  }
};

/**
 * ACTUALIZAR ESTADO (solo admin)
 */

export const updateStatus = async (req, res, next) => {
  try {
    const reservation_id = Number(req.params.reservation_id);
    const { status } = req.body;

    if (isNaN(reservation_id) || reservation_id <= 0)
      return errorResponse(res, 400, "ID de reserva inválido");

    if (!status) return errorResponse(res, 400, "status es requerido");

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];

    if (!validStatuses.includes(status))
      return errorResponse(res, 400, `Estado inválido: ${status}`);

    const existing = await getReservationById(reservation_id);

    if (!existing) return errorResponse(res, 404, "Reserva no encontrada");

    const updated = await updateReservationStatus(reservation_id, status);

    logAudit("STATUS_CHANGE", req.user.id, reservation_id, {
      old_status: existing.status,
      new_status: status,
    });

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

/**
 * CANCELAR RESERVA
 */

export const cancelReservationHandler = async (req, res, next) => {
  try {
    const reservation_id = Number(req.params.reservation_id);

    if (isNaN(reservation_id) || reservation_id <= 0)
      return errorResponse(res, 400, "ID de reserva inválido");

    const existing = await getReservationById(reservation_id);

    if (!existing) return errorResponse(res, 404, "Reserva no encontrada");

    // Validar permisos
    if (
      req.user.role === "customer" &&
      existing.user_id !== req.user.id
    ) {
      logAudit("UNAUTHORIZED_CANCEL", req.user.id, reservation_id);
      return errorResponse(
        res,
        403,
        "No tienes permiso para cancelar esta reserva"
      );
    }

    if (existing.status === "completed")
      return errorResponse(
        res,
        400,
        "No se puede cancelar una reserva completada"
      );

    const cancelled = await cancelReservation(reservation_id);

    logAudit("CANCEL", req.user.id, reservation_id, {
      previous_status: existing.status,
    });

    return successResponse(res, "Reserva cancelada correctamente", {
      reservation: cancelled,
    });
  } catch (err) {
    console.error("Error en cancelReservationHandler:", err);
    next(err);
  }
};

/**
 * ELIMINAR RESERVA (solo admin)
 */

export const removeReservation = async (req, res, next) => {
  try {
    const reservation_id = Number(req.params.reservation_id);

    if (isNaN(reservation_id) || reservation_id <= 0)
      return errorResponse(res, 400, "ID de reserva inválido");

    const reservation = await getReservationById(reservation_id);

    if (!reservation)
      return errorResponse(res, 404, "Reserva no encontrada");

    const result = await deleteReservation(reservation_id);

    logAudit("DELETE", req.user.id, reservation_id, {
      user_id: reservation.user_id,
      status: reservation.status,
    });

    return successResponse(res, result.message);
  } catch (err) {
    console.error("Error en removeReservation:", err);
    next(err);
  }
};

/**
 * ESTADÍSTICAS (solo admin)
 */

export const reservationStats = async (req, res, next) => {
  try {
    const filters = {};

    if (req.query.zone_id) filters.zone_id = Number(req.query.zone_id);
    if (req.query.reservation_date)
      filters.reservation_date = req.query.reservation_date;

    const stats = await getReservationStatistics(filters);

    if (!stats || Object.keys(stats).length === 0)
      return errorResponse(res, 404, "No se pudo obtener estadísticas");

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

export const reservationStatsByDate = async (req, res, next) => {
  try {
    const filters = {};

    if (req.query.zone_id) filters.zone_id = Number(req.query.zone_id);

    const stats = await getReservationStatisticsByDate(filters);

    if (!stats || stats.length === 0)
      return errorResponse(
        res,
        404,
        "No hay datos de estadísticas por fecha"
      );

    return successResponse(
      res,
      "Estadísticas por fecha obtenidas correctamente",
      {
        statistics: stats,
        count: stats.length,
      }
    );
  } catch (err) {
    console.error("Error en reservationStatsByDate:", err);
    next(err);
  }
};

export const reservationStatsByZone = async (req, res, next) => {
  try {
    const stats = await getReservationStatisticsByZone();

    if (!stats || stats.length === 0)
      return errorResponse(res, 404, "No hay datos de estadísticas por zona");

    return successResponse(
      res,
      "Estadísticas por zona obtenidas correctamente",
      {
        statistics: stats,
        count: stats.length,
      }
    );
  } catch (err) {
    console.error("Error en reservationStatsByZone:", err);
    next(err);
  }
};

export const reservationStatsByStatus = async (req, res, next) => {
  try {
    const filters = {};

    if (req.query.zone_id) filters.zone_id = Number(req.query.zone_id);

    const stats = await getReservationStatisticsByStatus(filters);

    if (!stats || stats.length === 0)
      return errorResponse(
        res,
        404,
        "No hay datos de estadísticas por estado"
      );

    return successResponse(
      res,
      "Estadísticas por estado obtenidas correctamente",
      {
        statistics: stats,
        count: stats.length,
      }
    );
  } catch (err) {
    console.error("Error en reservationStatsByStatus:", err);
    next(err);
  }
};
