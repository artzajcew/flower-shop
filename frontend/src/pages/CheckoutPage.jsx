import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';
import './CheckoutPage.css';

function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { createOrder } = useOrders();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    deliveryMethod: 'pickup',
    address: '',
    paymentMethod: 'card' // card, cash
  });

  const [errors, setErrors] = useState({});

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Введите ФИО';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Введите номер телефона';
    } else if (!/^\+?[0-9\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Введите корректный номер телефона';
    }
    
    if (formData.deliveryMethod === 'delivery' && !formData.address.trim()) {
      newErrors.address = 'Введите адрес доставки';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Создаем заказ
    const orderId = createOrder({
      ...formData,
      items: cart,
      total: totalPrice
    });
    
    // Очищаем корзину
    clearCart();
    
    // Переходим на страницу заказа
    navigate(`/order/${orderId}`);
  };

  return (
    <div className="checkout-page">
      <h1>Оформление заказа</h1>
      
      <div className="checkout-container">
        <div className="checkout-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>ФИО *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Иванов Иван Иванович"
                className={errors.fullName ? 'error' : ''}
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ivan@example.com"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Номер телефона *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+7 (999) 123-45-67"
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label>Способ доставки *</label>
              <div className="delivery-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={formData.deliveryMethod === 'pickup'}
                    onChange={handleChange}
                  />
                  Самовывоз (г. Москва, ул. Цветочная, 1)
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="delivery"
                    checked={formData.deliveryMethod === 'delivery'}
                    onChange={handleChange}
                  />
                  Доставка
                </label>
              </div>
            </div>

            {formData.deliveryMethod === 'delivery' && (
              <div className="form-group">
                <label>Адрес доставки *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="г. Москва, ул. Пушкина, д. 10, кв. 5"
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>
            )}

            <div className="form-group">
              <label>Способ оплаты</label>
              <div className="payment-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                  />
                  Картой онлайн
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleChange}
                  />
                  Наличными при получении
                </label>
              </div>
            </div>

            <button type="submit" className="pay-btn">
              Оплатить {totalPrice} ₽
            </button>
          </form>
        </div>

        <div className="order-summary">
          <h3>Ваш заказ</h3>
          <div className="order-items">
            {cart.map(item => (
              <div key={item.id} className="order-item">
                <span className="item-name">{item.name} x{item.quantity}</span>
                <span className="item-price">{item.price * item.quantity} ₽</span>
              </div>
            ))}
          </div>
          <div className="order-total">
            <span>Итого:</span>
            <span>{totalPrice} ₽</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;