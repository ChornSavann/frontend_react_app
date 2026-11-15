// src/services/rolePermissionService.js
import api from './api';

// 🟢 ១. ទាញយកបញ្ជី Roles និង Permissions ទាំងអស់
export const listRoles = async () => {
  try {
    const response = await api.get('/rolepermission');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការទាញយកបញ្ជី Roles' };
  }
};



// 🟢 ២. បង្កើត Role ថ្មី (ព្រមទាំងផ្ញើបញ្ជី permission_ids ចូលគ្នា)
export const createRole = async (payload) => {
  try {
    const response = await api.post('/createrole', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការបង្កើត Role ថ្មី' };
  }
};

// 🟢 ៣. កែប្រែ Role និង Permissions
export const updateRole = async (id, payload) => {
  try {
    const response = await api.put(`/updaterole/${id}`, payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការកែប្រែ Role' };
  }
};

// 🟢 ៤. លុប Role
export const deleteRole = async (id) => {
  try {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការលុប Role នេះ' };
  }
};




export const listPermissions = async () => {
  try {
    const response = await api.get('/permissions');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការទាញយកបញ្ជី Permissions' };
  }
};

export const createPermission = async (payload) => {
  try {
    const response = await api.post('/permissions', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការបង្កើត Permission' };
  }
};

export const updatePermission = async (id, payload) => {
  try {
    const response = await api.post(`/permissions/${id}`, payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការកែប្រែ Permission' };
  }
};

export const deletePermission = async (id) => {
  try {
    const response = await api.delete(`/permissions/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'បរាជ័យក្នុងការលុប Permission' };
  }
};