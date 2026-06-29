import axios from './axios';

const BASE_URL = '/skills';

export const skillService = {
  getSkills: async (params = {}) => {
    const response = await axios.get(BASE_URL, { params });
    return response.data;
  },

  getSuggestions: async (query = '') => {
    const response = await axios.get(`${BASE_URL}/suggestions`, { params: { q: query } });
    return response.data;
  },

  createSkill: async (data) => {
    const response = await axios.post(BASE_URL, data);
    return response.data;
  },

  updateSkill: async (id, data) => {
    const response = await axios.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  deleteSkill: async (id) => {
    const response = await axios.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  assignSkill: async (data) => {
    const response = await axios.post(`${BASE_URL}/assign`, data);
    return response.data;
  },

  updateAssignment: async (id, data) => {
    const response = await axios.put(`${BASE_URL}/assign/${id}`, data);
    return response.data;
  },

  deleteAssignment: async (id) => {
    const response = await axios.delete(`${BASE_URL}/assign/${id}`);
    return response.data;
  },

  getEmployeeSkills: async (employeeId) => {
    const response = await axios.get(`${BASE_URL}/employee/${employeeId}`);
    return response.data;
  },

  getMySkills: async () => {
    const response = await axios.get(`${BASE_URL}/my`);
    return response.data;
  },
};
