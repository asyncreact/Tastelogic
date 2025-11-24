// src/context/OrderContext.jsx
import { createContext, useState, useEffect } from 'react';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  updateOrderStatus,
  updateOrderPayment,
  cancelOrder,
  deleteOrder,
  getOrderStats,
  getOrderStatsByDate,
  getOrderStatsByType,
  getTopSellingItems,
} from '../api/orders';

export const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  
  // Cargar carrito desde localStorage al iniciar
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      return [];
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error al guardar carrito:', error);
    }
  }, [cart]);

  // Cargar órdenes del usuario/admin
  const fetchOrders = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrders(params);
      setOrders(response.data?.orders || response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar órdenes');
      console.error('Error fetchOrders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener una orden específica
  const fetchOrder = async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrder(orderId);
      setCurrentOrder(response.data?.order || response.data?.data || null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar orden');
      console.error('Error fetchOrder:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva orden
  const addOrder = async (orderData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createOrder(orderData);
      const newOrder = response.data?.order || response.data?.data;
      setOrders((prev) => [newOrder, ...prev]);
      setCart([]); // Limpiar carrito después de crear orden
      return newOrder;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear orden');
      console.error('Error addOrder:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar orden completa
  const editOrder = async (orderId, orderData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateOrder(orderId, orderData);
      const updatedOrder = response.data?.order || response.data?.data;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
      if (currentOrder?.id === orderId) {
        setCurrentOrder(updatedOrder);
      }
      return updatedOrder;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar orden');
      console.error('Error editOrder:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar estado de orden (solo admin)
  const changeOrderStatus = async (orderId, status) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateOrderStatus(orderId, status);
      const updatedOrder = response.data?.order || response.data?.data;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
      if (currentOrder?.id === orderId) {
        setCurrentOrder(updatedOrder);
      }
      return updatedOrder;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar estado');
      console.error('Error changeOrderStatus:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar estado de pago (solo admin)
  const changePaymentStatus = async (orderId, paymentStatus) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateOrderPayment(orderId, paymentStatus);
      const updatedOrder = response.data?.order || response.data?.data;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
      if (currentOrder?.id === orderId) {
        setCurrentOrder(updatedOrder);
      }
      return updatedOrder;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar pago');
      console.error('Error changePaymentStatus:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancelar orden
  const cancelOrderById = async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await cancelOrder(orderId);
      const updatedOrder = response.data?.order || response.data?.data;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
      if (currentOrder?.id === orderId) {
        setCurrentOrder(updatedOrder);
      }
      return updatedOrder;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cancelar orden');
      console.error('Error cancelOrderById:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar orden (solo admin)
  const removeOrder = async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (currentOrder?.id === orderId) {
        setCurrentOrder(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar orden');
      console.error('Error removeOrder:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 🛒 FUNCIONES DEL CARRITO
  // ============================================================

  // Agregar item al carrito
  const addToCart = (item, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  };

  // Remover item del carrito
  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Actualizar cantidad de item en carrito
  const updateCartQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  // Limpiar carrito
  const clearCart = () => {
    setCart([]);
  };

  // Calcular total del carrito
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // ============================================================
  // 📊 ESTADÍSTICAS (Solo Admin)
  // ============================================================

  const fetchOrderStats = async () => {
    try {
      setLoading(true);
      const response = await getOrderStats();
      setStats(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar estadísticas');
      console.error('Error fetchOrderStats:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchStatsByDate = async (params) => {
    try {
      const response = await getOrderStatsByDate(params);
      return response.data;
    } catch (err) {
      console.error('Error fetchStatsByDate:', err);
      throw err;
    }
  };

  const fetchStatsByType = async () => {
    try {
      const response = await getOrderStatsByType();
      return response.data;
    } catch (err) {
      console.error('Error fetchStatsByType:', err);
      throw err;
    }
  };

  const fetchTopSellingItems = async () => {
    try {
      const response = await getTopSellingItems();
      return response.data;
    } catch (err) {
      console.error('Error fetchTopSellingItems:', err);
      throw err;
    }
  };

  // Limpiar error
  const clearError = () => setError(null);

  const value = {
    // Estado
    orders,
    currentOrder,
    cart,
    loading,
    error,
    stats,

    // Funciones de órdenes
    fetchOrders,
    fetchOrder,
    addOrder,
    editOrder,
    changeOrderStatus,
    changePaymentStatus,
    cancelOrderById,
    removeOrder,

    // Funciones del carrito
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,

    // Estadísticas
    fetchOrderStats,
    fetchStatsByDate,
    fetchStatsByType,
    fetchTopSellingItems,

    // Utilidades
    clearError,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}
