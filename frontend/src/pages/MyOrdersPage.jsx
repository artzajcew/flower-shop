import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import './MyOrdersPage.css';

function MyOrdersPage() {
  const navigate = useNavigate();
  const { orders, getUserOrders } = useOrders();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userOrders, setUserOrders] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (email || phone) {
      const found = getUserOrders(email, phone);
      setUserOrders(found);
      setSearched(true);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'processing': 'Обрабатывается',
      'confirmed': 'Подтвержден',
      'shipped': 'Отправлен',
      'delivered': 'Доставлен',
      'cancelled': 'Отменен'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'processing': '#ffc107',
      'confirmed': '#17a2b8',
      'shipped': '#007bff',
      'delivered': '#28a745',
      'cancelled': '#dc3545'
    };
    return colorMap[status] || '#6c757d';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="my-orders-page">
      <h1>Мои заказы</h1>
      
      <div className="search-section">
        <h3>Введите ваши данные для поиска заказов</h3>
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ivan@example.com"
            />
          </div>
          
          <div className="form-group">
            <label>Телефон:</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (999) 123-45-67"
            />
          </div>
          
          <button type="submit" className="search-btn">
            Найти заказы
          </button>
        </form>
        <p className="hint">* Заполните хотя бы одно поле</p>
      </div>

      {searched && (
        <div className="orders-section">
          {userOrders.length === 0 ? (
            <div className="no-orders">
              <p>Заказы не найдены</p>
              <button onClick={() => navigate('/')} className="catalog-btn">
                Перейти в каталог
              </button>
            </div>
          ) : (
            <>
              <h2>Найдено заказов: {userOrders.length}</h2>
              <div className="orders-list">
                {userOrders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <h3>Заказ #{order.id}</h3>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    
                    <div className="order-info">
                      <p><strong>Дата:</strong> {formatDate(order.createdAt)}</p>
                      <p><strong>Сумма:</strong> {order.total} ₽</p>
                      <p><strong>Товаров:</strong> {order.items.length}</p>
                    </div>
                    
                    <div className="order-items-preview">
                      {order.items.slice(0, 2).map(item => (
                        <div key={item.id} className="preview-item">
                          {item.name.substring(0, 30)}... x{item.quantity}
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="more-items">и еще {order.items.length - 2} товара(ов)</div>
                      )}
                    </div>
                    
                    <button 
                      className="details-btn"
                      onClick={() => navigate(`/order/${order.id}`)}
                    >
                      Подробнее
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default MyOrdersPage;