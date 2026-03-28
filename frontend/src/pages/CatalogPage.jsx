import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard/ProductCard.jsx';
import { getProducts, getCategories } from '../api/api';
import './CatalogPage.css';

function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [flowers, setFlowers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    inStock: false
  });

  // Загружаем категории
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data);
      } catch (err) {
        console.error('Ошибка загрузки категорий:', err);
      }
    };
    loadCategories();
  }, []);

  // Загружаем товары с фильтрацией
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        
        if (selectedCategory !== 'all') {
          const category = categories.find(c => 
            c.name.toLowerCase() === selectedCategory.toLowerCase()
          );
          if (category) params.category_id = category.id;
        }
        
        if (filters.minPrice) params.min_price = filters.minPrice;
        if (filters.maxPrice) params.max_price = filters.maxPrice;
        if (filters.inStock) params.in_stock = true;
        
        const response = await getProducts(params);
        setFlowers(response.data);
      } catch (err) {
        console.error('Ошибка загрузки товаров:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory, filters, categories]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <p>Наша команда флористов создаст цветочную композицию специально по вашему заказу, используя цветы высочайшего качества и профессионализм.</p>
        </div>
      </section>
      
      <div className="catalog-page">
        <div className="catalog-header">
          <h1 className="catalog-title">All Bouquets</h1>
        </div>

        <div className="filters">
          <button 
            className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            Все
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              className={`filter-btn ${selectedCategory === category.name.toLowerCase() ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.name.toLowerCase())}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="advanced-filters">
          <input
            type="number"
            name="minPrice"
            placeholder="Мин. цена"
            value={filters.minPrice}
            onChange={handleFilterChange}
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Макс. цена"
            value={filters.maxPrice}
            onChange={handleFilterChange}
          />
          <label>
            <input
              type="checkbox"
              name="inStock"
              checked={filters.inStock}
              onChange={handleFilterChange}
            />
            Только в наличии
          </label>
        </div>

        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : (
          <>
            <div className="products-count">
              Найдено букетов: {flowers.length}
            </div>

            <div className="products-grid">
              {flowers.map(flower => (
                <ProductCard
                  key={flower.id}
                  id={flower.id}
                  name={flower.name}
                  price={flower.price}
                  category={flower.category?.name || flower.category}
                  image={flower.image}
                  description={flower.description}
                  quantity={flower.quantity}
                />
              ))}
            </div>
          </>
        )}

        <div className="mission-section">
          <div className="mission-column mission-title">
            <h2>OUR MISSION</h2>
          </div>
          <div className="mission-column mission-text">
            <p>
              Мы создаем букеты, которые дарят эмоции. Каждый цветок отбирается вручную, 
              каждая композиция продумывается до мелочей. Наша цель — делать ваши особенные 
              моменты еще прекраснее с помощью языка цветов.
            </p>
          </div>
          <div className="mission-column mission-text">
            <p>
              Более 10 лет мы радуем клиентов свежими цветами и авторским подходом. 
              Работаем только с проверенными поставщиками, гарантируем свежесть букетов 
              до 7 дней. Индивидуальный подход к каждому заказу.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default CatalogPage;