// frontend/src/pages/OrderPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import './OrderPage.css';

function OrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrderById, loading } = useOrders();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getOrderById(parseInt(id));
        console.log('Данные заказа:', data); // Для отладки
        setOrder(data);
      } catch (err) {
        console.error('Ошибка загрузки заказа:', err);
        setError('Заказ не найден');
      }
    };

    loadOrder();
  }, [id, getOrderById]);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return (
    <div className="order-not-found">
      <h2>{error}</h2>
      <button onClick={() => navigate('/')}>На главную</button>
    </div>
  );
  if (!order) return null;

  const getStatusText = (status) => {
    const statusMap = {
      'Новый': 'Новый',
      'В сборке': 'В сборке',
      'Доставляется': 'Доставляется',
      'Выполнен': 'Выполнен',
      'Отменен': 'Отменен',
      'processing': 'В обработке',
      'confirmed': 'Подтвержден',
      'shipped': 'Отправлен',
      'delivered': 'Доставлен',
      'cancelled': 'Отменен'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'Новый': '#ffc107',
      'В сборке': '#17a2b8',
      'Доставляется': '#007bff',
      'Выполнен': '#28a745',
      'Отменен': '#dc3545',
      'processing': '#ffc107',
      'confirmed': '#17a2b8',
      'shipped': '#007bff',
      'delivered': '#28a745',
      'cancelled': '#dc3545'
    };
    return colorMap[status] || '#6c757d';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Дата не указана';
    try {
      return new Date(dateString).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Универсальная функция для получения значения из объекта с разными названиями полей
  const getField = (obj, possibleNames, defaultValue = 'Не указано') => {
    if (!obj) return defaultValue;
    for (const name of possibleNames) {
      if (obj[name] && obj[name] !== '') {
        return obj[name];
      }
    }
    return defaultValue;
  };

  // Получаем данные получателя
  const fullName = getField(order, ['fullName', 'full_name', 'recipient_name', 'name'], 'Не указано');
  const email = getField(order, ['email', 'user_email'], 'Не указан');
  const phone = getField(order, ['phone', 'recipient_phone', 'user_phone'], 'Не указан');

  // Получаем данные доставки
  const deliveryMethod = getField(order, ['deliveryMethod', 'delivery_method'], 'pickup');
  const address = getField(order, ['address', 'delivery_address', 'shipping_address'], 'Не указан');

  // Получаем итоговую сумму
  const totalPrice = order.total_price || order.total || 0;

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
        <p className="order-date">от {formatDate(order.order_date || order.createdAt || order.created_at)}</p>
      </div>

      <div className="order-info">
        <div className="info-section">
          <h3>Данные получателя</h3>
          <p><strong>ФИО:</strong> {fullName}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Телефон:</strong> {phone}</p>
        </div>

        <div className="info-section">
          <h3>Доставка</h3>
          <p><strong>Способ:</strong> {deliveryMethod === 'delivery' ? 'Доставка' : 'Самовывоз'}</p>
          {deliveryMethod === 'delivery' && (
            <p><strong>Адрес:</strong> {address}</p>
          )}
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
            {order.items && order.items.map((item, index) => {
              // Универсальное получение названия товара
              const itemName = getField(item, ['product_name', 'name', 'good_name', 'title'], `Товар #${item.good_id || item.product_id || index + 1}`);
              // Универсальное получение количества
              const quantity = item.count || item.quantity || 1;
              // Универсальное получение цены
              const price = item.price || 0;
              // Сумма
              const subtotal = price * quantity;

              return (
                <tr key={item.id || index}>
                  <td>{itemName}</td>
                  <td>{quantity}</td>
                  <td>{price.toLocaleString()} ₽</td>
                  <td>{subtotal.toLocaleString()} ₽</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" className="total-label">Итого:</td>
              <td className="total-value">{totalPrice.toLocaleString()} ₽</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {order.history && order.history.length > 0 && (
        <div className="order-history">
          <h3>История заказа</h3>
          <div className="timeline">
            {order.history.map((event, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-dot" style={{ backgroundColor: getStatusColor(event.status) }}></div>
                <div className="timeline-content">
                  <div className="timeline-status">{getStatusText(event.status)}</div>
                  <div className="timeline-date">{formatDate(event.date || event.created_at)}</div>
                  {event.comment && <div className="timeline-comment">{event.comment}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="order-actions">
        <button onClick={() => navigate('/')} className="catalog-btn">
          В каталог
        </button>
        <button onClick={() => navigate('/my-orders')} className="back-btn">
          Мои заказы
        </button>
      </div>
    </div>
  );
}

export default OrderPage;