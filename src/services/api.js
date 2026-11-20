// src/services/api.js
import axios from 'axios';

const BASE_API_URL = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api';
// const BASE_API_URL = import.meta.env?.VITE_API_URL || 'http://188.166.183.215:30030/api';

const TOKEN_KEYS = ['auth_token', 'token', 'access_token'];

const getStoredToken = () => {
  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }
  return null;
};

const saveRefreshedToken = (newToken) => {
  let updatedAny = false;
  for (const key of TOKEN_KEYS) {
    if (localStorage.getItem(key) !== null) {
      localStorage.setItem(key, newToken);
      updatedAny = true;
    }
  }
  if (!updatedAny) {
    localStorage.setItem('auth_token', newToken);
  }
};

export const clearAuthStorage = () => {
  TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem('user');
};

export const redirectToLogin = (reason = 'session_expired') => {
  clearAuthStorage();
  if (window.location.pathname !== '/login') {
    window.location.replace(`/login?reason=${encodeURIComponent(reason)}`);
  }
};

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    const isLoginEndpoint = url.includes('/login-user') || url.includes('/login');
    const isRefreshOrLogoutEndpoint =
      url.includes('/refresh-token') || url.includes('/logout');

    // បើហៅ /refresh-token ហើយនៅតែ 401 (Token Expire ឬ Blacklist រួច) -> ទារ Login ភ្លាម
    if (status === 401 && url.includes('/refresh-token')) {
      processQueue(error, null);
      isRefreshing = false;
      redirectToLogin('expired');
      return Promise.reject(error);
    }

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isLoginEndpoint &&
      !isRefreshOrLogoutEndpoint
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const currentToken = getStoredToken();
        if (!currentToken) {
          throw new Error('No token found');
        }

        const res = await axios.post(
          `${BASE_API_URL}/refresh-token`,
          {},
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentToken}`,
            },
          }
        );

        const newToken = res.data?.token || res.data?.data?.token;
        if (!newToken) {
          throw new Error('Invalid refresh token response');
        }

        saveRefreshedToken(newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        redirectToLogin('expired');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const resolveProductImage = (p) => {
  if (!p) return null;
  return p.image_url || p.category?.image_url || null;
};

export default api;