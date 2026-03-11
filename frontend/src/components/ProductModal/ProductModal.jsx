import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext'; // Исправлено: ../ → ../../
import './ProductModal.css';

function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleClose = () => {
    onClose();
    navigate(-1);
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>×</button>
        
        <div className="modal-grid">
          <div className="modal-image">
            <img src={product.image} alt={product.name} />
          </div>
          
          <div className="modal-info">
            <span className="modal-category">{product.category}</span>
            <h2 className="modal-name">{product.name}</h2>
            <p className="modal-price">{product.price.toLocaleString()} ₽</p>
            
            <div className="modal-description">
              <h3>Описание букета</h3>
              <p>{product.description}</p>
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