import axios from 'axios';

// Automatically use the right backend based on environment.
// In development: Vite proxies /api → localhost:4000 (vite.config.ts proxy)
// In production:  directly call the Render backend
const isProd = import.meta.env.PROD; // true when built with `vite build`
const baseURL = isProd
  ? 'https://siet-esports-hub.onrender.com/api'
  : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const isCoordPath = window.location.pathname.startsWith('/coordinator');
      if (isCoordPath && window.location.pathname !== '/coordinator/login') {
        window.location.href = '/coordinator/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
