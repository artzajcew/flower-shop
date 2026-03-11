import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

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
    setCart(cart.filter(item => item.id !== productId));
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