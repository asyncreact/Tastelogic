// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { MenuProvider } from './context/MenuContext.jsx';
import { OrderProvider } from './context/OrderContext.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MenuProvider>
          <OrderProvider>
          <App />
          </OrderProvider>
        </MenuProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
