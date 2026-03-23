import React, { useEffect, useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';
import './AdminOrdersPage.css';

function AdminOrdersPage() {
  const { orders, loading, loadOrders, updateOrderStatus } = useOrders();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('date'); // 'date', 'status', 'total'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'processing', etc.

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

  // Сортировка и фильтрация заказов
  const getSortedAndFilteredOrders = () => {
    let filtered = [...orders];

    // Фильтрация по статусу
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'date':
          aVal = new Date(a.createdAt || a.order_date);
          bVal = new Date(b.createdAt || b.order_date);
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'total':
          aVal = a.total || a.total_price;
          bVal = b.total || b.total_price;
          break;
        default:
          aVal = new Date(a.createdAt || a.order_date);
          bVal = new Date(b.createdAt || b.order_date);
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const filteredAndSortedOrders = getSortedAndFilteredOrders();

  if (loading && orders.length === 0) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="admin-orders">
      <h1>Управление заказами</h1>
      
      {/* Панель сортировки и фильтрации */}
      <div className="orders-controls">
        <div className="filter-section">
          <label>Фильтр по статусу: </label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Все заказы</option>
            <option value="Новый">Новый</option>
            <option value="В сборке">В сборке</option>
            <option value="Доставляется">Доставляется</option>
            <option value="Выполнен">Выполнен</option>
            <option value="Отменен">Отменен</option>
            <option value="processing">Обрабатывается</option>
            <option value="confirmed">Подтвержден</option>
            <option value="shipped">Отправлен</option>
            <option value="delivered">Доставлен</option>
            <option value="cancelled">Отменен</option>
          </select>
        </div>

        <div className="sort-section">
          <span>Сортировка: </span>
          <button 
            className={`sort-btn ${sortBy === 'date' ? 'active' : ''}`}
            onClick={() => handleSort('date')}
          >
            По дате {getSortIcon('date')}
          </button>
          <button 
            className={`sort-btn ${sortBy === 'status' ? 'active' : ''}`}
            onClick={() => handleSort('status')}
          >
            По статусу {getSortIcon('status')}
          </button>
          <button 
            className={`sort-btn ${sortBy === 'total' ? 'active' : ''}`}
            onClick={() => handleSort('total')}
          >
            По сумме {getSortIcon('total')}
          </button>
        </div>

        <div className="orders-count">
          Найдено заказов: {filteredAndSortedOrders.length} из {orders.length}
        </div>
      </div>

      <div className="orders-list">
        {filteredAndSortedOrders.length === 0 ? (
          <p className="no-orders">
            {orders.length === 0 ? 'Заказов пока нет' : 'Нет заказов с выбранным статусом'}
          </p>
        ) : (
          filteredAndSortedOrders.map(order => (
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
                  <p><strong>Клиент:</strong> {order.fullName || order.full_name || 'Не указано'}</p>
                  <p><strong>Телефон:</strong> {order.phone || 'Не указан'}</p>
                  <p><strong>Email:</strong> {order.email || 'Не указан'}</p>
                  <p><strong>Сумма:</strong> {order.total || order.total_price} ₽</p>
                  <p><strong>Дата:</strong> {new Date(order.createdAt || order.order_date).toLocaleString('ru-RU')}</p>
                </div>
                
                <div className="order-items-preview">
                  <strong>Товары:</strong>
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="preview-item">
                      {item.name || item.product_name} x{item.quantity || item.count} = 
                      {(item.price * (item.quantity || item.count))} ₽
                    </div>
                  ))}
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
                  <option value="processing">Обрабатывается</option>
                  <option value="confirmed">Подтвержден</option>
                  <option value="shipped">Отправлен</option>
                  <option value="delivered">Доставлен</option>
                  <option value="cancelled">Отменен</option>
                </select>
                
                <button onClick={() => navigate(`/order/${order.id}`)} className="details-btn">
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