// src/controllers/user.controller.js
import { getUsers } from "../repositories/user.repository.js";
import { successResponse } from "../utils/response.js";

/* Lista usuarios (solo admin, con filtro opcional por rol) */
export const listUsers = async (req, res, next) => {
  try {
    const { role } = req.query;

    const filters = {};
    if (role) {
      filters.role = role;
    }

    const users = await getUsers(filters);

    return successResponse(res, "Usuarios obtenidos correctamente", {
      users,
      count: users.length,
    });
  } catch (err) {
    next(err);
  }
};
