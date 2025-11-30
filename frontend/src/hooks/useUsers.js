// src/hooks/useUsers.js
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUsers debe usarse dentro de un UserProvider");
  }
  return context;
};
