// src/services/expenseService.js
import api from './api';

// ==========================================
// 🟢 ផ្នែកទី ១៖ ប្រភេទការចំណាយ (Expense Types)
// ==========================================

export const listExpenseTypes = async () => {
  try {
    const response = await api.get('/expense-types');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការទាញយកប្រភេទការចំណាយ' };
  }
};

export const createExpenseType = async (payload) => {
  try {
    const response = await api.post('/expense-types', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការបង្កើតប្រភេទការចំណាយថ្មី' };
  }
};

export const updateExpenseType = async (id, payload) => {
  try {
    const response = await api.put(`/expense-types/${id}`, payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការកែប្រែប្រភេទការចំណាយ' };
  }
};

export const deleteExpenseType = async (id) => {
  try {
    const response = await api.delete(`/expense-types/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការលុបប្រភេទការចំណាយ' };
  }
};

// ==========================================
// 🟢 ផ្នែកទី ២៖ ការចំណាយ (Expenses)
// ==========================================

export const listExpenses = async () => {
  try {
    const response = await api.get('/expenses');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការទាញយកទិន្នន័យការចំណាយ' };
  }
};

export const getExpenseById = async (id) => {
  try {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'រកមិនឃើញទិន្នន័យការចំណាយនេះទេ' };
  }
};

export const createExpense = async (payload) => {
  try {
    const isFormData = payload instanceof FormData;
    const response = await api.post(
      '/expenses',
      payload,
      isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការបង្កើតការចំណាយថ្មី' };
  }
};

export const updateExpense = async (id, payload) => {
  try {
    if (payload instanceof FormData) {
      payload.append('_method', 'PUT');
      const response = await api.post(`/expenses/${id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await api.put(`/expenses/${id}`, payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការកែប្រែការចំណាយ' };
  }
};

export const deleteExpense = async (id) => {
  try {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការលុបការចំណាយ' };
  }
};