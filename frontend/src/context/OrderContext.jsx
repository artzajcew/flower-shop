// frontend/src/context/OrderContext.jsx
import React, { createContext, useState, useContext } from 'react';
import {
  getOrders,
  getOrder,
  createOrder as apiCreateOrder,
  updateOrderStatus as apiUpdateStatus,
  searchOrders as apiSearchOrders
} from '../api/api';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      // Нормализуем данные заказов
      const normalizedOrders = response.data.map(order => normalizeOrder(order));
      setOrders(normalizedOrders);
      return normalizedOrders;
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Функция нормализации данных заказа
  const normalizeOrder = (order) => {
    return {
      id: order.id,
      status: order.status,
      order_date: order.order_date || order.created_at || order.createdAt,
      total_price: order.total_price || order.total,
      full_name: order.full_name || order.recipient_name,
      email: order.email,
      phone: order.phone || order.recipient_phone,
      delivery_method: order.delivery_method,
      delivery_address: order.delivery_address,
      items: (order.items || []).map(item => ({
        ...item,
        product_name: item.product_name || item.name,
        count: item.count || item.quantity
      })),
      history: order.history || []
    };
  };

  const getUserOrdersList = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      // API фильтрует заказы по текущему пользователю на основе JWT
      const normalizedOrders = response.data.map(order => normalizeOrder(order));
      return normalizedOrders;
    } catch (err) {
      console.error('Ошибка загрузки заказов пользователя:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      const response = await apiCreateOrder(orderData);
      return response.data.id;
    } catch (err) {
      console.error('Ошибка создания заказа:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, comment = '') => {
    try {
      setLoading(true);
      await apiUpdateStatus(orderId, newStatus, comment);
      await loadOrders();
    } catch (err) {
      console.error('Ошибка обновления статуса:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = async (orderId) => {
    try {
      const response = await getOrder(orderId);
      return normalizeOrder(response.data);
    } catch (err) {
      console.error('Ошибка получения заказа:', err);
      throw err;
    }
  };

  const searchUserOrders = async (email, phone) => {
    try {
      const response = await apiSearchOrders(email, phone);
      return response.data.map(order => normalizeOrder(order));
    } catch (err) {
      console.error('Ошибка поиска заказов:', err);
      throw err;
    }
  };

  return (
    <OrderContext.Provider value={{
      orders,
      loading,
      loadOrders,
      getUserOrdersList,
      createOrder,
      updateOrderStatus,
      getOrderById,
      searchUserOrders
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrderContext);
}