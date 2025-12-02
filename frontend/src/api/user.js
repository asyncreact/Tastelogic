// src/api/user.js
import api from "./auth";

/* Listar usuarios con filtros opcionales */
export const fetchUsers = (params = {}) => {
  return api.get("/users", { params });
};

export default {
  fetchUsers,
};
