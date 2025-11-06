// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./routes/AppRouter";
import { AuthProvider } from "./context/AuthContext";

// ✅ IMPORTAR BOOTSTRAP CSS (primero)


// ✅ IMPORTAR BOOTSTRAP JS (para componentes interactivos)

// ✅ TUS ESTILOS PERSONALIZADOS (después de Bootstrap)
import "./styles/global.css";

// ✅ Versión sin StrictMode (recomendada para desarrollo local)
ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);
