// src/services/authService.js
import api from './api';

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/login-user', { email, password });
    
    if (response.data && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_role', response.data.user.role);
      localStorage.setItem('user_name', response.data.user.name);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network or server error' };
  }
};

export const logoutUser = () => {
  localStorage.clear();
};