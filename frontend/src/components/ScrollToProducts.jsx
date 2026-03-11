import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToProducts() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Прокручиваем страницу вниз на страницах корзины и входа
    if (pathname === '/cart' || pathname === '/login' || pathname === '/register') {
      window.scrollTo({
        top: document.documentElement.scrollHeight, // прокрутка в самый низ
        behavior: 'smooth'
      });
    }
  }, [pathname]);

  return null;
}

export default ScrollToProducts;