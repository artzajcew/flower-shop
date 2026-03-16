import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена авторизации
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
// Замените функцию createOrder
export const createOrder = (orderData) => api.post('/orders', orderData);

// Замените функцию searchOrders (если она не работает)
export const searchOrders = (email, phone) => {
  // Используем GET с параметрами, а не POST
  const params = {};
  if (email) params.email = email;
  if (phone) params.phone = phone;
  return api.get('/orders/search', { params });
};

export const updateOrderStatus = (id, status, comment) => 
  api.patch(`/orders/${id}/status`, { status, comment });

// Аутентификация
export const login = (username, password) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  
  return api.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const register = (userData) => api.post('/auth/register', userData);
export const getCurrentUser = () => api.get('/auth/me');

export default api;