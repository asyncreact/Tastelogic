// pages/customer/MenuCustomer.jsx
import { useState, useMemo, useCallback, useEffect } from "react";
import CustomerLayout from "../../layouts/CustomerLayout";
import AuthOverlay from "../../components/AuthOverlay";
import { getPublicItems, getPublicCategories } from "../../api/menu";
import {
  MdSearch,
  MdRestaurantMenu,
  MdCategory,
  MdOutlineFastfood,
} from "react-icons/md";
import "./MenuCustomer.css";

// Constantes
const FILTER_ALL = "all";

export default function MenuCustomer() {
  // Estados
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(FILTER_ALL);
  const [searchTerm, setSearchTerm] = useState("");

  // ============================================================
  // EFECTOS
  // ============================================================

  useEffect(() => {
    fetchMenuData();
  }, []);

  // ============================================================
  // FUNCIONES DE CARGA DE DATOS
  // ============================================================

  const fetchMenuData = async () => {
    try {
      setLoading(true);

      // Usar funciones públicas de tu api/menu.js
      const [itemsRes, categoriesRes] = await Promise.all([
        getPublicItems(),
        getPublicCategories(),
      ]);

      const itemsData = itemsRes.data.data?.items || itemsRes.data.items || [];
      const categoriesData = categoriesRes.data.data?.categories || categoriesRes.data.categories || [];

      setItems(itemsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error al cargar menú:", error);
      setItems([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // ============================================================
  // CÁLCULOS Y FILTROS (MEMOIZADOS)
  // ============================================================

  const availableItems = useMemo(() => {
    return items.filter((item) => item.is_available);
  }, [items]);

  const filteredByCategory = useMemo(() => {
    if (selectedCategory === FILTER_ALL) return availableItems;
    return availableItems.filter(
      (item) => item.category_id === parseInt(selectedCategory)
    );
  }, [availableItems, selectedCategory]);

  const filteredItems = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return filteredByCategory.filter(
      (item) =>
        item.name.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
    );
  }, [filteredByCategory, searchTerm]);

  // ============================================================
  // COMPONENTES AUXILIARES
  // ============================================================

  const SearchBar = () => (
    <div className="menucustomer-search-box">
      <MdSearch className="menucustomer-search-icon" />
      <input
        type="text"
        placeholder="Buscar platillos..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
    </div>
  );

  const CategoryFilter = () => (
    <div className="menucustomer-category-filters">
      <button
        className={`menucustomer-filter-btn ${selectedCategory === FILTER_ALL ? "active" : ""}`}
        onClick={() => handleCategoryChange(FILTER_ALL)}
      >
        <MdRestaurantMenu />
        Todos
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          className={`menucustomer-filter-btn ${selectedCategory === category.id ? "active" : ""}`}
          onClick={() => handleCategoryChange(category.id)}
        >
          <MdCategory />
          {category.name}
        </button>
      ))}
    </div>
  );

  const MenuItemCard = ({ item }) => {
    const category = categories.find((cat) => cat.id === item.category_id);
    const itemPrice =
      typeof item.price === "string" ? parseFloat(item.price) : item.price;

    return (
      <div className="menucustomer-menu-item-card">
        {item.image_url && (
          <div className="menucustomer-item-image">
            <img src={item.image_url} alt={item.name} />
          </div>
        )}

        <div className="menucustomer-item-content">
          <div className="menucustomer-item-header">
            <h3>{item.name}</h3>
            <span className="menucustomer-item-category">{category?.name}</span>
          </div>

          <p className="menucustomer-item-description">{item.description}</p>

          {item.ingredients && (
            <p className="menucustomer-item-ingredients">
              <small>Ingredientes: {item.ingredients}</small>
            </p>
          )}

          <div className="menucustomer-item-footer">
            <span className="menucustomer-item-price">${itemPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

  const EmptyState = ({ icon: Icon, message }) => (
    <div className="menucustomer-no-results">
      <Icon className="menucustomer-empty-icon" />
      <p>{message}</p>
    </div>
  );

  // ============================================================
  // RENDER
  // ============================================================

  if (loading) {
    return (
      <CustomerLayout>
        <div className="menucustomer-container">
          <div className="menucustomer-loading">
            <div className="menucustomer-spinner"></div>
            <span>Cargando menú...</span>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <AuthOverlay>
        <div className="menucustomer-container">
          {/* Header del menú */}
          <div className="menucustomer-header">
            <h1>Nuestro Menú</h1>
            <p>Descubre nuestros deliciosos platillos</p>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="menucustomer-filters">
            <SearchBar />
            <CategoryFilter />
          </div>

          {/* Grid de items */}
          <div className="menucustomer-menu-grid">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))
            ) : (
              <EmptyState
                icon={MdOutlineFastfood}
                message="No se encontraron platillos"
              />
            )}
          </div>
        </div>
      </AuthOverlay>
    </CustomerLayout>
  );
}
