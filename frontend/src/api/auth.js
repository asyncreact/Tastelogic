import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const registerUser = (data) => axios.post(`${API_URL}/auth/register`, data);
export const loginUser = (data) => axios.post(`${API_URL}/auth/login`, data);
export const verifyAccount = (token) => axios.get(`${API_URL}/auth/verify/${token}`);
export const forgotPassword = (data) => axios.post(`${API_URL}/auth/forgot-password`, data);
export const resetPassword = (token, data) =>
  axios.post(`${API_URL}/auth/reset-password/${token}`, data);
export const getProfile = (token) =>
  axios.get(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
export const logoutUser = (token) =>
  axios.post(`${API_URL}/auth/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });
