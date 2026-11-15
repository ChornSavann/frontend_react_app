// src/services/purchaseService.js
import api from './api';

export const listPurchases = async () => {
    try {
        const response = await api.get('/purchases');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'បរាជ័យក្នុងការទាញយកទិន្នន័យការទិញចូល' };
    }
};


export const getPurchaseById = async (id) => {
    try {
        const response = await api.get(`/purchases/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'រកមិនឃើញវិក្កយបត្រទិញចូលនេះទេ' };
    }
};


export const createPurchase = async (payload) => {
    try {
        const response = await api.post('/purchases', payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'បរាជ័យក្នុងការបង្កើតការទិញចូលថ្មី' };
    }
};


export const updatePurchase = async (id, payload) => {
    try {
        const response = await api.post(`/purchases/${id}`, payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'បរាជ័យក្នុងការកែប្រែវិក្កយបត្រទិញចូល' };
    }
};


export const getSuppliers = async () => {
    try {
        const response = await api.get('/suppliers');
        return response.data?.data || response.data || [];
    } catch {
        return [];
    }
};