import axios from 'axios';

// Automatically use the right backend based on environment.
// In development: Vite proxies /api → localhost:4000 (vite.config.ts proxy)
// In production:  directly call the Render backend
// In development Vite proxies `/api` to the local backend. A separately
// deployed frontend can set VITE_API_URL at build time (including `/api`).
// The current endpoint remains a compatibility fallback for existing deploys.
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');
const baseURL = configuredApiUrl || (import.meta.env.DEV
  ? '/api'
  : 'https://siet-esports-hub.onrender.com/api');

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
