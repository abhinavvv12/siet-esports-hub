import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
