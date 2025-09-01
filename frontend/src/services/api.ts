import axios from 'axios';

// Configuración base de axios
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Ajusta la URL según tu configuración Laravel
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;