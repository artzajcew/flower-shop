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
    console.log('Исходный заказ для нормализации:', order);

    // Нормализуем товары в заказе
    const normalizedItems = (order.items || []).map(item => {
      // Логируем исходный товар
      console.log('Исходный товар:', item);

      // Пытаемся найти цену в любом поле
      let price = 0;
      if (item.price !== undefined && item.price !== null) {
        price = Number(item.price);
      } else if (item.unit_price !== undefined && item.unit_price !== null) {
        price = Number(item.unit_price);
      } else if (item.product_price !== undefined && item.product_price !== null) {
        price = Number(item.product_price);
      } else if (item.cost !== undefined && item.cost !== null) {
        price = Number(item.cost);
      } else if (item.total_price && item.count) {
        // Если есть общая сумма и количество, вычисляем цену
        price = Number(item.total_price) / Number(item.count);
      }

      // Пытаемся найти название
      const name = item.product_name || item.name || item.good_name || item.title;

      // Пытаемся найти количество
      const quantity = item.count || item.quantity || 1;

      const normalizedItem = {
        id: item.id || item.good_id || item.product_id,
        name: name,
        product_name: name,
        count: quantity,
        quantity: quantity,
        price: price,
        unit_price: price,
        // Сохраняем оригинальные данные на всякий случай
        original: item
      };

      console.log('Нормализованный товар:', normalizedItem);
      return normalizedItem;
    });

    return {
      id: order.id,
      status: order.status,
      order_date: order.order_date || order.created_at || order.createdAt,
      total_price: order.total_price || order.total,
      full_name: order.full_name || order.recipient_name,
      phone: order.phone || order.recipient_phone,
      delivery_method: order.delivery_method,
      delivery_address: order.delivery_address,
      items: normalizedItems,
      history: order.history || []
    };
  };

  const getUserOrdersList = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
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
      console.log('API ответ getOrder:', response.data);
      const normalizedOrder = normalizeOrder(response.data);
      console.log('Нормализованный заказ:', normalizedOrder);
      return normalizedOrder;
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