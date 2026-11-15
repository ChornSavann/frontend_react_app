
import api from './api';


export const listCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការទាញយកទិន្នន័យប្រភេទទំនិញ' };
  }
};


export const getCategoryById = async (id) => {
  try {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'រកមិនឃើញប្រភេទទំនិញនេះទេ' };
  }
};


export const createCategory = async (formData) => {
  try {
    const response = await api.post('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការបង្កើតប្រភេទទំនិញថ្មី' };
  }
};


export const updateCategory = async (id, formData) => {
  try {
    formData.append('_method', 'POST');
    const response = await api.post(`/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការកែប្រែប្រភេទទំនិញ' };
  }
};


export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការលុបប្រភេទទំនិញ' };
  }
};