// hooks/useAuth.js
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Hook personalizado para acceder al contexto de autenticación
 * @throws {Error} Si se usa fuera del AuthProvider
 * @returns {Object} Objeto con user, loading, error y funciones de auth
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  
  return context;
};
