import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom'; // Импорт вверху
import './CartPage.css';

function CartPage() {
  // ВСЕ ХУКИ ВЫЗЫВАЕМ В САМОМ НАЧАЛЕ
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate(); // Хук ДО любых условий
  
  // ТЕПЕРЬ можно проверять корзину
  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Корзина пуста</h2>
        <p>Добавьте цветы из каталога</p>
      </div>
    );
  }

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="cart-page">
      <h1>Корзина</h1>
      
      {cart.map(item => (
        <div key={item.id} className="cart-item">
          <img src={item.image} alt={item.name} />
          <div className="cart-item-info">
            <h3>{item.name}</h3>
            <p>{item.price} ₽</p>
          </div>
          
          <div className="cart-item-quantity">
            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
            <span>{item.quantity}</span>
            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
          </div>
          
          <div className="cart-item-total">
            {item.price * item.quantity} ₽
          </div>
          
          <button onClick={() => removeFromCart(item.id)}>×</button>
        </div>
      ))}
      
      <div className="cart-summary">
        <div className="cart-total">
          <strong>Итого: {totalPrice} ₽</strong>
        </div>
        
        <button className="checkout-btn" onClick={handleCheckout}>
          Оформить заказ
        </button>
      </div>
    </div>
  );
}

export default CartPage;