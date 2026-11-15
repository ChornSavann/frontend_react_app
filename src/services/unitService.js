
import api from './api';


export const listUnits = async () => {
    try {
        const response = await api.get('/units');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'បរាជ័យក្នុងការទាញយកទិន្នន័យឯកតាទំនិញ' };
    }
};


export const getUnitById = async (id) => {
    try {
        const response = await api.get(`/units/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'រកមិនឃើញឯកតាទំនិញនេះទេ' };
    }
};


export const createUnit = async (payload) => {
    try {
        const response = await api.post('/units', payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'បរាជ័យក្នុងការបង្កើតឯកតាទំនិញថ្មី' };
    }
};


export const updateUnit = async (id, payload) => {
    try {
        const response = await api.post(`/units/${id}`, payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'បរាជ័យក្នុងការកែប្រែឯកតាទំនិញ' };
    }
};


export const deleteUnit = async (id) => {
    try {
        const response = await api.delete(`/units/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'បរាជ័យក្នុងការលុបឯកតាទំនិញ' };
    }
};