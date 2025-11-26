import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";
import { verifyAccount } from "../api/auth";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// Importamos el CSS Flat compartido
import "./css/Login.css";

const MySwal = withReactContent(Swal);

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  
  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (hasVerified.current) return;
      hasVerified.current = true;

      // Configuración base para alertas Flat
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const swalBaseConfig = {
        background: isDark ? '#000' : '#fff',
        color: isDark ? '#fff' : '#000',
        customClass: { popup: 'rounded-0 border-1 border-secondary' }
      };

      // 1. Mostrar Loading Flat
      MySwal.fire({
        title: 'VERIFICANDO EMAIL',
        text: 'Por favor espera un momento...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        ...swalBaseConfig,
        didOpen: () => {
          MySwal.showLoading();
        }
      });

      try {
        const response = await verifyAccount(token);
        setStatus("success");
        
        const message = 
          response.data?.data?.message || 
          response.data?.message || 
          "Tu cuenta ha sido verificada exitosamente";

        // 2. Éxito Flat
        await MySwal.fire({
          title: 'EMAIL VERIFICADO',
          text: message,
          icon: 'success',
          confirmButtonText: 'IR A INICIAR SESIÓN',
          confirmButtonColor: '#000',
          allowOutsideClick: false,
          ...swalBaseConfig
        });

        navigate("/login");

      } catch (err) {
        setStatus("error");
        
        const errorMessage = 
          err.response?.data?.message || 
          "El enlace de verificación es inválido o ha expirado";

        // 3. Error Flat
        const result = await MySwal.fire({
          title: 'ERROR DE VERIFICACIÓN',
          text: errorMessage,
          icon: 'error',
          showCancelButton: true,
          confirmButtonText: 'REGISTRARSE NUEVAMENTE',
          cancelButtonText: 'IR AL LOGIN',
          confirmButtonColor: '#000',
          cancelButtonColor: '#6c757d',
          reverseButtons: true,
          ...swalBaseConfig
        });

        if (result.isConfirmed) {
          navigate("/register");
        } else if (result.dismiss === MySwal.DismissReason.cancel) {
          navigate("/login");
        }
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <div className="login-page d-flex align-items-center justify-content-center">
      <Container>
        <Row className="w-100 justify-content-center">
          <Col md={8} lg={6} xl={5}>
            
            {/* CARD FLAT */}
            <Card className="login-card-flat text-center">
              <Card.Body className="p-5">
                
                <h2 className="login-title mb-3">TasteLogic</h2>
                <p className="login-subtitle mb-4">ESTADO DE VERIFICACIÓN</p>
                
                <div className="py-4">
                  {status === "loading" && (
                    <div className="text-muted small text-uppercase letter-spacing-1">
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Procesando solicitud...
                    </div>
                  )}
                  
                  {status === "success" && (
                    <div className="text-success fw-bold text-uppercase letter-spacing-1">
                      ¡Verificación Exitosa!
                    </div>
                  )}
                  
                  {status === "error" && (
                    <div className="text-danger fw-bold text-uppercase letter-spacing-1">
                      No se pudo verificar el correo
                    </div>
                  )}
                </div>

              </Card.Body>
            </Card>

          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default VerifyEmail;