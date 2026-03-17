import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Преобразуем данные прямо здесь
api.interceptors.response.use(
  (response) => {
    // Если это список товаров
    if (response.config.url?.includes('/products') && Array.isArray(response.data)) {
      response.data = response.data.map(product => ({
        ...product,
        // Добавляем поле image для фронта
        image: `/flowers/${product.id}.jpg`,
        // Оставляем оригинальное поле на всякий случай
        image_url: product.image_url
      }));
    }

    // Если это один товар
    if (response.config.url?.includes('/products') && response.data && response.data.id) {
      response.data = {
        ...response.data,
        image: `/flowers/${response.data.id}.jpg`,
      };
    }

    return response;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Товары
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (product) => api.post('/products', product);
export const updateProduct = (id, product) => api.put(`/products/${id}`, product);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Категории
export const getCategories = () => api.get('/categories');

// Заказы
export const getOrders = () => api.get('/orders');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (orderData) => api.post('/orders', orderData);
export const updateOrderStatus = (id, status, comment) =>
  api.patch(`/orders/${id}/status`, { status, comment });
export const searchOrders = (email, phone) =>
  api.post('/orders/search', { email, phone });

// Аутентификация
export const login = (username, password) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  return api.post('/auth/login', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const register = (userData) => api.post('/auth/register', userData);
export const getCurrentUser = () => api.get('/auth/me');

export default api;