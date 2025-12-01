// src/context/OrderContext.jsx

import { createContext, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  updateOrderStatus,
  updateOrderPayment,
  cancelOrder,
  deleteOrder,
} from "../api/orders";

export const OrderContext = createContext();

export function OrderProvider({ children }) {
  const { user } = useAuth(); // Usuario actual
  const userId = user?.id;

  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Carrito por usuario
  const [cart, setCart] = useState(() => {
    try {
      if (!userId) return [];
      const savedCart = localStorage.getItem(`cart_${userId}`);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error al cargar carrito:", error);
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper: parsear error del backend (similar a AuthContext)
  const parseApiError = (err, fallback) => {
    const errorData = err?.response?.data || {};

    if (errorData.details && Array.isArray(errorData.details)) {
      const message = errorData.message || fallback;
      return { message, details: errorData.details };
    }

    const message = errorData.message || err.message || fallback;
    return { message };
  };

  // Guardar carrito en localStorage
  useEffect(() => {
    try {
      if (userId) {
        localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
      }
    } catch (error) {
      console.error("Error al guardar carrito:", error);
    }
  }, [cart, userId]);

  // Cargar carrito cuando cambia el usuario
  useEffect(() => {
    if (!userId) {
      setCart([]);
    } else {
      try {
        const savedCart = localStorage.getItem(`cart_${userId}`);
        setCart(savedCart ? JSON.parse(savedCart) : []);
      } catch (error) {
        console.error("Error al cargar carrito:", error);
        setCart([]);
      }
    }
  }, [userId]);

  // ================= ÓRDENES =================

  const fetchOrders = async (params = {}) => {
    // No llamar al backend si no hay usuario
    if (!user) {
      setOrders([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getOrders(params);
      setOrders(response.data?.orders || response.data?.data || []);
    } catch (err) {
      const parsed = parseApiError(err, "Error al cargar órdenes");
      setError(parsed.message);
      console.error("Error fetchOrders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrder = async (orderId) => {
    if (!user) {
      throw { message: "Debes iniciar sesión para ver los detalles de la orden." };
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getOrder(orderId);
      const orderData =
        response.data?.order || response.data?.data || response.data;
      setCurrentOrder(orderData);
      return orderData;
    } catch (err) {
      const parsed = parseApiError(err, "Error al cargar orden");
      setError(parsed.message);
      console.error("Error fetchOrder:", err);
      throw parsed;
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (orderData) => {
    if (!user) {
      throw { message: "Debes iniciar sesión para confirmar tu pedido." };
    }

    try {
      setLoading(true);
      setError(null);
      const response = await createOrder(orderData);
      const newOrder = response.data?.order || response.data?.data;
      setOrders((prev) => [newOrder, ...prev]);
      setCart([]);
      if (userId) {
        localStorage.removeItem(`cart_${userId}`);
      }

      return {
        success: true,
        message: response.data?.message || "Orden creada correctamente",
        order: newOrder,
      };
    } catch (err) {
      const parsed = parseApiError(err, "Error al crear orden");
      setError(parsed.message);
      console.error("Error addOrder:", err);
      throw parsed;
    } finally {
      setLoading(false);
    }
  };

  const editOrder = async (orderId, orderData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateOrder(orderId, orderData);
      const updatedOrder = response.data?.order || response.data?.data;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updatedOrder : o))
      );

      if (currentOrder?.id === orderId) {
        setCurrentOrder(updatedOrder);
      }

      return {
        success: true,
        message: response.data?.message || "Orden actualizada correctamente",
        order: updatedOrder,
      };
    } catch (err) {
      const parsed = parseApiError(err, "Error al actualizar orden");
      setError(parsed.message);
      console.error("Error editOrder:", err);
      throw parsed;
    } finally {
      setLoading(false);
    }
  };

  const changeOrderStatus = async (orderId, status) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateOrderStatus(orderId, status);
      const updatedOrder = response.data?.order || response.data?.data;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updatedOrder : o))
      );

      if (currentOrder?.id === orderId) {
        setCurrentOrder(updatedOrder);
      }

      return {
        success: true,
        message:
          response.data?.message || "Estado de la orden actualizado",
        order: updatedOrder,
      };
    } catch (err) {
      const parsed = parseApiError(err, "Error al actualizar estado");
      setError(parsed.message);
      console.error("Error changeOrderStatus:", err);
      throw parsed;
    } finally {
      setLoading(false);
    }
  };

  const changePaymentStatus = async (orderId, paymentStatus) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateOrderPayment(orderId, paymentStatus);
      const updatedOrder = response.data?.order || response.data?.data;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updatedOrder : o))
      );

      if (currentOrder?.id === orderId) {
        setCurrentOrder(updatedOrder);
      }

      return {
        success: true,
        message:
          response.data?.message || "Estado de pago actualizado",
        order: updatedOrder,
      };
    } catch (err) {
      const parsed = parseApiError(err, "Error al actualizar pago");
      setError(parsed.message);
      console.error("Error changePaymentStatus:", err);
      throw parsed;
    } finally {
      setLoading(false);
    }
  };

  const cancelOrderById = async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await cancelOrder(orderId);
      const updatedOrder = response.data?.order || response.data?.data;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updatedOrder : o))
      );

      if (currentOrder?.id === orderId) {
        setCurrentOrder(updatedOrder);
      }

      return {
        success: true,
        message:
          response.data?.message || "Orden cancelada correctamente",
        order: updatedOrder,
      };
    } catch (err) {
      const parsed = parseApiError(err, "Error al cancelar orden");
      setError(parsed.message);
      console.error("Error cancelOrderById:", err);
      throw parsed;
    } finally {
      setLoading(false);
    }
  };

  const removeOrder = async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await deleteOrder(orderId);

      setOrders((prev) => prev.filter((o) => o.id !== orderId));

      if (currentOrder?.id === orderId) {
        setCurrentOrder(null);
      }

      return {
        success: true,
        message:
          response.data?.message || "Orden eliminada correctamente",
      };
    } catch (err) {
      const parsed = parseApiError(err, "Error al eliminar orden");
      setError(parsed.message);
      console.error("Error removeOrder:", err);
      throw parsed;
    } finally {
      setLoading(false);
    }
  };

  // ================= CARRITO =================

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

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
    if (userId) {
      localStorage.removeItem(`cart_${userId}`);
    }
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + Number(item.price) * item.quantity,
      0
    );
  };

  const clearError = () => setError(null);

  const value = {
    // Estado
    orders,
    currentOrder,
    cart,
    loading,
    error,

    // Órdenes
    fetchOrders,
    fetchOrder,
    addOrder,
    editOrder,
    changeOrderStatus,
    changePaymentStatus,
    cancelOrderById,
    removeOrder,

    // Carrito
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,

    // Utilidades
    clearError,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}
