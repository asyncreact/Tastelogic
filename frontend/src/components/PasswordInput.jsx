import { useState } from "react";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import "./PasswordInput.css";

export default function PasswordInput({
  value,
  onChange,
  placeholder,
  required = false,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-wrapper">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="password-input"
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="password-toggle"
        title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {showPassword ? <LuEye /> : <LuEyeClosed />}
      </button>
    </div>
  );
}
