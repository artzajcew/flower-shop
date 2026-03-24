// frontend/src/pages/AdminOrdersPage.jsx
import React, { useEffect } from 'react';
import { useOrders } from '../context/OrderContext';
import './AdminOrdersPage.css';

function AdminOrdersPage() {
  const { orders, loading, loadOrders, updateOrderStatus } = useOrders();

  useEffect(() => {
    loadOrders();
  }, []);

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

  const handleStatusChange = async (orderId, newStatus) => {
    const comment = prompt('Комментарий к изменению статуса (необязательно):');
    try {
      await updateOrderStatus(orderId, newStatus, comment || '');
    } catch (err) {
      alert('Ошибка при обновлении статуса');
    }
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

  const formatDeliveryDate = (dateString) => {
    if (!dateString) return 'Не указана';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading && orders.length === 0) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="admin-orders">
      <h1>Управление заказами</h1>

      <div className="orders-count-header">
        Всего заказов: {orders.length}
      </div>

      <div className="orders-list">
        {orders.length === 0 ? (
          <p className="no-orders">Заказов пока нет</p>
        ) : (
          orders.map(order => {
            const totalPrice = order.total_price || order.total || 0;
            const deliveryMethod = order.delivery_method === 'delivery' ? 'Доставка' : 'Самовывоз';
            const deliveryAddress = order.delivery_address || 'Самовывоз (г. Москва, ул. Цветочная, 1)';
            const deliveryDate = order.delivery_date || order.order_date;

            const recipientName = order.full_name || order.recipient_name || order.fullName || 'Не указано';
            const recipientPhone = order.phone || order.recipient_phone || 'Не указан';

            return (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-header-left">
                    <h3>Заказ #{order.id}</h3>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                <div className="order-body">
                  <div className="order-info-grid">
                    <div className="info-item">
                      <label>Получатель:</label>
                      <span>{recipientName}</span>
                    </div>
                    <div className="info-item">
                      <label>Телефон:</label>
                      <span>{recipientPhone}</span>
                    </div>
                    <div className="info-item">
                      <label>Доставка:</label>
                      <span>{deliveryMethod}</span>
                    </div>
                    {deliveryMethod === 'Доставка' && (
                      <div className="info-item full-width">
                        <label>Адрес:</label>
                        <span>{deliveryAddress}</span>
                      </div>
                    )}
                    <div className="info-item">
                      <label>Дата доставки:</label>
                      <span>{formatDeliveryDate(deliveryDate)}</span>
                    </div>
                    <div className="info-item">
                      <label>Дата заказа:</label>
                      <span>{formatDate(order.order_date || order.createdAt)}</span>
                    </div>

                    {/* ДОБАВЛЯЕМ ТОВАРЫ ДЛЯ АДМИНА */}
                    <div className="info-item full-width">
                      <label>Товары:</label>
                      <div style={{ marginTop: '5px' }}>
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, idx) => {
                            const itemName = item.product_name || item.name || 'Товар';
                            const quantity = item.count || item.quantity || 1;
                            return (
                              <div key={idx} style={{ marginBottom: '5px' }}>
                                {itemName} — {quantity} шт.
                              </div>
                            );
                          })
                        ) : (
                          <span>Нет товаров</span>
                        )}
                      </div>
                    </div>

                    <div className="info-item total-item">
                      <label>Сумма заказа:</label>
                      <span className="total-price">{totalPrice.toLocaleString()} ₽</span>
                    </div>
                  </div>
                </div>

                <div className="order-actions">
                  <select
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    value={order.status}
                    className="status-select"
                  >
                    <option value="Новый">Новый</option>
                    <option value="В сборке">В сборке</option>
                    <option value="Доставляется">Доставляется</option>
                    <option value="Выполнен">Выполнен</option>
                    <option value="Отменен">Отменен</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AdminOrdersPage;