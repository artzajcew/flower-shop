import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'; // Добавлен useNavigate
import { CartProvider } from './context/CartContext';
import CatalogPage from './pages/CatalogPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import CheckoutPage from './pages/CheckoutPage';
import ProductPage from './pages/ProductPage';
import ProductModal from './components/ProductModal/ProductModal';
import './App.css';
import { OrderProvider } from './context/OrderContext';
import OrderPage from './pages/OrderPage';
import MyOrdersPage from './pages/MyOrdersPage';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [modalProduct, setModalProduct] = useState(null);
  
  // Проверяем, нужно ли показать модалку
  React.useEffect(() => {
    if (location.state?.modal && location.state?.product) {
      setModalProduct(location.state.product);
    } else {
      setModalProduct(null);
    }
  }, [location]);

  const handleCloseModal = () => {
    setModalProduct(null);
    // Убираем state из URL
    navigate(location.pathname, { replace: true });
  };
  return (
    <div className="app">
      <header className='header'>
        <nav className='nav'>
              <Link to='/' className='nav-link nav-link-9'>More Than Flowers</Link>
              <Link to='/' className='nav-link nav-link-1'>Каталог</Link>
              <Link to='/cart' className='nav-link nav-link-1'>
                Корзина
              </Link>
              <Link to='/login' className='nav-link nav-link-1'>Вход</Link>
              <Link to='/my-orders' className='nav-link nav-link-1'>Заказы</Link>
              <Link to='/admin' className='nav-link nav-link-1'>Админ</Link>
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
          <Route path='/product/:id' element={<ProductPage />} />
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

      {/* Модальное окно */}
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
      <CartProvider>
        <OrderProvider>
          <AppContent />
        </OrderProvider>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;