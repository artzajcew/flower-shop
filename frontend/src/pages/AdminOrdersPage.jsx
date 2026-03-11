import React from 'react';
import { useOrders } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';
import './AdminOrdersPage.css';

function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useOrders();
  const navigate = useNavigate();

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

  const handleStatusChange = (orderId, newStatus) => {
    const comment = prompt('Комментарий к изменению статуса (необязательно):');
    updateOrderStatus(orderId, newStatus, comment || '');
  };

  return (
    <div className="admin-orders">
      <h1>Управление заказами</h1>
      
      <div className="orders-list">
        {orders.length === 0 ? (
          <p className="no-orders">Заказов пока нет</p>
        ) : (
          orders.map(order => (
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
              
              <div className="order-body">
                <div className="order-info">
                  <p><strong>Клиент:</strong> {order.fullName}</p>
                  <p><strong>Телефон:</strong> {order.phone}</p>
                  <p><strong>Email:</strong> {order.email}</p>
                  <p><strong>Сумма:</strong> {order.total} ₽</p>
                  <p><strong>Дата:</strong> {new Date(order.createdAt).toLocaleString('ru-RU')}</p>
                </div>
                
                <div className="order-items-preview">
                  <strong>Товары:</strong>
                  {order.items.map(item => (
                    <div key={item.id} className="preview-item">
                      {item.name} x{item.quantity} = {item.price * item.quantity} ₽
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="order-actions">
                <select 
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  value={order.status}
                >
                  <option value="processing">Обрабатывается</option>
                  <option value="confirmed">Подтвержден</option>
                  <option value="shipped">Отправлен</option>
                  <option value="delivered">Доставлен</option>
                  <option value="cancelled">Отменен</option>
                </select>
                
                <button onClick={() => navigate(`/order/${order.id}`)}>
                  Подробнее
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminOrdersPage;