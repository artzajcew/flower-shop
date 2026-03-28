// frontend/src/components/ProductCard/ProductCard.jsx
import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './ProductCard.css';

function ProductCard({ id, name, price, image, category, description, quantity }) {
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Получаем количество этого товара в корзине
  const cartItem = cart.find(item => item.id === id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;
  
  const isInStock = quantity > 0;

  const product = {
    id,
    name,
    price,
    image,
    category,
    description,
    quantity
  };

  const handleCardClick = () => {
    const event = new CustomEvent('openProductModal', { detail: product });
    window.dispatchEvent(event);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (!isInStock) {
      alert('Товар временно отсутствует на складе');
      return;
    }
    
    addToCart(product);
  };

  const handleIncrease = (e) => {
    e.stopPropagation();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (cartQuantity + 1 <= quantity) {
      updateQuantity(id, cartQuantity + 1);
    } else {
      alert(`На складе только ${quantity} шт.`);
    }
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (cartQuantity > 1) {
      updateQuantity(id, cartQuantity - 1);
    } else {
      removeFromCart(id);
    }
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
          <p className="product-stock">
            {isInStock ? (
              <span className="in-stock">В наличии: {quantity} шт.</span>
            ) : (
              <span className="out-of-stock">Нет в наличии</span>
            )}
          </p>
          
          {cartQuantity > 0 ? (
            <div className="cart-controls" onClick={(e) => e.stopPropagation()}>
              <button 
                className="cart-decrease-btn"
                onClick={handleDecrease}
                disabled={!isInStock}
              >
                -
              </button>
              <span className="cart-quantity">{cartQuantity}</span>
              <button 
                className="cart-increase-btn"
                onClick={handleIncrease}
                disabled={!isInStock || cartQuantity >= quantity}
              >
                +
              </button>
            </div>
          ) : (
            <button
              className={`add-to-cart-btn ${!isInStock ? 'disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={!isInStock}
            >
              {!isInStock ? 'Нет в наличии' : 'В корзину'}
            </button>
          )}
        </div>
      </div>

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