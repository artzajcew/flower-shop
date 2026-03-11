import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import './OrderPage.css';

function OrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrder } = useOrders();
  
  const order = getOrder(parseInt(id));

  if (!order) {
    return (
      <div className="order-not-found">
        <h2>Заказ не найден</h2>
        <button onClick={() => navigate('/')}>На главную</button>
      </div>
    );
  }

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
    <div className="order-page">
      <h1>Заказ #{order.id}</h1>
      
      <div className="order-status">
        <div 
          className="status-badge"
          style={{ backgroundColor: getStatusColor(order.status) }}
        >
          {getStatusText(order.status)}
        </div>
        <p className="order-date">от {formatDate(order.createdAt)}</p>
      </div>

      <div className="order-info">
        <div className="info-section">
          <h3>Данные получателя</h3>
          <p><strong>ФИО:</strong> {order.fullName}</p>
          <p><strong>Email:</strong> {order.email}</p>
          <p><strong>Телефон:</strong> {order.phone}</p>
        </div>

        <div className="info-section">
          <h3>Доставка</h3>
          <p><strong>Способ:</strong> {order.deliveryMethod === 'pickup' ? 'Самовывоз' : 'Доставка'}</p>
          {order.deliveryMethod === 'delivery' && (
            <p><strong>Адрес:</strong> {order.address}</p>
          )}
          <p><strong>Оплата:</strong> {order.paymentMethod === 'card' ? 'Картой онлайн' : 'Наличными'}</p>
        </div>
      </div>

      <div className="order-items-section">
        <h3>Состав заказа</h3>
        <table className="order-items-table">
          <thead>
            <tr>
              <th>Товар</th>
              <th>Количество</th>
              <th>Цена</th>
              <th>Сумма</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.price} ₽</td>
                <td>{item.price * item.quantity} ₽</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" className="total-label">Итого:</td>
              <td className="total-value">{order.total} ₽</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="order-history">
        <h3>История заказа</h3>
        <div className="timeline">
          {order.history.map((event, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-dot" style={{ backgroundColor: getStatusColor(event.status) }}></div>
              <div className="timeline-content">
                <div className="timeline-status">{getStatusText(event.status)}</div>
                <div className="timeline-date">{formatDate(event.date)}</div>
                {event.comment && <div className="timeline-comment">{event.comment}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="order-actions">
        <button className="back-btn" onClick={() => navigate('/')}>
          Продолжить покупки
        </button>
      </div>
    </div>
  );
}

export default OrderPage;