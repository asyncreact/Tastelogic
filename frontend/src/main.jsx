// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// Importamos el nuevo Provider
import { ThemeProvider } from './context/ThemeContext'; 
import { AuthProvider } from './context/AuthContext';
import { MenuProvider } from './context/MenuContext';
import { OrderProvider } from './context/OrderContext';
import { ReservationProvider } from './context/ReservationContext';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
// Importa tus estilos globales aquí
import './styles/App.css'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <MenuProvider>
            <OrderProvider>
              <ReservationProvider>
                <App />
              </ReservationProvider>
            </OrderProvider>
          </MenuProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);