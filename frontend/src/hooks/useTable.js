// hooks/useTables.js
import { useContext } from "react";
import { TableContext } from "../context/TableContext";

export const useTables = () => {
  const context = useContext(TableContext);

  if (!context) {
    throw new Error("useTables debe ser usado dentro de un TableProvider");
  }

  return context;
};
