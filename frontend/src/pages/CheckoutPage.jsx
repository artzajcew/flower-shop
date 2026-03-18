import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';
import './CheckoutPage.css';

function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { createOrder, loading } = useOrders();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    deliveryMethod: 'pickup',
    address: '',
    paymentMethod: 'card'
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    
    try {
      // Подготавливаем данные для заказа
      // В функции handleSubmit, замените создание orderData на:

const orderData = {
  recipient_name: formData.fullName,
  recipient_phone: formData.phone,
  delivery_address: formData.deliveryMethod === 'delivery' ? formData.address : 'Самовывоз',
  delivery_date: new Date(Date.now() + 24*60*60*1000).toISOString(), // завтра
  items: cart.map(item => ({
    good_id: item.id,           // было id, нужно good_id
    count: item.quantity        // было quantity, нужно count
  }))
};

      
      const orderId = await createOrder(orderData);
      clearCart();
      navigate(`/order/${orderId}`);
    } catch (err) {
      alert('Ошибка при создании заказа. Попробуйте позже.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1>Оформление заказа</h1>
      
      <div className="checkout-container">
        <div className="checkout-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>ФИО получателя *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Иванов Иван Иванович"
                className={errors.fullName ? 'error' : ''}
                disabled={submitting}
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ivan@example.com"
                className={errors.email ? 'error' : ''}
                disabled={submitting}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Номер телефона получателя*</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+7 (999) 123-45-67"
                className={errors.phone ? 'error' : ''}
                disabled={submitting}
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
                    disabled={submitting}
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
                    disabled={submitting}
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
                  disabled={submitting}
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
                    disabled={submitting}
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
                    disabled={submitting}
                  />
                  Наличными при получении
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="pay-btn" 
              disabled={submitting || loading}
            >
              {submitting ? 'Оформление...' : `Оформить заказ ${totalPrice} ₽`}
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