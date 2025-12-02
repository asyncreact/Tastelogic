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
  getActiveFutureReservationByUserId,
  getActiveReservationByUserId,
} from "../repositories/reservation.repository.js";
import { getZoneById } from "../repositories/zone.repository.js";
import { getTableById, updateTableStatus } from "../repositories/table.repository.js";
import { getUserById } from "../repositories/user.repository.js";
import { successResponse } from "../utils/response.js";
import { sendMail } from "../config/mailer.js";

/* Helper de fechas en español (local, sin zona horaria) */
const WEEKDAYS_ES = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const formatLocalDateEs = (isoDate) => {
  if (!isoDate) return "";

  if (isoDate instanceof Date) {
    const year = isoDate.getFullYear();
    const month = String(isoDate.getMonth() + 1).padStart(2, "0");
    const day = String(isoDate.getDate()).padStart(2, "0");
    isoDate = `${year}-${month}-${day}`;
  }

  if (typeof isoDate !== "string") return "";

  const [year, month, day] = isoDate.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const weekday = WEEKDAYS_ES[d.getDay()];
  const monthName = MONTHS_ES[d.getMonth()];
  return `${weekday}, ${day} de ${monthName}${year ? ` de ${year}` : ""}`;
};

/* RESERVAS */

/* Obtiene la reserva activa de hoy del usuario logueado */
export const getMyActiveReservation = async (req, res, next) => {
  try {
    if (req.user.role !== "customer") {
      const error = new Error(
        "Solo los clientes pueden consultar su reserva activa."
      );
      error.status = 403;
      throw error;
    }

    const userId = Number(req.user.id);
    const reservation = await getActiveReservationByUserId(userId);

    if (!reservation) {
      const error = new Error("No tienes una reserva activa para hoy.");
      error.status = 404;
      throw error;
    }

    return successResponse(res, "Reserva activa encontrada", {
      id: reservation.id,
      user_id: reservation.user_id,
      zone_id: reservation.zone_id,
      table_id: reservation.table_id,
      reservation_date: reservation.reservation_date,
      reservation_time: reservation.reservation_time,
      guest_count: reservation.guest_count,
      status: reservation.status,
      table_number: reservation.table_number,
      zone_name: reservation.zone_name,
    });
  } catch (err) {
    next(err);
  }
};

/* Obtiene todas las reservas con filtros opcionales */
export const listReservations = async (req, res, next) => {
  try {
    const filters = {};

    /* Customer solo ve sus reservas; admin puede filtrar por user_id */
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
    return successResponse(res, "Reservas obtenidas correctamente", {
      reservations,
      count: reservations.length,
    });
  } catch (err) {
    next(err);
  }
};

/* Obtiene una reserva específica por ID */
export const showReservation = async (req, res, next) => {
  try {
    const reservation_id = Number(req.params.reservation_id);

    /* Valida que el ID de reserva sea un número positivo */
    if (isNaN(reservation_id) || reservation_id <= 0) {
      const error = new Error("No se pudo encontrar la reserva solicitada");
      error.status = 400;
      throw error;
    }

    const reservation = await getReservationById(reservation_id);

    if (!reservation) {
      const error = new Error(
        "No encontramos tu reserva. Por favor, verifica tus datos."
      );
      error.status = 404;
      throw error;
    }

    /* Customer solo puede ver sus propias reservas */
    if (req.user.role === "customer" && reservation.user_id !== req.user.id) {
      const error = new Error("No tienes permiso para ver esta reserva");
      error.status = 403;
      throw error;
    }

    return successResponse(res, "Reserva encontrada", { reservation });
  } catch (err) {
    next(err);
  }
};

/* Obtiene mesas disponibles por zona */
export const getAvailableTables = async (req, res, next) => {
  try {
    const { zone_id, guest_count } = req.query;

    if (!zone_id || !guest_count) {
      const error = new Error(
        "Por favor, selecciona una zona y el número de personas"
      );
      error.status = 400;
      throw error;
    }

    const validatedGuestCount = Number(guest_count);
    if (
      isNaN(validatedGuestCount) ||
      validatedGuestCount < 1 ||
      validatedGuestCount > 50
    ) {
      const error = new Error(
        "El número de personas debe estar entre 1 y 50"
      );
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
        `Lo sentimos, no hay mesas disponibles en ${zone.name} para ${validatedGuestCount} persona${
          validatedGuestCount > 1 ? "s" : ""
        }`,
        { tables: [], count: 0, zone_name: zone.name }
      );
    }

    return successResponse(
      res,
      `Tenemos ${availableTables.length} mesa${
        availableTables.length > 1 ? "s" : ""
      } disponible${availableTables.length > 1 ? "s" : ""} en ${zone.name}`,
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
      const error = new Error(
        "Por favor, completa todos los campos: mesa, fecha y hora"
      );
      error.status = 400;
      throw error;
    }

    const table = await getTableById(Number(table_id));
    if (!table) {
      const error = new Error("La mesa seleccionada no está disponible");
      error.status = 404;
      throw error;
    }

    /* Valida que la mesa esté activa */
    if (!table.is_active) {
      const error = new Error(
        "La mesa seleccionada no está disponible en este momento"
      );
      error.status = 400;
      throw error;
    }

    const availability = await checkTableAvailability(
      Number(table_id),
      reservation_date,
      reservation_time
    );

    const formattedDate = formatLocalDateEs(reservation_date);

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

    /* Customer reserva para sí mismo; admin debe especificar user_id */
    let user_id;
    if (req.user.role === "customer") {
      user_id = req.user.id;
    } else {
      if (!req.body.user_id) {
        const error = new Error(
          "Como administrador, debes especificar el ID del usuario para crear la reserva"
        );
        error.status = 400;
        throw error;
      }
      user_id = req.body.user_id;
    }

    /* Evita que el usuario tenga más de una reserva futura activa */
    const activeReservation = await getActiveFutureReservationByUserId(
      Number(user_id)
    );
    if (activeReservation) {
      const error = new Error(
        "Ya tienes una reserva activa. Completa, cancela o espera a que expire antes de crear una nueva."
      );
      error.status = 400;
      throw error;
    }

    const missingFields = [];
    if (!zone_id) missingFields.push("zona");
    if (!table_id) missingFields.push("mesa");
    if (!reservation_date) missingFields.push("fecha");
    if (!reservation_time) missingFields.push("hora");
    if (!guest_count) missingFields.push("número de personas");

    if (missingFields.length > 0) {
      const error = new Error(
        `Por favor, completa los siguientes campos: ${missingFields.join(", ")}`
      );
      error.status = 400;
      throw error;
    }

    const user = await getUserById(Number(user_id));
    if (!user) {
      const error = new Error(
        "El usuario especificado no está registrado. Por favor, verifica el ID del usuario."
      );
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

    /* Valida que la mesa esté activa */
    if (!table.is_active) {
      const error = new Error(
        "La mesa seleccionada no está disponible en este momento"
      );
      error.status = 400;
      throw error;
    }

    /* Valida capacidad de la mesa vs número de personas */
    if (guest_count > table.capacity) {
      const error = new Error(
        `Lo sentimos, la mesa ${
          table.table_number
        } tiene capacidad para ${table.capacity} persona${
          table.capacity > 1 ? "s" : ""
        }, pero seleccionaste ${guest_count} persona${
          guest_count > 1 ? "s" : ""
        }. Por favor, elige una mesa más grande.`
      );
      error.status = 400;
      throw error;
    }

    /* Verifica disponibilidad de la mesa en fecha/hora */
    const availability = await checkTableAvailability(
      Number(table_id),
      reservation_date,
      reservation_time
    );

    if (!availability.available) {
      const formattedDate = formatLocalDateEs(reservation_date);

      const error = new Error(
        `Lo sentimos, la mesa ${
          table.table_number
        } ya está reservada para el ${formattedDate} a las ${reservation_time}. Por favor, elige otro horario o mesa.`
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

    const formattedDate = formatLocalDateEs(reservation_date);

    /* Envia correo de confirmación de creación de reserva */
    Promise.resolve(
      sendMail({
        to: user.email,
        subject: "¡Tu reserva en TasteLogic está lista!",
        title: `Hola ${user.name},`,
        message:
          `¡Gracias por reservar con nosotros! \n\n` +
          `Hemos registrado tu reserva para el ${formattedDate} a las ${reservation_time}.\n` +
          `Te estaremos esperando en la mesa ${table.table_number} de la zona ${zone.name}.\n\n` +
          `Si necesitas hacer algún cambio o tienes alguna solicitud especial, puedes responder a este correo.`,
      })
    ).catch((err) =>
      console.error("Error al enviar correo de creación de reserva:", err)
    );

    return successResponse(
      res,
      `¡Reserva confirmada! Mesa ${table.table_number} en ${zone.name} para el ${formattedDate} a las ${reservation_time}`,
      {
        reservation,
        details: {
          reservation_number: reservation.reservation_number,
          table_number: table.table_number,
          zone_name: zone.name,
          date: formattedDate,
          time: reservation_time,
          guests: guest_count,
          user_name: user.name,
        },
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

    /* Valida ID de reserva antes de modificar */
    if (isNaN(reservation_id) || reservation_id <= 0) {
      const error = new Error(
        "No se pudo encontrar la reserva que deseas modificar"
      );
      error.status = 400;
      throw error;
    }

    const existing = await getReservationById(reservation_id);
    if (!existing) {
      const error = new Error(
        "No encontramos tu reserva. Por favor, verifica tus datos."
      );
      error.status = 404;
      throw error;
    }

    /* Customer solo puede modificar sus propias reservas */
    if (req.user.role === "customer" && existing.user_id !== req.user.id) {
      const error = new Error("No tienes permiso para modificar esta reserva");
      error.status = 403;
      throw error;
    }

    /* Bloquea edición si la reserva ya está completada, cancelada o expirada */
    if (
      existing.status === "completed" ||
      existing.status === "cancelled" ||
      existing.status === "expired"
    ) {
      const error = new Error(
        "No puedes modificar una reserva que ya fue completada, cancelada o expirada"
      );
      error.status = 400;
      throw error;
    }

    /* Solo admin puede cambiar user_id */
    if (req.body.user_id && req.user.role !== "admin") {
      const error = new Error(
        "No tienes permiso para cambiar el usuario de la reserva"
      );
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

      /* Valida que la nueva mesa esté activa */
      if (!newTable.is_active) {
        const error = new Error(
          "La mesa seleccionada no está disponible en este momento"
        );
        error.status = 400;
        throw error;
      }

      tableToValidate = newTable;
    } else if (req.body.table_id === existing.table_id) {
      const table = await getTableById(Number(existing.table_id));
      tableToValidate = table;
    }

    /* Valida capacidad contra nuevo número de personas si aplica */
    if (tableToValidate) {
      const guestCount = req.body.guest_count || existing.guest_count;
      if (guestCount > tableToValidate.capacity) {
        const error = new Error(
          `Lo sentimos, la mesa ${
            tableToValidate.table_number
          } tiene capacidad para ${tableToValidate.capacity} persona${
            tableToValidate.capacity > 1 ? "s" : ""
          }, pero seleccionaste ${guestCount} persona${
            guestCount > 1 ? "s" : ""
          }. Por favor, elige una mesa más grande.`
        );
        error.status = 400;
        throw error;
      }
    }

    if (req.body.guest_count && !req.body.table_id) {
      const currentTable = await getTableById(Number(existing.table_id));
      if (req.body.guest_count > currentTable.capacity) {
        const error = new Error(
          `Lo sentimos, la mesa ${
            currentTable.table_number
          } tiene capacidad para ${currentTable.capacity} persona${
            currentTable.capacity > 1 ? "s" : ""
          }, pero seleccionaste ${req.body.guest_count} persona${
            req.body.guest_count > 1 ? "s" : ""
          }. Por favor, elige una mesa más grande.`
        );
        error.status = 400;
        throw error;
      }
    }

    const statusNames = {
      pending: "pendiente",
      confirmed: "confirmada",
      completed: "completada",
      cancelled: "cancelada",
      expired: "expirada",
    };

    /* Valida estado si se envía un nuevo status */
    if (req.body.status !== undefined) {
      const validStatuses = [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "expired",
      ];
      if (!validStatuses.includes(req.body.status)) {
        const error = new Error(
          `El estado seleccionado no es válido. Elige entre: ${Object.values(
            statusNames
          ).join(", ")}`
        );
        error.status = 400;
        throw error;
      }
    }

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
      ...(req.body.special_requirements !== undefined && {
        special_requirements: req.body.special_requirements,
      }),
    };

    /* Solo admin puede cambiar status y user_id en la actualización */
    if (req.user.role === "admin") {
      if (req.body.status !== undefined) update_data.status = req.body.status;
      if (req.body.user_id) update_data.user_id = req.body.user_id;
    }

    if (Object.keys(update_data).length === 0) {
      const error = new Error(
        "No realizaste ningún cambio. Por favor, modifica al menos un campo."
      );
      error.status = 400;
      throw error;
    }

    const updated = await updateReservation(reservation_id, update_data);

    /* Ajusta el estado de la mesa si cambia el estado de la reserva */
    if (req.body.status && req.body.status !== existing.status) {
      if (req.body.status === "confirmed") {
        await updateTableStatus(updated.table_id, "reserved");
      } else if (
        req.body.status === "completed" ||
        req.body.status === "cancelled" ||
        req.body.status === "expired"
      ) {
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

    return successResponse(res, message, { reservation: updated });
  } catch (err) {
    next(err);
  }
};

/* Actualiza el estado de una reserva */
export const updateStatus = async (req, res, next) => {
  try {
    const reservation_id = Number(req.params.reservation_id);
    const { status } = req.body;

    /* Valida ID y que se envíe un estado */
    if (isNaN(reservation_id) || reservation_id <= 0) {
      const error = new Error(
        "No se pudo encontrar la reserva que deseas modificar"
      );
      error.status = 400;
      throw error;
    }

    if (!status) {
      const error = new Error(
        "Por favor, selecciona un estado para la reserva"
      );
      error.status = 400;
      throw error;
    }

    const statusNames = {
      pending: "pendiente",
      confirmed: "confirmada",
      completed: "completada",
      cancelled: "cancelada",
      expired: "expirada",
    };

    const validStatuses = [
      "pending",
      "confirmed",
      "completed",
      "cancelled",
      "expired",
    ];
    if (!validStatuses.includes(status)) {
      const error = new Error(
        `El estado seleccionado no es válido. Elige entre: ${Object.values(
          statusNames
        ).join(", ")}`
      );
      error.status = 400;
      throw error;
    }

    const existing = await getReservationById(reservation_id);
    if (!existing) {
      const error = new Error(
        "No encontramos tu reserva. Por favor, verifica tus datos."
      );
      error.status = 404;
      throw error;
    }

    /* Bloquea cambios si la reserva ya está cancelada, expirada o completada */
    if (
      existing.status === "cancelled" ||
      existing.status === "expired" ||
      existing.status === "completed"
    ) {
      const error = new Error(
        "No puedes modificar el estado de una reserva cancelada, expirada o completada"
      );
      error.status = 400;
      throw error;
    }

    if (existing.status === status) {
      const error = new Error(
        `Tu reserva ya está ${statusNames[status]}. No se realizaron cambios.`
      );
      error.status = 400;
      throw error;
    }

    const updated = await updateReservationStatus(reservation_id, status);

    /* Actualiza el estado de la mesa según el estado de la reserva */
    if (status === "confirmed") {
      await updateTableStatus(existing.table_id, "reserved");
    } else if (
      status === "completed" ||
      status === "cancelled" ||
      status === "expired"
    ) {
      await updateTableStatus(existing.table_id, "available");
    }

    /* Envía correo al usuario según el nuevo estado */
    const user = await getUserById(existing.user_id);
    const formattedDate = formatLocalDateEs(existing.reservation_date);

    let subject = "";
    let message = "";

    if (status === "confirmed") {
      subject = "¡Tu reserva ha sido confirmada!";
      message =
        `Hola ${user.name},\n\n` +
        `¡Buenas noticias! Tu reserva para el ${formattedDate} a las ${existing.reservation_time} ha sido confirmada.\n` +
        `Te esperamos con la mesa lista para ti.\n\n` +
        `Si no puedes asistir o necesitas ajustar algo, avísanos con tiempo.`;
    } else if (status === "completed") {
      subject = "Gracias por visitarnos";
      message =
        `Gracias por compartir tu tiempo con nosotros, ${user.name}.\n\n` +
        `Tu reserva del ${formattedDate} se marcó como completada.\n` +
        `Esperamos que hayas tenido una excelente experiencia y que pronto vuelvas a visitarnos.`;
    } else if (status === "cancelled") {
      subject = "Tu reserva ha sido cancelada";
      message =
        `Hola ${user.name},\n\n` +
        `Hemos cancelado tu reserva para el ${formattedDate} tal como indicaste.\n` +
        `Si fue un error o deseas hacer una nueva reserva, estaremos encantados de ayudarte.`;
    } else if (status === "expired") {
      subject = "Tu reserva ha expirado";
      message =
        `Hola ${user.name},\n\n` +
        `Tu reserva para el ${formattedDate} ha expirado porque no se utilizó a tiempo.\n` +
        `Cuando quieras, puedes crear una nueva reserva y con gusto te recibimos.`;
    }

    if (subject) {
      Promise.resolve(
        sendMail({
          to: user.email,
          subject,
          title: `Hola ${user.name},`,
          message,
        })
      ).catch((err) =>
        console.error("Error al enviar correo de cambio de estado:", err)
      );
    }

    return successResponse(
      res,
      `Estado de tu reserva actualizado a "${statusNames[status]}"`,
      {
        reservation: updated,
        table_status:
          status === "confirmed"
            ? "reserved"
            : status === "completed" ||
              status === "cancelled" ||
              status === "expired"
            ? "available"
            : "unchanged",
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

    /* Valida ID antes de cancelar la reserva */
    if (isNaN(reservation_id) || reservation_id <= 0) {
      const error = new Error(
        "No se pudo encontrar la reserva que deseas cancelar"
      );
      error.status = 400;
      throw error;
    }

    const existing = await getReservationById(reservation_id);
    if (!existing) {
      const error = new Error(
        "No encontramos tu reserva. Por favor, verifica tus datos."
      );
      error.status = 404;
      throw error;
    }

    /* Customer solo puede cancelar sus propias reservas */
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
      const error = new Error(
        "No puedes cancelar una reserva que ya fue completada"
      );
      error.status = 400;
      throw error;
    }

    const cancelled = await cancelReservation(reservation_id);

    /* Libera la mesa asociada a la reserva */
    await updateTableStatus(existing.table_id, "available");

    /* Envía correo de cancelación al usuario */
    const user = await getUserById(existing.user_id);
    Promise.resolve(
      sendMail({
        to: user.email,
        subject: "Tu reserva ha sido cancelada",
        title: `Hola ${user.name},`,
        message:
          `Hemos cancelado tu reserva tal como solicitaste.\n\n` +
          `La mesa ha quedado nuevamente disponible.\n` +
          `Cuando te animes a visitarnos de nuevo, estaremos encantados de recibirte.`,
      })
    ).catch((err) =>
      console.error("Error al enviar correo de cancelación:", err)
    );

    return successResponse(
      res,
      "Tu reserva ha sido cancelada correctamente y la mesa está disponible nuevamente",
      {
        reservation: cancelled,
        table_status: "available",
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

    /* Valida ID antes de eliminar permanentemente la reserva */
    if (isNaN(reservation_id) || reservation_id <= 0) {
      const error = new Error(
        "No se pudo encontrar la reserva que deseas eliminar"
      );
      error.status = 400;
      throw error;
    }

    const reservation = await getReservationById(reservation_id);
    if (!reservation) {
      const error = new Error(
        "No encontramos tu reserva. Por favor, verifica tus datos."
      );
      error.status = 404;
      throw error;
    }

    /* Si estaba confirmada, libera la mesa al eliminarla */
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
