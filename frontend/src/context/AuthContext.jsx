// context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import {
  loginUser,
  registerUser,
  logoutUser,
  getProfile,
} from "../api/auth";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // ✅ Inicializar desde localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Verificar sesión al cargar (si hay token en localStorage)
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getProfile(true);
        const userData = response.data?.user || response.user || response.data;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (err) {
        // Token inválido o expirado
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ✅ Registro - Mejorado para manejar errores de Zod
  const register = async (data) => {
    try {
      setError(null);
      const response = await registerUser(data);
      
      // Extraer el mensaje de éxito
      const message = response.data?.message || "Registro exitoso";
      
      return { 
        success: true, 
        message,
        data: response.data 
      };
    } catch (err) {
      // ✅ Manejar estructura de error del backend
      const errorData = err.response?.data || {};
      
      // Si tiene detalles de validación (errores de Zod), devolverlos
      if (errorData.details && Array.isArray(errorData.details)) {
        const errorMessage = errorData.message || "Errores de validación";
        setError(errorMessage);
        
        // Lanzar el error completo con details para SweetAlert2
        throw {
          message: errorMessage,
          details: errorData.details
        };
      }
      
      // Error simple sin detalles
      const message = errorData.message || err.message || "Error al registrar";
      setError(message);
      throw { message };
    }
  };

  // ✅ Login - Mejorado para manejar errores
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await loginUser(credentials);
      
      // ✅ Extraer token y user del formato del backend
      // Formato esperado: { success: true, message: "...", data: { token, user } }
      const responseData = response.data?.data || response.data;
      const token = responseData?.token;
      const userData = responseData?.user;

      if (!token || !userData) {
        throw { message: "Respuesta del servidor inválida" };
      }

      // ✅ Guardar en localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return { 
        success: true, 
        message: response.data?.message || "Login exitoso",
        user: userData 
      };
    } catch (err) {
      // ✅ Manejar estructura de error del backend
      const errorData = err.response?.data || {};
      
      // Si tiene detalles de validación
      if (errorData.details && Array.isArray(errorData.details)) {
        const errorMessage = errorData.message || "Errores de validación";
        setError(errorMessage);
        throw {
          message: errorMessage,
          details: errorData.details
        };
      }
      
      // Error simple
      const message = errorData.message || err.message || "Error al iniciar sesión";
      setError(message);
      throw { message };
    }
  };

  // ✅ Logout
  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      // Limpiar localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setError(null);
    }
  };

  // ✅ Verificar si está autenticado
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem("token");
  };

  // ✅ Verificar roles
  const hasRole = (role) => {
    if (!user) return false;
    if (user.role === role) return true;
    if (Array.isArray(user.roles) && user.roles.includes(role)) return true;
    return false;
  };

  // ✅ Refrescar perfil manualmente
  const refreshUser = async () => {
    try {
      const response = await getProfile();
      const userData = response.data?.user || response.user || response.data;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
