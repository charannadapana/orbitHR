import axios from './axios';

export const analyticsService = {
  getManagerAnalytics: async (params = {}) => {
    const response = await axios.get('/analytics/manager', { params });
    return response.data;
  },

  getTeamOverview: async () => {
    const response = await axios.get('/analytics/team-overview');
    return response.data;
  },

  getTaskPerformance: async (params = {}) => {
    const response = await axios.get('/analytics/task-performance', { params });
    return response.data;
  },

  getAttendanceTrends: async () => {
    const response = await axios.get('/analytics/attendance-trends');
    return response.data;
  },

  getPerformanceRanking: async (params = {}) => {
    const response = await axios.get('/analytics/performance-ranking', { params });
    return response.data;
  },

  getWorkload: async () => {
    const response = await axios.get('/analytics/workload');
    return response.data;
  },

  getAdminAnalytics: async (params = {}) => {
    const response = await axios.get('/analytics/admin', { params });
    return response.data;
  },
};
