// pages/customer/MenuCustomer.jsx

import { useState } from "react";
import CustomerLayout from "../../layouts/CustomerLayout";
import { useMenu } from "../../hooks/useMenu";
import { FaSearch } from "react-icons/fa";
import "./MenuCustomer.css";

export default function MenuCustomer() {
  const { items, categories, loading, getAvailableItems } = useMenu();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  if (loading) {
    return (
      <CustomerLayout>
        <div className="menu-customer">
          <div className="loading">Cargando menú...</div>
        </div>
      </CustomerLayout>
    );
  }

  // Filtrar items disponibles
  const availableItems = getAvailableItems();

  // Filtrar por categoría
  const filteredByCategory = selectedCategory === "all"
    ? availableItems
    : availableItems.filter(item => item.category_id === parseInt(selectedCategory));

  // Filtrar por búsqueda
  const filteredItems = filteredByCategory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <CustomerLayout>
      <div className="menu-customer">
        {/* Header del menú */}
        <div className="menu-header">
          <h1>Nuestro Menú</h1>
          <p>Descubre nuestros deliciosos platillos</p>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="menu-filters">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar platillos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-filters">
            <button
              className={`filter-btn ${selectedCategory === "all" ? "active" : ""}`}
              onClick={() => setSelectedCategory("all")}
            >
              Todos
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                className={`filter-btn ${selectedCategory === category.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de items */}
        <div className="menu-grid">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => {
              const category = categories.find(cat => cat.id === item.category_id);
              const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
              
              return (
                <div key={item.id} className="menu-item-card">
                  {item.image_url && (
                    <div className="item-image">
                      <img src={item.image_url} alt={item.name} />
                    </div>
                  )}
                  
                  <div className="item-content">
                    <div className="item-header">
                      <h3>{item.name}</h3>
                      <span className="item-category">{category?.name}</span>
                    </div>
                    
                    <p className="item-description">{item.description}</p>
                    
                    {item.ingredients && (
                      <p className="item-ingredients">
                        <small>Ingredientes: {item.ingredients}</small>
                      </p>
                    )}
                    
                    <div className="item-footer">
                      <span className="item-price">${itemPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-results">
              <p>No se encontraron platillos</p>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
