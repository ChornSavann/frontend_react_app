
import api from "./api";

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getSalesHistory = async (page = 1, extraParams = {}) => {
  const response = await api.get(`/reportsfinance/history-report`, {
    params: { page, ...extraParams },
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getInvoiceDetails = async (orderId) => {
  const response = await api.get(`/reportsfinance/invoices/${orderId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};