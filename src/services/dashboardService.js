// src/services/dashboardService.js
import api from "./api";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getDashboardAnalytics = async (params = {}) => {
    try {
        const response = await api.get("/reportsfinance/dashboard", {
            params,
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard analytics:", error);
        throw error;
    }
};