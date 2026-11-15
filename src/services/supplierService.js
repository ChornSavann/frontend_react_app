
import api from './api';

export const listSuppliers = async () => {
  try {
    const response = await api.get('/suppliers');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការទាញយកទិន្នន័យអ្នកផ្គត់ផ្គង់' };
  }
};

export const getSupplierById = async (id) => {
  try {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'រកមិនឃើញអ្នកផ្គត់ផ្គង់នេះទេ' };
  }
};


export const createSupplier = async (payload) => {
  try {
    const response = await api.post('/suppliers', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការបង្កើតអ្នកផ្គត់ផ្គង់ថ្មី' };
  }
};


export const updateSupplier = async (id, payload) => {
  try {
    const response = await api.put(`/suppliers/${id}`, payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការកែប្រែព័ត៌មានអ្នកផ្គត់ផ្គង់' };
  }
};

export const deleteSupplier = async (id) => {
  try {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការលុបអ្នកផ្គត់ផ្គង់' };
  }
};