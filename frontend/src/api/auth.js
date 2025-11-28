// api/auth.js

import axios from "axios";

// ✅ Remover la barra final si existe
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

// ✅ Crear instancia con configuración
const api = axios.create({
  baseURL: `${API_URL}/api`, // Ahora no habrá doble barra
});

// ✅ Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Interceptor de respuesta para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const silentAuth = error.config?.silentAuth;
    const token = localStorage.getItem("token");

    if (status === 401 && !silentAuth) {
      // Solo redirigir si HABÍA sesión (token presente)
      if (token) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      // Si no hay token (invitado), no redirigimos; dejamos que el componente maneje el error
    }

    return Promise.reject(error);
  }
);

// ============================================================
// 🔐 AUTENTICACIÓN
// ============================================================

export const registerUser = (data) =>
  api.post("/auth/register", data);

export const loginUser = (data) =>
  api.post("/auth/login", data);

export const verifyAccount = (token) =>
  api.get(`/auth/verify/${token}`);

export const forgotPassword = (data) =>
  api.post("/auth/forgot-password", data);

export const resetPassword = (token, data) =>
  api.post(`/auth/reset-password/${token}`, data);

export const getProfile = (silentAuth = false) =>
  api.get("/auth/me", { silentAuth });

export const logoutUser = () =>
  api.post("/auth/logout");

// ============================================================
// 🛠️ UTILIDADES
// ============================================================

/**
 * Obtiene el token actual del localStorage
 */
export const getToken = () => localStorage.getItem("token");

/**
 * Guarda el token en localStorage
 */
export const setToken = (token) => {
  localStorage.setItem("token", token);
};

/**
 * Elimina el token del localStorage
 */
export const removeToken = () => {
  localStorage.removeItem("token");
};

/**
 * Verifica si el usuario está autenticado
 */
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

export default api;
