import React, { createContext, useState, useContext } from 'react';
import {
  getOrders,
  getOrder,
  createOrder as apiCreateOrder,
  updateOrderStatus as apiUpdateStatus,
  getUserOrders  // Новый импорт
} from '../api/api';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Загружаем заказы (для админа)
  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      setOrders(response.data);
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err);
    } finally {
      setLoading(false);
    }
  };

  // Создание нового заказа
  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      console.log('OrderContext: создание заказа', orderData);

      const response = await apiCreateOrder(orderData);
      console.log('OrderContext: ответ', response.data);

      return response.data.id;
    } catch (err) {
      console.error('OrderContext: ошибка создания заказа:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Обновление статуса заказа (админ)
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

  // Получение заказа по ID
  const getOrderById = async (orderId) => {
    try {
      const response = await getOrder(orderId);
      return response.data;
    } catch (err) {
      console.error('Ошибка получения заказа:', err);
      throw err;
    }
  };

  // Поиск заказов пользователя - ИСПРАВЛЕНО! Используем тот же эндпоинт, что и в Swagger
  const getUserOrdersList = async () => {
    try {
      setLoading(true);
      console.log('Получение заказов текущего пользователя');

      const response = await getUserOrders();
      console.log('Найденные заказы:', response.data);

      return response.data;
    } catch (err) {
      console.error('Ошибка получения заказов:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrderContext.Provider value={{
      orders,
      loading,
      loadOrders,
      createOrder,
      updateOrderStatus,
      getOrderById,
      getUserOrdersList  // Заменяем searchUserOrders на getUserOrdersList
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrderContext);
}