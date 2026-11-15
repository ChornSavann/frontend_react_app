// src/services/storeService.js
import api from './api';

export const listStores = async () => {
    try {
        const response = await api.get('/store');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'បរាជ័យក្នុងការទាញយកទិន្នន័យហាង/សាខា' };
    }
};


export const getStoreById = async (id) => {
    try {
        const response = await api.get(`/store/edit/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'រកមិនឃើញហាងនេះទេ' };
    }
};


export const createStore = async (formData) => {
    try {
        const response = await api.post('/store/create/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'បរាជ័យក្នុងការបង្កើតហាងថ្មី' };
    }
};


export const updateStore = async (id, formData) => {
    try {
        formData.append('_method', 'POST');
        const response = await api.post(`/store/update/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'បរាជ័យក្នុងការកែប្រែព័ត៌មានហាង' };
    }
};


export const deleteStore = async (id) => {
    try {
        const response = await api.delete(`/store/destroy/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'បរាជ័យក្នុងការលុបហាងនេះ' };
    }
};