// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { MenuProvider } from "./context/MenuContext";
import { OrderProvider } from "./context/OrderContext";
import { ReservationProvider } from "./context/ReservationContext";
import { TableProvider } from "./context/TableContext";
import { AiProvider } from "./context/AiContext";
import App from "./App";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/index.css";

const orangeGradients = [
  "linear-gradient(135deg, #ff7a18 0%, #ffb347 100%)",
  "linear-gradient(135deg, #ff6a00 0%, #ffcc33 100%)",
  "linear-gradient(135deg, #ff8c42 0%, #ff5f6d 100%)",
];

const randomGradient =
  orangeGradients[Math.floor(Math.random() * orangeGradients.length)];

document.documentElement.style.setProperty("--btn-orange-1", randomGradient);

const redGradients = [
  "linear-gradient(135deg, #ef4444 0%, #f97373 100%)",
  "linear-gradient(135deg, #dc2626 0%, #fb923c 100%)",
  "linear-gradient(135deg, #b91c1c 0%, #f97316 100%)",
];

const randomRedGradient =
  redGradients[Math.floor(Math.random() * redGradients.length)];

document.documentElement.style.setProperty("--btn-red-1", randomRedGradient);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <MenuProvider>
            <OrderProvider>
              <ReservationProvider>
                <TableProvider>
                  <AiProvider>
                    <App />
                  </AiProvider>
                </TableProvider>
              </ReservationProvider>
            </OrderProvider>
          </MenuProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
