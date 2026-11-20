
import api from "./api";


export const getPosProducts = async () => {
  const response = await api.get("/products");
  return response.data;
};


export const getPosCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};


export const createPosOrder = async (orderData) => {
  const response = await api.post("/orders", orderData);
  return response.data;
};

export const getCustomer = async () => {
  const response = await api.get("/customers");
  return response.data;
}

export const createCustomer = async (customerdata) => {
  const response = await api.post("/customers", customerdata);
  return response.data;
}

export const getExpense = async () => {
  const response = await api.get("/expenses");
  return response.data;
}