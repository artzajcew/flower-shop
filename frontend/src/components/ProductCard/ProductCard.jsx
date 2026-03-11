import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

function ProductCard({ id, name, price, image, category, description }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const product = { id, name, price, image, category, description };

  const handleCardClick = () => {
    navigate(`/product/${id}`, { 
      state: { modal: true, product } 
    });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleImageError = () => {
    console.log('Ошибка загрузки изображения:', image);
    setImgError(true);
  };

  return (
    <div className="product-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      {imgError ? (
        <div className="product-image-placeholder">
          <span>🖼️ {name.substring(0, 20)}</span>
        </div>
      ) : (
        <img 
          src={image} 
          alt={name} 
          className="product-image"
          onError={handleImageError}
          loading="lazy"
        />
      )}
      <div className="product-info">
        <span className="product-category">{category}</span>
        <h3 className="product-name">{name}</h3>
        <p className="product-price">{price.toLocaleString()} ₽</p>
        <button 
          className="add-to-cart-btn"
          onClick={handleAddToCart}
        >
          В корзину
        </button>
      </div>
    </div>
  );
}

export default ProductCard;