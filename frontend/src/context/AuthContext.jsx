// context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { loginUser, registerUser, logoutUser, getProfile } from "../api/auth";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  /* Cargar usuario desde localStorage */
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  /* Verificar token al iniciar la aplicación */
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getProfile(true);
        const userData =
          response.data?.user || response.user || response.data;

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch {
        /* Token inválido → limpiar sesión */
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /* Registrar usuario */
  const register = async (data) => {
    try {
      setError(null);
      const response = await registerUser(data);

      return {
        success: true,
        message: response.data?.message || "Registro exitoso",
        data: response.data,
      };
    } catch (err) {
      const errorData = err.response?.data || {};

      if (errorData.details) {
        const errorMessage = errorData.message || "Errores de validación";
        setError(errorMessage);
        throw { message: errorMessage, details: errorData.details };
      }

      const message = errorData.message || err.message || "Error al registrar";
      setError(message);
      throw { message };
    }
  };

  /* Iniciar sesión */
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await loginUser(credentials);

      const responseData = response.data?.data || response.data;
      const token = responseData?.token;
      const userData = responseData?.user;

      if (!token || !userData) throw { message: "Respuesta inválida" };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return {
        success: true,
        message: response.data?.message || "Login exitoso",
        user: userData,
      };
    } catch (err) {
      const errorData = err.response?.data || {};

      if (errorData.details) {
        const errorMessage = errorData.message || "Errores de validación";
        setError(errorMessage);
        throw { message: errorMessage, details: errorData.details };
      }

      const message =
        errorData.message || err.message || "Error al iniciar sesión";
      setError(message);
      throw { message };
    }
  };

  /* Cerrar sesión */
  const logout = async () => {
    try {
      await logoutUser();
    } catch {}
    finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setError(null);
    }
  };

  /* Verificar si está autenticado */
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem("token");
  };

  /* Verificar rol del usuario */
  const hasRole = (role) => {
    if (!user) return false;
    if (user.role === role) return true;
    return Array.isArray(user.roles) && user.roles.includes(role);
  };

  /* Actualizar datos del usuario */
  const refreshUser = async () => {
    try {
      const response = await getProfile();
      const userData =
        response.data?.user || response.user || response.data;

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated,
    hasRole,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
