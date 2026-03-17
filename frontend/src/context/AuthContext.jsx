import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getCurrentUser } from '../api/api';
// Импортируем useCart, но будем использовать функцию, чтобы избежать циклической зависимости
import { useCart } from './CartContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Не можем использовать useCart здесь напрямую из-за циклической зависимости
  // Вместо этого получим clearCart через children или создадим отдельный механизм

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.data);
    } catch (err) {
      console.error('Ошибка загрузки пользователя:', err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError('');
      const response = await apiLogin(username, password);
      const { access_token, is_admin, username: userName, user_id } = response.data;
      
      localStorage.setItem('token', access_token);
      
      const userData = {
        id: user_id,
        username: userName,
        isAdmin: is_admin
      };
      
      setUser(userData);
      
      // Событие для очистки/перезагрузки корзины
      window.dispatchEvent(new CustomEvent('userLogin', { detail: userData }));
      
      return { success: true, isAdmin: is_admin };
    } catch (err) {
      console.error('Login error:', err.response?.data || err);
      setError(err.response?.data?.detail || 'Ошибка входа');
      return { success: false };
    }
  };

  const register = async (userData) => {
    try {
      setError('');
      await apiRegister(userData);
      return { success: true };
    } catch (err) {
      console.error('Register error:', err.response?.data || err);
      setError(err.response?.data?.detail || 'Ошибка регистрации');
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    
    // Событие для очистки корзины
    window.dispatchEvent(new Event('userLogout'));
  };

  // Для разработки - мок-режим
  const devLogin = () => {
    if (process.env.NODE_ENV === 'development') {
      const mockUser = {
        id: 1,
        username: 'admin',
        isAdmin: true
      };
      setUser(mockUser);
      localStorage.setItem('token', 'mock-token');
      window.dispatchEvent(new CustomEvent('userLogin', { detail: mockUser }));
      return { success: true, isAdmin: true };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      register,
      logout,
      devLogin, // для разработки
      isAdmin: user?.isAdmin || false
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}