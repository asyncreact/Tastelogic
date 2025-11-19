// pages/VerifyEmail.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";
import { verifyAccount } from "../api/auth";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

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

      MySwal.fire({
        title: 'Verificando email',
        text: 'Por favor espera un momento',
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
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

        await MySwal.fire({
          title: 'Email Verificado',
          text: message,
          icon: 'success',
          confirmButtonText: 'Ir a Iniciar Sesión',
          confirmButtonColor: '#1f2937', // ✅ Color actualizado
          allowOutsideClick: false
        });

        navigate("/login");

      } catch (err) {
        setStatus("error");
        
        const errorMessage = 
          err.response?.data?.message || 
          "El enlace de verificación es inválido o ha expirado";

        const result = await MySwal.fire({
          title: 'Error de Verificación',
          text: errorMessage,
          icon: 'error',
          showCancelButton: true,
          confirmButtonText: 'Registrarse Nuevamente',
          cancelButtonText: 'Intentar Iniciar Sesión',
          confirmButtonColor: '#1f2937', // ✅ Color actualizado
          cancelButtonColor: '#6c757d',
          reverseButtons: true
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
    <Container className="min-vh-100 d-flex align-items-center justify-content-center">
      <Row className="w-100">
        <Col md={6} lg={5} className="mx-auto">
          <Card className="shadow text-center">
            <Card.Body className="p-5">
              <div className="text-muted">
                {status === "loading" && "Verificando..."}
                {status === "success" && "Verificación exitosa"}
                {status === "error" && "Error en la verificación"}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default VerifyEmail;
