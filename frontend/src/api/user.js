// src/api/user.js
import api from "./auth";

// ============================================================
// 👤 USUARIOS (solo admin)
// ============================================================

/**
 * Lista usuarios con filtros opcionales.
 * Ejemplo: fetchUsers({ role: "customer" })
 */
export const fetchUsers = (params = {}) => {
  return api.get("/users", { params });
};

/**
 * (Opcional) Obtener un usuario por ID, si creas el endpoint en backend.
 */
// export const fetchUserById = (id) => api.get(`/users/${id}`);

export default {
  fetchUsers,
};
