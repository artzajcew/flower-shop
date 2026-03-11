import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { flowers } from '../data/flowers';
import './ProductPage.css';

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const found = flowers.find(f => f.id === parseInt(id));
    if (found) {
      setProduct(found);
    } else {
      navigate('/catalog');
    }
  }, [id, navigate]);

  if (!product) return <div>Загрузка...</div>;

  return (
    <div className="product-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Назад</button>
      
      <div className="product-container">
        <div className="product-gallery">
          <img src={product.image} alt={product.name} />
        </div>
        
        <div className="product-details">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="product-price">{product.price.toLocaleString()} ₽</p>
          
          <div className="product-description">
            <h3>Описание</h3>
            <p>{product.description}</p>
          </div>
          
          <button 
            className="add-to-cart-btn"
            onClick={() => addToCart(product)}
          >
            В корзину
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;