import React, { useState } from 'react';
import AdminProducts from './AdminProducts';
import AdminOrdersPage from './AdminOrdersPage';
import './AdminPage.css';

function AdminPage() {
  const [activeTab, setActiveTab] = useState('products'); // 'products' или 'orders'

  // Простая защита паролем (для демо)
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Неверный пароль');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <h2>Вход для администратора</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
          />
          <button type="submit">Войти</button>
        </form>
        <p className="hint">(Подсказка: admin123)</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>Админ-панель</h1>
      
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Товары
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Заказы
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'products' ? (
          <AdminProducts />
        ) : (
          <AdminOrdersPage />
        )}
      </div>
    </div>
  );
}

export default AdminPage;