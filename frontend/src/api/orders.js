// src/api/orders.js
import api from './auth';

/* Listar órdenes */
export const getOrders = (params = {}) => api.get('/orders', { params });

/* Obtener una orden por ID */
export const getOrder = (orderId) => api.get(`/orders/${orderId}`);

/* Crear nueva orden */
export const createOrder = (data) => api.post('/orders', data);

/* Actualizar una orden */
export const updateOrder = (orderId, data) => api.put(`/orders/${orderId}`, data);

/* Actualizar estado de la orden */
export const updateOrderStatus = (orderId, status) =>
  api.patch(`/orders/${orderId}/status`, { status });

/* Actualizar estado de pago */
export const updateOrderPayment = (orderId, payment_status) =>
  api.patch(`/orders/${orderId}/payment`, { payment_status });

/* Cancelar orden */
export const cancelOrder = (orderId) => api.patch(`/orders/${orderId}/cancel`);

/* Eliminar orden */
export const deleteOrder = (orderId) => api.delete(`/orders/${orderId}`);
