// src/api/orders.js
import api from './auth';

// ============================================================
// 📦 ÓRDENES
// ============================================================

// Listar todas las órdenes (Admin ve todas, Customer solo las suyas)
export const getOrders = (params = {}) => api.get('/orders', { params });

// Obtener una orden específica
export const getOrder = (orderId) => api.get(`/orders/${orderId}`);

// Crear nueva orden
export const createOrder = (data) => api.post('/orders', data);

// Actualizar orden
export const updateOrder = (orderId, data) => api.put(`/orders/${orderId}`, data);

// Actualizar estado de la orden (solo admin)
export const updateOrderStatus = (orderId, status) => 
  api.patch(`/orders/${orderId}/status`, { status });

// Actualizar estado de pago (solo admin)
export const updateOrderPayment = (orderId, payment_status) => 
  api.patch(`/orders/${orderId}/payment`, { payment_status });

// Cancelar orden
export const cancelOrder = (orderId) => api.patch(`/orders/${orderId}/cancel`);

// Eliminar orden (solo admin)
export const deleteOrder = (orderId) => api.delete(`/orders/${orderId}`);

// ============================================================
// 📊 ESTADÍSTICAS (Solo Admin)
// ============================================================

export const getOrderStats = () => api.get('/orders/statistics/general');
export const getOrderStatsByDate = (params) => api.get('/orders/statistics/by-date', { params });
export const getOrderStatsByType = () => api.get('/orders/statistics/by-type');
export const getTopSellingItems = () => api.get('/orders/statistics/top-selling');
