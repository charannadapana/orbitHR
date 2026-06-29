import axios from './axios';

const API_URL = '/employees';

export const employeeService = {
  // Get all employees with filters
  getAllEmployees: async (params = {}) => {
    const response = await axios.get(API_URL, { params });
    return response.data;
  },

  // Get single employee
  getEmployee: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Get employee by user ID
  getEmployeeByUserId: async (userId) => {
    const response = await axios.get(`${API_URL}/user/${userId}`);
    return response.data;
  },

  // Create employee
  createEmployee: async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  // Update employee
  updateEmployee: async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  // Delete employee
  deleteEmployee: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Get employee statistics
  getEmployeeStats: async () => {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data;
  },

  // Get manager's team
  getMyTeam: async () => {
    const response = await axios.get(`${API_URL}/my-team`);
    return response.data;
  },
};
