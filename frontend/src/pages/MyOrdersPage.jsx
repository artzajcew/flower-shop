// frontend/src/pages/MyOrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import './MyOrdersPage.css';

function MyOrdersPage() {
  const navigate = useNavigate();
  const { getUserOrdersList, loading } = useOrders();
  const { user } = useAuth();
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadUserOrders();
    } else {
      setLoadingOrders(false);
    }
  }, [user]);

  const loadUserOrders = async () => {
    try {
      setLoadingOrders(true);
      setError('');
      console.log('Загрузка заказов пользователя');

      const orders = await getUserOrdersList();
      console.log('Получены заказы:', orders);

      setUserOrders(orders || []);
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err);
      setError('Ошибка при загрузке заказов');
    } finally {
      setLoadingOrders(false);
    }
  };

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
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (!user) {
    return (
      <div className="my-orders-page">
        <h1>Мои заказы</h1>
        <div className="not-authorized">
          <p>Для просмотра заказов необходимо войти в систему</p>
          <button onClick={() => navigate('/login')} className="login-btn">
            Войти
          </button>
        </div>
      </div>
    );
  }

  if (loadingOrders) {
    return (
      <div className="my-orders-page">
        <h1>Мои заказы</h1>
        <div className="loading">Загрузка заказов...</div>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <h1>Мои заказы</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="orders-section">
        {userOrders.length === 0 ? (
          <div className="no-orders">
            <p>У вас пока нет заказов</p>
            <button onClick={() => navigate('/')} className="catalog-btn">
              Перейти в каталог
            </button>
          </div>
        ) : (
          <>
            <h2>Всего заказов: {userOrders.length}</h2>
            <div className="orders-list">
              {userOrders.map(order => {
                // Получаем сумму заказа
                const totalPrice = order.total_price || order.total || 0;
                // Получаем количество товаров
                const itemsCount = order.items?.length || 0;

                return (
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
                      <p><strong>Дата:</strong> {formatDate(order.order_date)}</p>
                      <p><strong>Сумма:</strong> {totalPrice.toLocaleString()} ₽</p>
                      <p><strong>Товаров:</strong> {itemsCount}</p>
                    </div>

                    <div className="order-items-preview">
                      <strong>Товары:</strong>
                      {order.items?.slice(0, 2).map((item, idx) => {
                        const itemName = item.product_name || item.name;
                        const quantity = item.count || item.quantity;
                        return (
                          <div key={idx} className="preview-item">
                            {itemName} x{quantity}
                          </div>
                        );
                      })}
                      {order.items?.length > 2 && (
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
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyOrdersPage;