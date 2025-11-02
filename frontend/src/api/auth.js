// api/auth.js

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// ✅ Crear instancia con configuración
const api = axios.create({
  baseURL: API_URL,
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
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
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

export const getProfile = () => 
  api.get("/auth/me");

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
