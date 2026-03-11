import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard/ProductCard.jsx';
import './CatalogPage.css';

function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState('все');
  const [flowers, setFlowers] = useState([]);

  // Загружаем цветы из localStorage
  useEffect(() => {
    const savedFlowers = localStorage.getItem('flowers');
    if (savedFlowers) {
      setFlowers(JSON.parse(savedFlowers));
    }
  }, []);

  const getFilteredFlowers = () => {
    if (selectedCategory === 'все') {
      return flowers;
    }
    return flowers.filter(flower => 
      flower.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  };

  const filteredFlowers = getFilteredFlowers();

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
            className={`filter-btn ${selectedCategory === 'все' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('все')}
          >
            Все
          </button>
          <button 
            className={`filter-btn ${selectedCategory === 'люкс' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('люкс')}
          >
            Люкс
          </button>
          <button 
            className={`filter-btn ${selectedCategory === 'авторский' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('авторский')}
          >
            Авторские
          </button>
          <button 
            className={`filter-btn ${selectedCategory === 'сборный' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('сборный')}
          >
            Сборные
          </button>
        </div>

        <div className="products-count">
          Найдено букетов: {filteredFlowers.length}
        </div>

        <div className="products-grid">
          {filteredFlowers.map(flower => (
            <ProductCard
              key={flower.id}
              id={flower.id}
              name={flower.name}
              price={flower.price}
              category={flower.category}
              image={flower.image}
              description={flower.description}
            />
          ))}
        </div>

        {/* Миссия секция */}
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