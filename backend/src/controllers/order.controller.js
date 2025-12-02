// src/controllers/order.controller.js

import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  deleteOrder,
} from "../repositories/order.repository.js";
import { getUserById } from "../repositories/user.repository.js";
import { getTableById } from "../repositories/table.repository.js";
import { getItemById as getMenuItemById } from "../repositories/menu.repository.js";
import { getActiveReservationByUserId } from "../repositories/reservation.repository.js";
import { successResponse } from "../utils/response.js";
import { sendMail } from "../config/mailer.js";

/* PEDIDOS */

/* Obtiene todos los pedidos con filtros opcionales */
export const listOrders = async (req, res, next) => {
  try {
    const filters = {};

    if (req.user.role === "customer") {
      filters.user_id = req.user.id;
    } else {
      if (req.query.user_id) {
        filters.user_id = Number(req.query.user_id);
      }
    }

    if (req.query.table_id) {
      filters.table_id = Number(req.query.table_id);
    }

    if (req.query.order_type) {
      filters.order_type = req.query.order_type;
    }

    if (req.query.status) {
      filters.status = req.query.status;
    }

    if (req.query.payment_status) {
      filters.payment_status = req.query.payment_status;
    }

    if (req.query.order_date) {
      filters.order_date = req.query.order_date;
    }

    const orders = await getOrders(filters);

    return successResponse(res, "Pedidos obtenidos correctamente", {
      orders,
      count: orders.length,
    });
  } catch (err) {
    next(err);
  }
};

/* Obtiene un pedido específico por ID */
export const showOrder = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);

    /* Valida que el ID del pedido sea un número positivo */
    if (isNaN(order_id) || order_id <= 0) {
      const error = new Error("No se pudo encontrar el pedido solicitado");
      error.status = 400;
      throw error;
    }

    const order = await getOrderById(order_id);

    if (!order) {
      const error = new Error(
        "No encontramos tu pedido. Por favor, verifica tus datos."
      );
      error.status = 404;
      throw error;
    }

    /* Restringe acceso al pedido si el usuario es customer y no es el dueño */
    if (req.user.role === "customer" && order.user_id !== req.user.id) {
      const error = new Error("No tienes permiso para ver este pedido");
      error.status = 403;
      throw error;
    }

    return successResponse(res, "Pedido encontrado", { order });
  } catch (err) {
    next(err);
  }
};

/* Crea un nuevo pedido */
export const addOrder = async (req, res, next) => {
  try {
    const {
      reservation_id,
      table_id,
      order_type,
      status,
      payment_method,
      payment_status,
      special_instructions,
      items,
    } = req.body;

    /* Determina el user_id según rol (customer vs admin) */
    let user_id;
    if (req.user.role === "customer") {
      user_id = req.user.id;
    } else {
      if (!req.body.user_id) {
        const error = new Error(
          "Como administrador, debes especificar el ID del usuario para crear el pedido"
        );
        error.status = 400;
        throw error;
      }
      user_id = req.body.user_id;
    }

    /* Valida tipo de pedido requerido */
    if (!order_type) {
      const error = new Error(
        "Por favor, especifica el tipo de pedido (dine-in, takeout, delivery)"
      );
      error.status = 400;
      throw error;
    }

    /* Valida que haya al menos un item */
    if (!items || items.length === 0) {
      const error = new Error("Por favor, agrega al menos un item al pedido");
      error.status = 400;
      throw error;
    }

    const validOrderTypes = ["dine-in", "takeout", "delivery"];
    if (!validOrderTypes.includes(order_type)) {
      const error = new Error(
        "Tipo de pedido inválido. Elige entre: comer aquí (dine-in), para llevar (takeout) o entrega (delivery)"
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

    /* Asigna mesa automáticamente desde reserva si es dine-in y no se envía mesa */
    let finalTableId = table_id;
    let finalReservationId = reservation_id;
    let autoAssignedTable = false;

    if (order_type === "dine-in") {
      if (!table_id) {
        const activeReservation = await getActiveReservationByUserId(
          Number(user_id)
        );

        if (activeReservation) {
          finalTableId = activeReservation.table_id;
          finalReservationId = activeReservation.id;
          autoAssignedTable = true;
        } else {
          const error = new Error(
            "Para pedidos dine-in debes tener una reserva activa o especificar el número de mesa"
          );
          error.status = 400;
          throw error;
        }
      } else {
        const table = await getTableById(Number(table_id));
        if (!table) {
          const error = new Error("La mesa seleccionada no está disponible");
          error.status = 404;
          throw error;
        }

        if (!table.is_active) {
          const error = new Error(
            "La mesa seleccionada no está disponible en este momento"
          );
          error.status = 400;
          throw error;
        }

        finalTableId = Number(table_id);
      }
    }

    /* Valida items contra el menú y calcula total */
    let calculatedTotal = 0;
    const validatedItems = [];
    const rawItemsWithNames = [];

    for (const item of items) {
      if (!item.menu_item_id || !item.quantity) {
        const error = new Error(
          "Cada item debe tener menu_item_id y quantity"
        );
        error.status = 400;
        throw error;
      }

      const menuItem = await getMenuItemById(Number(item.menu_item_id));
      if (!menuItem) {
        const error = new Error(
          `El item del menú con ID ${item.menu_item_id} no existe`
        );
        error.status = 404;
        throw error;
      }

      if (!menuItem.is_available) {
        const error = new Error(
          `Lo sentimos, "${menuItem.name}" no está disponible en este momento`
        );
        error.status = 400;
        throw error;
      }

      const unit_price = Number(menuItem.price);
      const quantity = Number(item.quantity);
      const subtotal = quantity * unit_price;

      calculatedTotal += subtotal;

      validatedItems.push({
        menu_item_id: Number(item.menu_item_id),
        quantity,
        unit_price,
        subtotal,
        special_notes: item.special_notes || null,
      });

      rawItemsWithNames.push({
        id: Number(item.menu_item_id),
        name: menuItem.name,
        quantity,
        unit_price,
      });
    }

    const order_data = {
      user_id: Number(user_id),
      reservation_id: finalReservationId ? Number(finalReservationId) : null,
      table_id: finalTableId ? Number(finalTableId) : null,
      order_type,
      total_amount: calculatedTotal,
      ...(status && req.user.role === "admin" && { status }),
      ...(payment_method && { payment_method }),
      ...(payment_status && req.user.role === "admin" && { payment_status }),
      ...(special_instructions && { special_instructions }),
      items: validatedItems,
    };

    const order = await createOrder(order_data);

    const orderTypeNames = {
      "dine-in": "comer aquí",
      "takeout": "para llevar",
      "delivery": "entrega a domicilio",
    };

    const orderNumber = order.order_number;

    let successMessage = `¡Pedido creado! Número: ${orderNumber}, Tipo: ${orderTypeNames[order_type]}, Total: RD$${calculatedTotal.toFixed(
      2
    )}`;
    if (autoAssignedTable) {
      successMessage +=
        " - Mesa asignada automáticamente desde tu reserva";
    }

    const itemsSummaryLines = rawItemsWithNames.map(
      (it) =>
        `• ${it.name} x${it.quantity} (RD$${it.unit_price.toFixed(2)} c/u)`
    );
    const itemsSummaryText = itemsSummaryLines.join("\n");

    /* Envía correo de confirmación de creación de pedido */
    Promise.resolve(
      sendMail({
        to: user.email,
        subject: `Tu pedido ${orderNumber} ha sido creado`,
        title: `¡Gracias por tu pedido, ${user.name}!`,
        message:
          `Te confirmamos que tu pedido ${orderNumber} se creó correctamente.\n\n` +
          `Detalle de tu pedido:\n` +
          `${itemsSummaryText}\n\n` +
          `Total: RD$${calculatedTotal.toFixed(2)}\n` +
          `Tipo de pedido: ${
            orderTypeNames[order_type]
          }\n\nTe avisaremos cuando el estado de tu pedido cambie.`,
      })
    ).catch((err) =>
      console.error("Error al enviar correo de creación de pedido:", err)
    );

    return successResponse(
      res,
      successMessage,
      {
        order,
        details: {
          order_number: orderNumber,
          order_type: orderTypeNames[order_type],
          total_amount: calculatedTotal,
          items_count: validatedItems.length,
          user_name: user.name,
          table_id: finalTableId,
          reservation_id: finalReservationId,
          auto_assigned_table: autoAssignedTable,
        },
      },
      201
    );
  } catch (err) {
    next(err);
  }
};

/* Actualiza un pedido */
export const editOrder = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);

    /* Valida ID del pedido antes de modificar */
    if (isNaN(order_id) || order_id <= 0) {
      const error = new Error(
        "No se pudo encontrar el pedido que deseas modificar"
      );
      error.status = 400;
      throw error;
    }

    const existing = await getOrderById(order_id);

    if (!existing) {
      const error = new Error(
        "No encontramos tu pedido. Por favor, verifica tus datos."
      );
      error.status = 404;
      throw error;
    }

    /* Restringe modificaciones a pedidos ajenos si es customer */
    if (req.user.role === "customer" && existing.user_id !== req.user.id) {
      const error = new Error(
        "No tienes permiso para modificar este pedido"
      );
      error.status = 403;
      throw error;
    }

    /* Bloquea cambios si el pedido está cancelado o completado */
    if (existing.status === "cancelled" || existing.status === "completed") {
      const error = new Error(
        existing.status === "cancelled"
          ? "No puedes modificar un pedido que ya fue cancelado"
          : "No puedes modificar un pedido que ya fue completado"
      );
      error.status = 400;
      throw error;
    }

    if (req.body.user_id && req.user.role !== "admin") {
      const error = new Error(
        "No tienes permiso para cambiar el usuario del pedido"
      );
      error.status = 403;
      throw error;
    }

    if (req.body.user_id && req.body.user_id !== existing.user_id) {
      const user = await getUserById(Number(req.body.user_id));
      if (!user) {
        const error = new Error(
          "El usuario especificado no está registrado"
        );
        error.status = 404;
        throw error;
      }
    }

    if (req.body.table_id && req.body.table_id !== existing.table_id) {
      const newTable = await getTableById(Number(req.body.table_id));
      if (!newTable) {
        const error = new Error("La mesa seleccionada no está disponible");
        error.status = 404;
        throw error;
      }

      if (!newTable.is_active) {
        const error = new Error(
          "La mesa seleccionada no está disponible en este momento"
        );
        error.status = 400;
        throw error;
      }
    }

    const statusNames = {
      pending: "pendiente",
      confirmed: "confirmado",
      preparing: "en preparación",
      ready: "listo",
      completed: "completado",
      cancelled: "cancelado",
    };

    /* Valida que el nuevo estado sea uno permitido, si se envía */
    if (req.body.status !== undefined) {
      const validStatuses = [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "completed",
        "cancelled",
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
      ...(req.body.table_id && { table_id: req.body.table_id }),
      ...(req.body.order_type && { order_type: req.body.order_type }),
      ...(req.body.payment_method && { payment_method: req.body.payment_method }),
      ...(req.body.special_instructions !== undefined && {
        special_instructions: req.body.special_instructions,
      }),
    };

    /* Solo admin puede cambiar estado, pago o usuario */
    if (req.user.role === "admin") {
      if (req.body.status !== undefined) update_data.status = req.body.status;
      if (req.body.payment_status !== undefined)
        update_data.payment_status = req.body.payment_status;
      if (req.body.user_id) update_data.user_id = req.body.user_id;
    }

    if (Object.keys(update_data).length === 0) {
      const error = new Error(
        "No realizaste ningún cambio. Por favor, modifica al menos un campo."
      );
      error.status = 400;
      throw error;
    }

    const updated = await updateOrder(order_id, update_data);

    return successResponse(res, "¡Pedido actualizado correctamente!", {
      order: updated,
    });
  } catch (err) {
    next(err);
  }
};

/* Actualiza el estado de un pedido */
export const updateStatus = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);
    const { status } = req.body;

    /* Valida ID y que se envíe un estado */
    if (isNaN(order_id) || order_id <= 0) {
      const error = new Error(
        "No se pudo encontrar el pedido que deseas modificar"
      );
      error.status = 400;
      throw error;
    }

    if (!status) {
      const error = new Error(
        "Por favor, selecciona un estado para el pedido"
      );
      error.status = 400;
      throw error;
    }

    const statusNames = {
      pending: "pendiente",
      confirmed: "confirmado",
      preparing: "en preparación",
      ready: "listo",
      completed: "completado",
      cancelled: "cancelado",
    };

    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "completed",
      "cancelled",
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

    const existing = await getOrderById(order_id);

    if (!existing) {
      const error = new Error(
        "No encontramos tu pedido. Por favor, verifica tus datos."
      );
      error.status = 404;
      throw error;
    }

    /* Bloquea cambios si ya está completado o si se intenta salir de cancelado */
    if (existing.status === "completed") {
      const error = new Error(
        "No puedes cambiar el estado de un pedido que ya fue completado"
      );
      error.status = 400;
      throw error;
    }

    if (existing.status === "cancelled" && status !== "cancelled") {
      const error = new Error(
        "No puedes cambiar el estado de un pedido cancelado"
      );
      error.status = 400;
      throw error;
    }

    if (existing.status === status) {
      const error = new Error(
        `Tu pedido ya está ${statusNames[status]}. No se realizaron cambios.`
      );
      error.status = 400;
      throw error;
    }

    const updated = await updateOrderStatus(order_id, status);

    const user = await getUserById(existing.user_id);
    const orderNumber = existing.order_number;

    /* Envía correo al cliente cuando se actualiza el estado a ciertos valores */
    if (user) {
      let subject = "";
      let message = "";

      if (status === "confirmed") {
        subject = `¡Tu pedido ${orderNumber} fue confirmado!`;
        message =
          `Buenas noticias, ${user.name}.\n\n` +
          `Tu pedido ${orderNumber} ha sido confirmado y entra en cola para ser preparado.\n\n` +
          `Te avisaremos cuando esté listo.`;
      } else if (status === "ready") {
        subject = `Tu pedido ${orderNumber} está listo`;

        if (existing.order_type === "dine-in") {
          message =
            `Hola ${user.name},\n\n` +
            `Tu pedido ${orderNumber} está listo y en unos momentos lo estaremos llevando a tu mesa.\n` +
            `Si necesitas algo más, con gusto te atendemos.`;
        } else if (existing.order_type === "takeout") {
          message =
            `Hola ${user.name},\n\n` +
            `Tu pedido ${orderNumber} ya está listo para recoger.\n` +
            `Puedes pasar por el mostrador cuando quieras.`;
        } else if (existing.order_type === "delivery") {
          message =
            `Hola ${user.name},\n\n` +
            `Tu pedido ${orderNumber} está listo y saldrá en camino en breve.\n` +
            `Pronto lo tendrás en la puerta de tu casa.`;
        } else {
          message =
            `Hola ${user.name},\n\n` +
            `Tu pedido ${orderNumber} está listo.\n` +
            `Gracias por tu preferencia.`;
        }
      } else if (status === "completed") {
        subject = `Gracias, tu pedido ${orderNumber} fue completado`;
        const total = Number(
          updated.total_amount || existing.total_amount || 0
        );
        const paymentMethod =
          updated.payment_method || existing.payment_method || "no especificado";

        message =
          `¡Gracias por tu visita, ${user.name}!\n\n` +
          `Tu pedido ${orderNumber} se ha completado.\n\n` +
          `• Total: RD$${total.toFixed(2)}\n` +
          `• Método de pago: ${paymentMethod}\n\n` +
          `Esperamos verte pronto de nuevo.`;
      } else if (status === "cancelled") {
        subject = `Tu pedido ${orderNumber} fue cancelado`;
        message =
          `Hola ${user.name},\n\n` +
          `Tu pedido ${orderNumber} ha sido cancelado.\n` +
          `Si no esperabas este cambio, por favor contáctanos para ayudarte.`;
      }

      if (subject && message) {
        Promise.resolve(
          sendMail({
            to: user.email,
            subject,
            title: orderNumber,
            message,
          })
        ).catch((err) =>
          console.error("Error al enviar correo de estado de pedido:", err)
        );
      }
    }

    return successResponse(
      res,
      `Estado de tu pedido actualizado a "${statusNames[status]}"`,
      { order: updated }
    );
  } catch (err) {
    next(err);
  }
};

/* Actualiza el estado de pago de un pedido */
export const updatePayment = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);
    const { payment_status } = req.body;

    /* Valida ID y que se envíe estado de pago */
    if (isNaN(order_id) || order_id <= 0) {
      const error = new Error(
        "No se pudo encontrar el pedido que deseas modificar"
      );
      error.status = 400;
      throw error;
    }

    if (!payment_status) {
      const error = new Error("Por favor, selecciona un estado de pago");
      error.status = 400;
      throw error;
    }

    const paymentStatusNames = {
      pending: "pendiente",
      paid: "pagado",
      refunded: "reembolsado",
    };

    const validPaymentStatuses = ["pending", "paid", "refunded"];
    if (!validPaymentStatuses.includes(payment_status)) {
      const error = new Error(
        `El estado de pago seleccionado no es válido. Elige entre: ${Object.values(
          paymentStatusNames
        ).join(", ")}`
      );
      error.status = 400;
      throw error;
    }

    const existing = await getOrderById(order_id);

    if (!existing) {
      const error = new Error(
        "No encontramos tu pedido. Por favor, verifica tus datos."
      );
      error.status = 404;
      throw error;
    }

    if (existing.payment_status === payment_status) {
      const error = new Error(
        `El pago ya está ${paymentStatusNames[payment_status]}. No se realizaron cambios.`
      );
      error.status = 400;
      throw error;
    }

    const updated = await updatePaymentStatus(order_id, payment_status);

    const user = await getUserById(existing.user_id);
    const orderNumber = existing.order_number;

    /* Envía correo cuando cambia el estado de pago (pagado/reembolsado) */
    if (user) {
      let subject = "";
      let message = "";

      if (payment_status === "paid") {
        subject = `Hemos recibido el pago de tu pedido ${orderNumber}`;
        message =
          `Hola ${user.name},\n\n` +
          `Tu pago para el pedido ${orderNumber} se ha procesado correctamente.\n` +
          `Gracias por confiar en nosotros.`;
      } else if (payment_status === "refunded") {
        subject = `Tu pago del pedido ${orderNumber} ha sido reembolsado`;
        message =
          `Hola ${user.name},\n\n` +
          `El pago de tu pedido ${orderNumber} ha sido reembolsado.\n` +
          `Dependiendo de tu banco o método de pago, puede tardar unos días en verse reflejado.`;
      }

      if (subject && message) {
        Promise.resolve(
          sendMail({
            to: user.email,
            subject,
            title: orderNumber,
            message,
          })
        ).catch((err) =>
          console.error("Error al enviar correo de estado de pago:", err)
        );
      }
    }

    return successResponse(
      res,
      `Estado de pago actualizado a "${paymentStatusNames[payment_status]}"`,
      { order: updated }
    );
  } catch (err) {
    next(err);
  }
};

/* Cancela un pedido */
export const cancelOrderHandler = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);

    /* Valida ID del pedido antes de cancelar */
    if (isNaN(order_id) || order_id <= 0) {
      const error = new Error(
        "No se pudo encontrar el pedido que deseas cancelar"
      );
      error.status = 400;
      throw error;
    }

    const existing = await getOrderById(order_id);

    if (!existing) {
      const error = new Error(
        "No encontramos tu pedido. Por favor, verifica tus datos."
      );
      error.status = 404;
      throw error;
    }

    /* Restringe cancelación si el pedido no pertenece al usuario customer */
    if (req.user.role === "customer" && existing.user_id !== req.user.id) {
      const error = new Error("No tienes permiso para cancelar este pedido");
      error.status = 403;
      throw error;
    }

    if (existing.status === "cancelled") {
      const error = new Error(
        "Este pedido ya fue cancelado anteriormente"
      );
      error.status = 400;
      throw error;
    }

    if (existing.status === "completed") {
      const error = new Error(
        "No puedes cancelar un pedido que ya fue completado"
      );
      error.status = 400;
      throw error;
    }

    const cancelled = await cancelOrder(order_id);

    const user = await getUserById(existing.user_id);
    const orderNumber = existing.order_number;

    /* Envía correo de confirmación de cancelación al cliente */
    if (user) {
      Promise.resolve(
        sendMail({
          to: user.email,
          subject: `Tu pedido ${orderNumber} ha sido cancelado`,
          title: orderNumber,
          message:
            `Hola ${user.name},\n\n` +
            `Tu pedido ${orderNumber} ha sido cancelado correctamente.\n` +
            `Si tienes alguna duda, estamos aquí para ayudarte.`,
        })
      ).catch((err) =>
        console.error("Error al enviar correo de cancelación de pedido:", err)
      );
    }

    return successResponse(
      res,
      "Tu pedido ha sido cancelado correctamente",
      { order: cancelled }
    );
  } catch (err) {
    next(err);
  }
};

/* Elimina un pedido */
export const removeOrder = async (req, res, next) => {
  try {
    const order_id = Number(req.params.order_id);

    /* Valida ID antes de eliminar definitivamente el pedido */
    if (isNaN(order_id) || order_id <= 0) {
      const error = new Error(
        "No se pudo encontrar el pedido que deseas eliminar"
      );
      error.status = 400;
      throw error;
    }

    const order = await getOrderById(order_id);

    if (!order) {
      const error = new Error(
        "No encontramos tu pedido. Por favor, verifica tus datos."
      );
      error.status = 404;
      throw error;
    }

    await deleteOrder(order_id);

    return successResponse(
      res,
      "Tu pedido ha sido eliminado permanentemente"
    );
  } catch (err) {
    next(err);
  }
};
