
import api from './api';

export const listBrands = async () => {
  try {
    const response = await api.get('/brands');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការទាញយកទិន្នន័យម៉ាកទំនិញ' };
  }
};


export const getBrandById = async (id) => {
  try {
    const response = await api.get(`/brands/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'រកមិនឃើញម៉ាកទំនិញនេះទេ' };
  }
};


export const createBrand = async (formData) => {
  try {
    const response = await api.post('/brands', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការបង្កើតម៉ាកទំនិញថ្មី' };
  }
};


export const updateBrand = async (id, formData) => {
  try {
    formData.append('_method', 'POST');
    const response = await api.post(`/brands/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការកែប្រែម៉ាកទំនិញ' };
  }
};


export const deleteBrand = async (id) => {
  try {
    const response = await api.delete(`/brands/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការលុបម៉ាកទំនិញ' };
  }
};