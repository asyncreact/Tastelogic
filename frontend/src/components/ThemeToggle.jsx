import { useTheme } from "../context/ThemeContext";
import { BsSun, BsMoon } from "react-icons/bs";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      aria-label="Cambiar tema"
    >
      {/* Si es dark, mostramos el sol para cambiar a light */}
      {theme === "dark" ? <BsSun size={18} /> : <BsMoon size={18} />}
    </button>
  );
};

export default ThemeToggle;