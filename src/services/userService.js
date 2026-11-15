
import api from './api';


export const listUsers = async () => {
  try {
    const response = await api.get('/getuser/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការទាញយកទិន្នន័យអ្នកប្រើប្រាស់' };
  }
};


export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'រកមិនឃើញអ្នកប្រើប្រាស់នេះទេ' };
  }
};


export const createUser = async (formData) => {
  try {
    const response = await api.post('/createuser', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការបង្កើតអ្នកប្រើប្រាស់ថ្មី' };
  }
};


export const updateUser = async (id, formData) => {
  try {
    formData.append('_method', 'POST');
    const response = await api.post(`/updateuser/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការកែប្រែព័ត៌មានអ្នកប្រើប្រាស់' };
  }
};


export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការលុបអ្នកប្រើប្រាស់' };
  }
};