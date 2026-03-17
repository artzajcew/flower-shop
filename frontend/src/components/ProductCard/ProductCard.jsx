// frontend/src/components/ProductCard/ProductCard.jsx
import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

function ProductCard({ id, name, price, image, category, description }) {
  const { addToCart } = useCart();
  const [imgError, setImgError] = useState(false);
  const [buttonText, setButtonText] = useState('В корзину');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Создаем объект product внутри компонента из пропсов
  const product = {
    id,
    name,
    price,
    image,
    category,
    description
  };

  const handleCardClick = () => {
    // Получаем сохраненное состояние модального окна из родительского компонента
    // через кастомное событие или через контекст
    const event = new CustomEvent('openProductModal', { detail: product });
    window.dispatchEvent(event);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);

    // Меняем текст кнопки
    setButtonText('Добавлено!');
    setIsButtonDisabled(true);

    // Возвращаем исходный текст через 3 секунды
    setTimeout(() => {
      setButtonText('В корзину');
      setIsButtonDisabled(false);
    }, 3000);
  };

  const handleImageError = () => {
    console.log('Ошибка загрузки изображения:', image);
    setImgError(true);
  };

  // Определяем URL изображения
  const imageUrl = image || '/placeholder.jpg';

  return (
    <div className="product-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      {imgError ? (
        <div className="product-image-placeholder">
          <span>🖼 {name.substring(0, 20)}</span>
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
  );
}

export default ProductCard;