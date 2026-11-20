// src/services/vendorInvoiceService.js
import api from "./api";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// 1. ទាញយកបញ្ជី Vendor Invoices
export const getVendorInvoices = async (params = {}) => {
    const response = await api.get("/vendor-invoices", {
        params,
        headers: getAuthHeaders(),
    });
    return response.data;
};

// 2. បង្កើត Vendor Invoice ថ្មី
export const createVendorInvoice = async (invoiceData) => {
    const response = await api.post("/vendor-invoices", invoiceData, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

// 3. កែប្រែ Vendor Invoice តាម ID (PUT/PATCH)
export const updateVendorInvoice = async (id, invoiceData) => {
    const response = await api.put(`/vendor-invoices/${id}`, invoiceData, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

// 4. មើលព័ត៌មានលម្អិត Invoice តាម ID
export const getVendorInvoiceById = async (id) => {
    const response = await api.get(`/vendor-invoices/${id}`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

// 5. លុប Invoice
export const deleteVendorInvoice = async (id) => {
    const response = await api.delete(`/vendor-invoices/${id}`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};