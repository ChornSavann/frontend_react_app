
import api from "./api";

export const getDeliveryOrders = async (params = {}) => {
  const response = await api.get("/deliveries", { params });
  return response.data;
};

export const updateDeliveryStatus = async (id, statusOrPayload) => {
  const payload =
    typeof statusOrPayload === "string"
      ? { status: statusOrPayload }
      : statusOrPayload;
  const response = await api.patch(`/deliveries/${id}/status`, payload);
  return response.data;
};


export const updateDelivery = async (id, data) => {
  const response = await api.put(`/deliveries/${id}`, data);
  return response.data;
};

export const cancelDelivery = async (orderId, data = {}) => {
  const response = await api.post(`/orders/cancel-order/${orderId}`, data);
  return response.data;
};