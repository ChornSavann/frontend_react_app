// src/services/stockAdjustmentService.js
import api from "./api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 1. ទាញយកបញ្ជីស្តុកផលិតផល (សល់, លក់អស់, ចាស់/ថ្មី)
export const getInventoryStatus = async (params = {}) => {
  const response = await api.get("/stock-adjustments-status", {
    params,
    headers: getAuthHeaders(),
  });
  return response.data;
};

// 2. រក្សាទុកការកែសម្រួលស្តុក (Add, Subtract, Damage, New Stock)
export const createStockAdjustment = async (adjustmentData) => {
  const response = await api.post("/stock-adjustments", adjustmentData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};