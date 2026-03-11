import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage() {
  // Храним значения полей ввода
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Функция при отправке формы
  const handleSubmit = (e) => {
    e.preventDefault(); // Чтобы страница не перезагружалась
    
    // Простая проверка (потом заменим на запрос к бэкенду)
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }
    
    if (password.length < 3) {
      setError('Пароль должен быть минимум 3 символа');
      return;
    }
    
    // Если всё ок
    setError('');
    alert(`Вход выполнен! Email: ${email}`);
    
    // Здесь потом будем отправлять данные на бэкенд
  };

  return (
    <div className='login-page'>
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Вход в магазин</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="введите email"
          />
        </div>
        
        <div className="form-group">
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="введите пароль"
          />
        </div>
        
        <button type="submit" className="login-btn">
          Войти
        </button>
        
        <p className="register-link">
          Нет аккаунта? <a href="/register">Зарегистрироваться</a>
        </p>
      </form>
    </div>
    </div>
  );
}

export default LoginPage;