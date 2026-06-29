import api from './axios';

export const payrollService = {
  getMyPayslip: async (year, month) => {
    const response = await api.get(`/payroll/my-slip?year=${year}&month=${month}`);
    return response.data;
  },

  getTeamPayslips: async (year, month) => {
    const response = await api.get(`/payroll/team?year=${year}&month=${month}`);
    return response.data;
  },
};
