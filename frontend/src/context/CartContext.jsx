import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Нужно импортировать

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth(); // Получаем текущего пользователя
  const [cart, setCart] = useState([]);

  // Функция для получения ключа localStorage в зависимости от пользователя
  const getCartKey = () => {
    if (user) {
      return `cart_user_${user.id}`; // Для авторизованного
    }
    return 'cart_guest'; // Для гостя
  };

  // Загружаем корзину при смене пользователя
  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem(getCartKey());
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error('Ошибка загрузки корзины:', e);
          setCart([]);
        }
      } else {
        setCart([]); // Новая корзина для нового пользователя
      }
    };

    loadCart();
  }, [user]); // Срабатывает при каждом изменении user

  // Сохраняем корзину при любых изменениях
  useEffect(() => {
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
  }, [cart, user]);

  const clearCart = () => {
    setCart([]);
  };

  const addToCart = (product) => {
    setCart(prevCart => {
      // Проверяем, есть ли уже такой товар в корзине
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Если есть - увеличиваем количество
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      } else {
        // Если нет - добавляем с quantity = 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Общая сумма всех товаров в корзине
  const totalPrice = cart.reduce((sum, item) => {
    return sum + (item.price * (item.quantity || 1));
  }, 0);

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Для отладки - показываем в консоли при смене пользователя
  useEffect(() => {
    console.log('Текущий пользователь:', user?.email || 'гость');
    console.log('Корзина загружена, товаров:', cart.length);
  }, [user, cart]);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity,
      totalPrice,
      totalItems,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}