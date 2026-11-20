// src/services/authLogService.js
import api from "./api";

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAuthLogs = async (params = {}) => {
  const response = await api.get("/auth-logs", {
    params,
    headers: getAuthHeaders(),
  });
  return response.data;
};