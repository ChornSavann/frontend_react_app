// src/services/reportService.js
import api from './api';

export const getReportSummary = async (params = {}) => {
  const res = await api.get('/reportsfinance/summary', { params });
  return res.data;
};

export const getTotalSalesReports = async () => {
  const res = await api.get('/reportsfinance/total-sales');
  return res.data;
};

// 🟢 កែប្រែត្រង់នេះឱ្យប្រើ params object
export const getDailyReport = async (params = {}) => {
  const res = await api.get('/reportsfinance/daily', { params });
  return res.data;
};

export const getWeeklyReport = async (params = {}) => {
  const res = await api.get('/reportsfinance/weekly', { params });
  return res.data;
};

export const getMonthlyReport = async (params = {}) => {
  const res = await api.get('/reportsfinance/monthly', { params });
  return res.data;
};

export const getYearlyReport = async (params = {}) => {
  const res = await api.get('/reportsfinance/yearly', { params });
  return res.data;
};

export const getSalesReports = async (params = {}) => {
  const res = await api.get('/reportsfinance/sales', { params });
  return res.data;
};

export const getHistoryReports = async (params = {}) => {
  const res = await api.get('/reportsfinance/history', { params });
  return res.data;
};

export const getLowStockReports = async (params = {}) => {
  const res = await api.get('/reportsfinance/low-stock', { params });
  return res.data;
};

export const getTopSellingReports = async (params = {}) => {
  const res = await api.get('/reportsfinance/top-selling', { params });
  return res.data;
};

export const getPurchaseReports = async (params = {}) => {
  const res = await api.get('/reportsfinance/purchases', { params });
  return res.data;
};

export const getCustomerReports = async () => {
  const res = await api.get('/reportsfinance/customers');
  return res.data;
};

export const CustomerReports = async () => {
  const res = await api.get('/reportsfinance/customers-report');
  return res.data;
};


export const getFinancialReports = async () => {
  const res = await api.get('/reportsfinance/profit-loss');
  return res.data;
};

export const getFinancialReport = async (params) => {
  // 🟢 ត្រូវមាន { params } នៅទីនេះ ដើម្បីឱ្យវាផ្ញើ ?month=12&year=2026 ទៅ Backend
  const res = await api.get('/reportsfinance/profit-loss', { params });
  return res.data;
};