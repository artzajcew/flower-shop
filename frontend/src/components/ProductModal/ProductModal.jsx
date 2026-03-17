import React from 'react';
import { useCart } from '../../context/CartContext';
import './ProductModal.css';

function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-grid">
          <div className="modal-image">
            <img 
              src={product.image || '/placeholder.jpg'} 
              alt={product.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder.jpg';
              }}
            />
          </div>
          
          <div className="modal-info">
            <span className="modal-category">{product.category}</span>
            <h2 className="modal-name">{product.name}</h2>
            <p className="modal-price">{Number(product.price).toLocaleString()} ₽</p>
            
            <div className="modal-description">
              <h3>Описание букета</h3>
              <p>{product.description || 'Нет описания'}</p>
            </div>
            
            <div className="modal-actions">
              <button 
                className="modal-add-to-cart"
                onClick={handleAddToCart}
              >
                Добавить в корзину
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;