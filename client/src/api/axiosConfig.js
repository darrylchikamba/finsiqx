import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('userInfo');
  if (userStr) {
    try {
      const userInfo = JSON.parse(userStr);
      if (userInfo && userInfo.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
      }
    } catch (e) {
      console.error('Error parsing userInfo from localStorage', e);
    }
  }
  return config;
});

export default api;
