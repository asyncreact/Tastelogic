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

export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const verifyAccount = (token) => api.get(`/auth/verify/${token}`);
export const forgotPassword = (data) => api.post("/auth/forgot-password", data);
export const resetPassword = (token, data) =>
  api.post(`/auth/reset-password/${token}`, data);
export const getProfile = () => api.get("/auth/me");
export const logoutUser = () => api.post("/auth/logout");
