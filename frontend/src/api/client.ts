import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
};

export const productApi = {
  getById: (id: number) =>
    apiClient.get(`/product/${id}`),
};

export const inventoryApi = {
  getByProduct: (productId: number) =>
    apiClient.get(`/inventory/product/${productId}`),
  updateStock: (inventoryId: number, quantity: number) =>
    apiClient.patch(`/inventory/${inventoryId}/stock`, {
      quantity,
      reason: 'manual_update',
    }),
};