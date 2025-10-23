import "./MessageModal.css";

export default function MessageModal({ type = "info", message, details = [], onClose }) {
  if (!message) return null;

  const isSuccess = type === "success";
  const isError = type === "error";

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h3
          className={`modal-title ${
            isSuccess ? "success" : isError ? "error" : "info"
          }`}
        >
          {isSuccess ? "Éxito" : isError ? "Error" : "Mensaje"}
        </h3>

        {/* 🧠 Mensaje principal */}
        <p className="modal-message">{message}</p>

        {/* 🧩 Mostrar lista de detalles si existen */}
        {details && details.length > 0 && (
          <ul className="modal-error-list">
            {details.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}

        <button
          className={`modal-button ${
            isSuccess ? "success" : isError ? "error" : "info"
          }`}
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
