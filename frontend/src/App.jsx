import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import CatalogPage from './pages/CatalogPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import CheckoutPage from './pages/CheckoutPage';
import ProductModal from './components/ProductModal/ProductModal';
import OrderPage from './pages/OrderPage';
import MyOrdersPage from './pages/MyOrdersPage';
import './App.css';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, logout } = useAuth();
  const [modalProduct, setModalProduct] = useState(null);

  useEffect(() => {
    const handleOpenModal = (event) => {
      setModalProduct(event.detail);
    };

    window.addEventListener('openProductModal', handleOpenModal);

    return () => {
      window.removeEventListener('openProductModal', handleOpenModal);
    };
  }, []);

  React.useEffect(() => {
    if (location.state?.modal && location.state?.product) {
      setModalProduct(location.state.product);
    }
  }, [location]);

  const handleCloseModal = () => {
    setModalProduct(null);
    if (location.state?.modal) {
      navigate(location.pathname, { replace: true });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Функция для определения активной ссылки
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Если идет загрузка auth данных, показываем заглушку или не рендерим навигацию
  if (authLoading) {
    return (
      <div className="app">
        <header className='header'>
          <nav className='nav'>
            <Link to='/' className='nav-logo'>
              More Than Flowers
            </Link>
            <div className="nav-right">
              <div className="loading-nav">Загрузка...</div>
            </div>
          </nav>
        </header>
        <main className='content'>
          <div className="loading">Загрузка...</div>
        </main>
      </div>
    );
  }

  // Определяем, какие ссылки показывать в зависимости от роли пользователя
  const renderNavLinks = () => {
    // Для админа
    if (user && isAdmin) {
      return (
        <>
          <Link
            to='/'
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Каталог
          </Link>
          <Link
            to='/admin'
            className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
          >
            Панель управления
          </Link>
        </>
      );
    }

    // Для авторизованного обычного пользователя
    if (user && !isAdmin) {
      return (
        <>
          <Link
            to='/'
            className={`nav-link ${isActive('/') && !location.pathname.startsWith('/admin') ? 'active' : ''}`}
          >
            Каталог
          </Link>
          <Link
            to='/cart'
            className={`nav-link ${isActive('/cart') ? 'active' : ''}`}
          >
            Корзина
          </Link>
          <Link
            to='/my-orders'
            className={`nav-link ${isActive('/my-orders') ? 'active' : ''}`}
          >
            Заказы
          </Link>
        </>
      );
    }

    // Для неавторизованного пользователя (гостя)
    return (
      <>
        <Link
          to='/'
          className={`nav-link ${isActive('/') ? 'active' : ''}`}
        >
          Каталог
        </Link>
        <Link
          to='/cart'
          className={`nav-link ${isActive('/cart') ? 'active' : ''}`}
        >
          Корзина
        </Link>
      </>
    );
  };

  return (
    <div className="app">
      <header className='header'>
        <nav className='nav'>
          {/* Логотип слева - с отдельным классом */}
          <Link to='/' className='nav-logo'>
            More Than Flowers
          </Link>

          {/* Группа правых кнопок */}
          <div className="nav-right">
            {renderNavLinks()}

            {/* Кнопка входа/выхода */}
            {user ? (
              <button
                onClick={handleLogout}
                className='nav-link logout-btn'
              >
                Выйти
              </button>
            ) : (
              <Link
                to='/login'
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
              >
                Вход
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main className='content'>
        <Routes>
          <Route path='/' element={<CatalogPage />} />
          <Route path='/cart' element={<CartPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/admin' element={<AdminPage />} />
          <Route path='/checkout' element={<CheckoutPage />} />
          <Route path="/order/:id" element={<OrderPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-column">
            <h4>More Than Flowers</h4>
            <p>Студия цветов с 2015 года</p>
            <p>Создаем букеты для ваших особенных моментов</p>
            <p>Ежедневно с 9:00 до 21:00</p>
          </div>

          <div className="footer-column">
            <h4>Каталог</h4>
            <ul>
              <li><a href="/">Авторские букеты</a></li>
              <li><a href="/">Сборные букеты</a></li>
              <li><a href="/">Люкс</a></li>
              <li><a href="/">Свадебные букеты</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Информация</h4>
            <ul>
              <li><a href="/">О нас</a></li>
              <li><a href="/">Доставка и оплата</a></li>
              <li><a href="/">Возврат</a></li>
              <li><a href="/">Блог</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Контакты</h4>
            <ul>
              <li>+7 (999) 123-45-67</li>
              <li>morethanflowers@gmail.ru</li>
              <li>г. Москва, ул. Цветочная, 1</li>
              <li>
                <a href="/">Instagram</a> | <a href="/">Telegram</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 More Than Flowers. Все права защищены.</p>
        </div>
      </footer>

      {modalProduct && (
        <ProductModal 
          product={modalProduct}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <OrderProvider>
            <AppContent />
          </OrderProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;