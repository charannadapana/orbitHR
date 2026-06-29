import axios from './axios';

const API_URL = '/leaves';

export const leaveService = {
  requestLeave: async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  getLeaves: async (params = {}) => {
    const response = await axios.get(API_URL, { params });
    return response.data;
  },

  getLeaveById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  reviewLeave: async (id, data) => {
    const response = await axios.patch(`${API_URL}/${id}/status`, data);
    return response.data;
  },

  deleteLeave: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },

  getTeamLeaves: async (params = {}) => {
    const response = await axios.get(`${API_URL}/team`, { params });
    return response.data;
  },
};
