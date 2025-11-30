// src/context/UserContext.jsx
import { createContext, useState, useEffect } from "react";
import api from "../api/auth";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        setUsersError(null);
        const res = await api.get("/users?role=customer");
        const data = res.data?.users || res.data?.data || [];
        setUsers(data);
      } catch (err) {
        console.error("Error al cargar usuarios:", err);
        const message =
          err.response?.data?.message ||
          err.message ||
          "No se pudieron cargar los usuarios";
        setUsersError(message);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  const getUserById = (id) =>
    users.find((u) => String(u.id) === String(id)) || null;

  const refreshUsers = async () => {
    try {
      setLoadingUsers(true);
      setUsersError(null);
      const res = await api.get("/users?role=customer");
      const data = res.data?.users || res.data?.data || [];
      setUsers(data);
    } catch (err) {
      console.error("Error al recargar usuarios:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "No se pudieron recargar los usuarios";
      setUsersError(message);
      throw new Error(message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const value = {
    users,
    loadingUsers,
    usersError,
    getUserById,
    refreshUsers,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
