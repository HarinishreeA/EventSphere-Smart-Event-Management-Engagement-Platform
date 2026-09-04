import axios from 'axios';

const API = axios.create({
  baseURL: 'https://campus-event-management-3vvh.onrender.com/api',
});

// Interceptor to attach Authorization Bearer token to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('campus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
