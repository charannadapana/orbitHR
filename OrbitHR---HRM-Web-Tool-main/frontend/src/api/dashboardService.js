import axios from './axios';

export const dashboardService = {
  getAdminSummary: async () => {
    const response = await axios.get('/dashboard/admin-summary');
    return response.data;
  },

  getEmployeeSummary: async () => {
    const response = await axios.get('/dashboard/employee-summary');
    return response.data;
  },
};
