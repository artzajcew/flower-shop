import React, { createContext, useState, useContext, useEffect } from 'react';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);

  // Загружаем заказы из localStorage при запуске
  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // Сохраняем заказы в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  // Создание нового заказа
  const createOrder = (orderData) => {
    const newOrder = {
      id: Date.now(), // уникальный ID на основе времени
      ...orderData,
      status: 'processing', // processing, confirmed, shipped, delivered, cancelled
      createdAt: new Date().toISOString(),
      history: [
        {
          status: 'processing',
          date: new Date().toISOString(),
          comment: 'Заказ создан'
        }
      ]
    };
    
    setOrders(prev => [newOrder, ...prev]);
    return newOrder.id;
  };

  // Обновление статуса заказа
  const updateOrderStatus = (orderId, newStatus, comment = '') => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedOrder = {
          ...order,
          status: newStatus,
          history: [
            ...order.history,
            {
              status: newStatus,
              date: new Date().toISOString(),
              comment
            }
          ]
        };
        return updatedOrder;
      }
      return order;
    }));
  };

  // Получение заказа по ID
  const getOrder = (orderId) => {
    return orders.find(order => order.id === orderId);
  };

  // Получение всех заказов пользователя (по email/телефону)
  const getUserOrders = (email, phone) => {
    return orders.filter(order => 
      order.email === email || order.phone === phone
    );
  };

  return (
    <OrderContext.Provider value={{
      orders,
      createOrder,
      updateOrderStatus,
      getOrder,
      getUserOrders
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrderContext);
}