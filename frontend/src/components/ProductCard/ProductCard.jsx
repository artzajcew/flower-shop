// frontend/src/components/ProductCard/ProductCard.jsx
import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext'; // Добавляем импорт
import './ProductCard.css';

function ProductCard({ id, name, price, image, category, description }) {
  const { addToCart } = useCart();
  const { user } = useAuth(); // Получаем информацию о пользователе
  const [imgError, setImgError] = useState(false);
  const [buttonText, setButtonText] = useState('В корзину');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false); // Для модального окна

  const product = {
    id,
    name,
    price,
    image,
    category,
    description
  };

  const handleCardClick = () => {
    const event = new CustomEvent('openProductModal', { detail: product });
    window.dispatchEvent(event);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    
    // Проверяем, авторизован ли пользователь
    if (!user) {
      // Показываем модальное окно с предупреждением
      setShowAuthModal(true);
      return;
    }
    
    // Если авторизован - добавляем в корзину
    addToCart(product);
    
    setButtonText('Добавлено!');
    setIsButtonDisabled(true);
    
    setTimeout(() => {
      setButtonText('В корзину');
      setIsButtonDisabled(false);
    }, 3000);
  };

  const handleImageError = () => {
    console.log('Ошибка загрузки изображения:', image);
    setImgError(true);
  };

  const imageUrl = image || '/placeholder.jpg';

  return (
    <>
      <div className="product-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
        {imgError ? (
          <div className="product-image-placeholder">
            <span>🖼️ {name.substring(0, 20)}</span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={name}
            className="product-image"
            onError={handleImageError}
            loading="lazy"
          />
        )}
        <div className="product-info">
          <span className="product-category">{category}</span>
          <h3 className="product-name">{name}</h3>
          <p className="product-price">{Number(price).toLocaleString()} ₽</p>
          <button 
            className={`add-to-cart-btn ${isButtonDisabled ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={isButtonDisabled}
          >
            {buttonText}
          </button>
        </div>
      </div>

      {/* Модальное окно для неавторизованных */}
      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
            <button className="auth-modal-close" onClick={() => setShowAuthModal(false)}>×</button>
            <div className="auth-modal-icon">🔒</div>
            <h3>Требуется авторизация</h3>
            <p>Чтобы добавить товар в корзину, пожалуйста, войдите в аккаунт</p>
            <div className="auth-modal-buttons">
              <button 
                className="auth-modal-login"
                onClick={() => {
                  setShowAuthModal(false);
                  window.location.href = '/login';
                }}
              >
                Войти
              </button>
              <button 
                className="auth-modal-register"
                onClick={() => {
                  setShowAuthModal(false);
                  window.location.href = '/register';
                }}
              >
                Зарегистрироваться
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductCard;