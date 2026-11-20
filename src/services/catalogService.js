
import api from "./api";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};


export const getCatalogProducts = async (page = 1, search = "") => {
    const response = await api.get(`/products?page=${page}&search=${search}`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

export const getCategory = async () => {
    const response = await api.get(`/categories`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};


export const getbrand = async () => {
    const response = await api.get(`/brands`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};


export const getunit = async () => {
    const response = await api.get(`/units`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};


export const createProduct = async (productData) => {
    const response = await api.post(`/products`, productData, {
        headers: {
            ...getAuthHeaders(),
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};


export const updateProduct = async (id, productData) => {
    if (productData instanceof FormData && !productData.has("_method")) {
        productData.append("_method", "POST");
    }

    const response = await api.post(`/products/${id}`, productData, {
        headers: {
            ...getAuthHeaders(),
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};


export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};