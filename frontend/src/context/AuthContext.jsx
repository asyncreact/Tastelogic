// context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { getProfile } from "../api/auth";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar el usuario desde el token almacenado
  const loadUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // ✅ Primero intenta obtener del backend
      const res = await getProfile();
      setUser(res.data.user);
    } catch (error) {
      console.log("⚠️ Error al obtener perfil del backend, decodificando token...");

      // ✅ Si falla, decodifica el JWT localmente
      try {
        const decoded = jwtDecode(token);
        const userData = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name,
        };
        setUser(userData);
      } catch (decodeError) {
        console.error("❌ Token inválido");
        localStorage.removeItem("token");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // ✅ Actualizar usuario tras login
  const login = (userData) => {
    setUser(userData);
  };

  // 🔹 Cerrar sesión
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
