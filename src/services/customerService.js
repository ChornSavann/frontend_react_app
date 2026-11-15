// src/services/customerService.js
import api from './api';

// 🟢 ១. ទាញយកបញ្ជីអតិថិជនទាំងអស់ (List Customers)
export const listCustomers = async () => {
  try {
    const response = await api.get('/customers');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការទាញយកទិន្នន័យអតិថិជន' };
  }
};

// 🟢 ២. ទាញយកព័ត៌មានអតិថិជនតាម ID
export const getCustomerById = async (id) => {
  try {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'រកមិនឃើញអតិថិជននេះទេ' };
  }
};

// 🟢 ៣. បង្កើតអតិថិជនថ្មី (Create Customer - គាំទ្រទាំង FormData និង JSON)
export const createCustomer = async (formData) => {
  try {
    const response = await api.post('/customers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការបង្កើតអតិថិជនថ្មី' };
  }
};

// 🟢 ៤. កែប្រែព័ត៌មានអតិថិជន (Update Customer)
export const updateCustomer = async (id, formData) => {
  try {
    formData.append('_method', 'PUT');
    const response = await api.post(`/customers/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការកែប្រែព័ត៌មានអតិថិជន' };
  }
};

// 🟢 ៥. លុបអតិថិជន (Delete Customer)
export const deleteCustomer = async (id) => {
  try {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការលុបអតិថិជន' };
  }
};