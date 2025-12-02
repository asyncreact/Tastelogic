// api/auth.js

import axios from "axios";

/* Normaliza la URL base eliminando barra final */
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

/* Instancia de Axios con configuración base */
const api = axios.create({
  baseURL: `${API_URL}/api`,
});

/* Interceptor para agregar token en cada solicitud */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* Interceptor para manejar errores de autenticación */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const silentAuth = error.config?.silentAuth;
    const token = localStorage.getItem("token");

    if (status === 401 && !silentAuth) {
      if (token) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

/* Registro de usuario */
export const registerUser = (data) => api.post("/auth/register", data);

/* Inicio de sesión */
export const loginUser = (data) => api.post("/auth/login", data);

/* Verificación de cuenta */
export const verifyAccount = (token) => api.get(`/auth/verify/${token}`);

/* Solicitud de recuperación */
export const forgotPassword = (data) => api.post("/auth/forgot-password", data);

/* Restablecimiento de contraseña */
export const resetPassword = (token, data) => api.post(`/auth/reset-password/${token}`, data);

/* Obtener perfil del usuario */
export const getProfile = (silentAuth = false) =>
  api.get("/auth/me", { silentAuth });

/* Cierre de sesión */
export const logoutUser = () => api.post("/auth/logout");

/* Obtener token */
export const getToken = () => localStorage.getItem("token");

/* Guardar token */
export const setToken = (token) => {
  localStorage.setItem("token", token);
};

/* Eliminar token */
export const removeToken = () => {
  localStorage.removeItem("token");
};

/* Verificar si existe token */
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

export default api;
