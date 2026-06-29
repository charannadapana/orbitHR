import axios from './axios';

export const activityService = {
  getTimeline: async (employeeId, params = {}) => {
    const response = await axios.get(`/activity/${employeeId}`, { params });
    return response.data;
  },
};
