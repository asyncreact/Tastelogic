// src/context/OrderContext.jsx
import { createContext, useState, useEffect, useCallback, useMemo } from "react";
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
  const { user } = useAuth();
  const userId = user?.id;

  const [orders, setOrders] = useState([]);
  const [ordersMeta, setOrdersMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [currentOrder, setCurrentOrder] = useState(null);

  const [cart, setCart] = useState(() => {
    try {
      if (!userId) return [];
      const savedCart = localStorage.getItem(`cart_${userId}`);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const parseApiError = useCallback((err, fallback) => {
    const errorData = err?.response?.data || {};
    if (errorData.details && Array.isArray(errorData.details)) {
      const message = errorData.message || fallback;
      return { message, details: errorData.details };
    }
    const message = errorData.message || err.message || fallback;
    return { message };
  }, []);

  useEffect(() => {
    try {
      if (userId) {
        localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
      }
    } catch {}
  }, [cart, userId]);

  useEffect(() => {
    if (!userId) {
      setCart([]);
    } else {
      try {
        const savedCart = localStorage.getItem(`cart_${userId}`);
        setCart(savedCart ? JSON.parse(savedCart) : []);
      } catch {
        setCart([]);
      }
    }
  }, [userId]);

  const fetchOrders = useCallback(
    async (params = {}) => {
      if (!user) {
        setOrders([]);
        setOrdersMeta((prev) => ({
          ...prev,
          total: 0,
          page: params.page || 1,
          limit: params.limit || prev.limit || 20,
          totalPages: 1,
        }));
        return { data: [], meta: { total: 0, page: 1, limit: params.limit || 20 } };
      }
      try {
        setLoading(true);
        setError(null);
        const response = await getOrders(params);
        const data =
          response.data?.orders ||
          response.data?.data ||
          response.data?.rows ||
          response.data ||
          [];
        const meta =
          response.data?.meta ||
          response.data?.pagination ||
          response.meta ||
          response.pagination ||
          {};
        const safeData = Array.isArray(data) ? data : [];
        const safeMeta = {
          total: Number(meta.total || meta.totalItems || safeData.length || 0),
          page: Number(meta.page || params.page || 1),
          limit: Number(meta.limit || params.limit || 20),
          totalPages:
            Number(meta.totalPages) ||
            (Number(meta.limit || params.limit || 20) > 0
              ? Math.ceil(
                  Number(meta.total || meta.totalItems || safeData.length || 0) /
                    Number(meta.limit || params.limit || 20)
                )
              : 1),
        };
        setOrders(safeData);
        setOrdersMeta(safeMeta);
        return { data: safeData, meta: safeMeta };
      } catch (err) {
        const parsed = parseApiError(err, "Error al cargar órdenes");
        setError(parsed.message);
        return { data: [], meta: { total: 0, page: 1, limit: params.limit || 20 } };
      } finally {
        setLoading(false);
      }
    },
    [user, parseApiError]
  );

  const fetchOrder = useCallback(
    async (orderId) => {
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
        throw parsed;
      } finally {
        setLoading(false);
      }
    },
    [user, parseApiError]
  );

  const addOrder = useCallback(
    async (orderData) => {
      if (!user) {
        throw { message: "Debes iniciar sesión para confirmar tu pedido." };
      }
      try {
        setLoading(true);
        setError(null);
        const response = await createOrder(orderData);
        const newOrder = response.data?.order || response.data?.data;
        setOrders((prev) => [newOrder, ...prev]);
        setOrdersMeta((prev) => ({
          ...prev,
          total: prev.total + 1,
        }));
        setCart([]);
        if (userId) localStorage.removeItem(`cart_${userId}`);
        return {
          success: true,
          message: response.data?.message || "Orden creada correctamente",
          order: newOrder,
        };
      } catch (err) {
        const parsed = parseApiError(err, "Error al crear orden");
        setError(parsed.message);
        throw parsed;
      } finally {
        setLoading(false);
      }
    },
    [user, userId, parseApiError]
  );

  const editOrder = useCallback(
    async (orderId, orderData) => {
      try {
        setLoading(true);
        setError(null);
        const response = await updateOrder(orderId, orderData);
        const updatedOrder = response.data?.order || response.data?.data;
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? updatedOrder : o))
        );
        setCurrentOrder((prev) =>
          prev && prev.id === orderId ? updatedOrder : prev
        );
        return {
          success: true,
          message: response.data?.message || "Orden actualizada correctamente",
          order: updatedOrder,
        };
      } catch (err) {
        const parsed = parseApiError(err, "Error al actualizar orden");
        setError(parsed.message);
        throw parsed;
      } finally {
        setLoading(false);
      }
    },
    [parseApiError]
  );

  const changeOrderStatus = useCallback(
    async (orderId, status) => {
      try {
        setLoading(true);
        setError(null);
        const response = await updateOrderStatus(orderId, status);
        const updatedOrder = response.data?.order || response.data?.data;
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? updatedOrder : o))
        );
        setCurrentOrder((prev) =>
          prev && prev.id === orderId ? updatedOrder : prev
        );
        return {
          success: true,
          message: response.data?.message || "Estado de la orden actualizado",
          order: updatedOrder,
        };
      } catch (err) {
        const parsed = parseApiError(err, "Error al actualizar estado de orden");
        setError(parsed.message);
        throw parsed;
      } finally {
        setLoading(false);
      }
    },
    [parseApiError]
  );

  const changePaymentStatus = useCallback(
    async (orderId, paymentStatus) => {
      try {
        setLoading(true);
        setError(null);
        const response = await updateOrderPayment(orderId, paymentStatus);
        const updatedOrder = response.data?.order || response.data?.data;
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? updatedOrder : o))
        );
        setCurrentOrder((prev) =>
          prev && prev.id === orderId ? updatedOrder : prev
        );
        return {
          success: true,
          message: response.data?.message || "Estado de pago actualizado",
          order: updatedOrder,
        };
      } catch (err) {
        const parsed = parseApiError(err, "Error al actualizar pago");
        setError(parsed.message);
        throw parsed;
      } finally {
        setLoading(false);
      }
    },
    [parseApiError]
  );

  const cancelOrderById = useCallback(
    async (orderId) => {
      try {
        setLoading(true);
        setError(null);
        const response = await cancelOrder(orderId);
        const updatedOrder = response.data?.order || response.data?.data;
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? updatedOrder : o))
        );
        setCurrentOrder((prev) =>
          prev && prev.id === orderId ? updatedOrder : prev
        );
        return {
          success: true,
          message: response.data?.message || "Orden cancelada correctamente",
          order: updatedOrder,
        };
      } catch (err) {
        const parsed = parseApiError(err, "Error al cancelar orden");
        setError(parsed.message);
        throw parsed;
      } finally {
        setLoading(false);
      }
    },
    [parseApiError]
  );

  const removeOrder = useCallback(
    async (orderId) => {
      try {
        setLoading(true);
        setError(null);
        const response = await deleteOrder(orderId);
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        setOrdersMeta((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
        setCurrentOrder((prev) => (prev && prev.id === orderId ? null : prev));
        return {
          success: true,
          message: response.data?.message || "Orden eliminada correctamente",
        };
      } catch (err) {
        const parsed = parseApiError(err, "Error al eliminar orden");
        setError(parsed.message);
        throw parsed;
      } finally {
        setLoading(false);
      }
    },
    [parseApiError]
  );

  const addToCart = useCallback((item, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const updateCartQuantity = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== itemId));
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    if (userId) localStorage.removeItem(`cart_${userId}`);
  }, [userId]);

  const getCartTotal = useCallback(() => {
    return cart.reduce(
      (total, item) => total + Number(item.price) * item.quantity,
      0
    );
  }, [cart]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      orders,
      ordersMeta,
      currentOrder,
      cart,
      loading,
      error,
      fetchOrders,
      fetchOrder,
      addOrder,
      editOrder,
      changeOrderStatus,
      changePaymentStatus,
      cancelOrderById,
      removeOrder,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      getCartTotal,
      clearError,
    }),
    [
      orders,
      ordersMeta,
      currentOrder,
      cart,
      loading,
      error,
      fetchOrders,
      fetchOrder,
      addOrder,
      editOrder,
      changeOrderStatus,
      changePaymentStatus,
      cancelOrderById,
      removeOrder,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      getCartTotal,
      clearError,
    ]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}
