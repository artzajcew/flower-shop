import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Заказы - ИСПРАВЛЕНО!
export const getOrders = () => api.get('/orders/');  // Добавил слеш
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (orderData) => api.post('/orders/', orderData);  // Добавил слеш
export const updateOrderStatus = (id, status, comment) =>
  api.patch(`/orders/${id}/status`, { status, comment });

// Для страницы "Мои заказы" используем ТОТ ЖЕ ЭНДПОИНТ, ЧТО И В SWAGGER
export const getUserOrders = () => api.get('/orders/');  // Просто получаем все заказы текущего пользователя

// Аутентификация
export const login = (username, password) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  return api.post('/auth/login', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const register = (userData) => {
  return api.post('/auth/register', {
    name: userData.name,
    email: userData.email || null,
    phone: userData.phone || null,
    password: userData.password
  });
};

export const getCurrentUser = () => api.get('/auth/me');

export default api;