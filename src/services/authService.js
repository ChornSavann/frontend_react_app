
import api from './api';

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/login-user', { email, password });

    if (response.data && response.data.token) {
      const user = response.data.user || {};
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('user_name', user.name || 'Admin');
      const roleName =
        typeof user.role === 'object' && user.role !== null
          ? user.role.name
          : user.role || user.role_name || (user.role_id ? `Role #${user.role_id}` : 'User');
      localStorage.setItem('user_role', roleName);
      const avatar = user.image_url || user.image || '';
      localStorage.setItem('user_avatar', avatar);
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network or server error' };
  }
};

export const loginWithGoogle = async (accessToken) => {
  try {
    const response = await api.post('/auth/google', {
      access_token: accessToken,
    });

    const data = response.data;
    const token = data?.token || data?.access_token || data?.data?.token;
    const user = data?.user || data?.data?.user || {};

    if (token) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('user_name', user.name || 'Admin');

      const roleName =
        typeof user.role === 'object' && user.role !== null
          ? user.role.name
          : user.role || user.role_name || (user.role_id ? `Role #${user.role_id}` : 'User');
      localStorage.setItem('user_role', roleName);

      const avatar = user.image_url || user.image || '';
      localStorage.setItem('user_avatar', avatar);
    }

    return data;
  } catch (error) {
    throw error.response?.data || { message: 'Network or server error' };
  }
};


export const verifyLoginOtp = async (email, otp) => {
  try {
    const response = await api.post('/verify-otp', { email, otp });
    const data = response.data;

    if (data && data.token) {
      const user = data.user || {};
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('user_name', user.name || 'Admin');

      const roleName =
        typeof user.role === 'object' && user.role !== null
          ? user.role.name
          : user.role || user.role_name || (user.role_id ? `Role #${user.role_id}` : 'User');
      localStorage.setItem('user_role', roleName);

      const avatar = user.image_url || user.image || '';
      localStorage.setItem('user_avatar', avatar);
    }

    return data;
  } catch (error) {
    throw error.response?.data || { message: 'លេខកូដ OTP មិនត្រឹមត្រូវ' };
  }
};

export const resendLoginOtp = async (email) => {
  try {
    const response = await api.post('/resend-otp', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'មិនអាចផ្ញើ OTP ម្ដងទៀតបានទេ' };
  }
};

export const logoutUser = async () => {
  const token = localStorage.getItem("auth_token");

  try {
    const response = await api.post(
      "/logout",
      {},
      token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    );
    return response.data;
  } catch (error) {
    if (error?.response?.status !== 401) {
      console.warn("Logout API warning:", error);
    }
  } finally {
    const currentTheme = localStorage.getItem("theme");
    const currentLang = localStorage.getItem("app_lang");

    localStorage.clear();

    if (currentTheme) localStorage.setItem("theme", currentTheme);
    if (currentLang) localStorage.setItem("app_lang", currentLang);
  }
};

export const sendForgotPasswordOtp = async (email) => {
  try {
    const response = await api.post('/forgot-password/send-otp', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'មិនអាចផ្ញើលេខកូដ OTP បានទេ' };
  }
};

export const verifyForgotPasswordOtp = async (email, otp) => {
  try {
    const response = await api.post('/forgot-password/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'លេខកូដ OTP មិនត្រឹមត្រូវ' };
  }
};

export const resetPasswordWithOtp = async ({ email, password, password_confirmation }) => {
  try {
    const response = await api.post('/forgot-password/reset', {
      email,
      password,
      password_confirmation,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'មិនអាចប្ដូរពាក្យសម្ងាត់បានទេ' };
  }
};

export const refreshAuthToken = async () => {
  const response = await api.post('/refresh-token');
  const newToken = response.data?.token || response.data?.data?.token;

  if (newToken) {
    localStorage.setItem('token', newToken);
  }

  return response.data;
};