// src/services/productService.js
import api from './api';

// 🟢 ១. ទាញយកបញ្ជីទំនិញទាំងអស់ (List Products)
export const listproduct = async () => {
    try {
        const response = await api.get('/products'); // កែតាម Endpoint ក្នុង Laravel របស់បង (ឧ. /products ឬ /get-products)
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'បរាជ័យក្នុងការទាញយកទិន្នន័យទំនិញ' };
    }
};

// 🟢 ២. ទាញយកព័ត៌មានទំនិញតាម ID (Get Single Product)
export const getProductById = async (id) => {
    try {
        const response = await api.get(`/products/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'រកមិនឃើញទំនិញនេះទេ' };
    }
};

// 🟢 ៣. បន្ថែមទំនិញថ្មី (Create Product - គាំទ្រការ Upload រូបភាព)
export const createProduct = async (formData) => {
    try {
        const response = await api.post('/products', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'បរាជ័យក្នុងការបង្កើតទំនិញថ្មី' };
    }
};
export const getCategories = async () => {
    try {
        const response = await api.get('/categories');
        return response.data?.data || response.data || [];
    } catch {
        return [];
    }
};

export const getBrands = async () => {
    try {
        const response = await api.get('/brands');
        return response.data?.data || response.data || [];
    } catch {
        return [];
    }
};

export const getUnits = async () => {
    try {
        const response = await api.get('/units');
        return response.data?.data || response.data || [];
    } catch {
        return [];
    }
};
// 🟢 ៤. កែប្រែទំនិញ (Update Product)
export const updateProduct = async (id, formData) => {
    try {
        // ក្នុង Laravel ពេល Upload រូបភាពជាមួយការ Update ច្រើនប្រើ POST ជាមួយ _method: PUT
        const response = await api.post(`/products/${id}?_method=POST`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'បរាជ័យក្នុងការកែប្រែទំនិញ' };
    }
};

// 🟢 ៥. លុបទំនិញ (Delete Product)
export const deleteProduct = async (id) => {
    try {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'បរាជ័យក្នុងការលុបទំនិញ' };
    }
};