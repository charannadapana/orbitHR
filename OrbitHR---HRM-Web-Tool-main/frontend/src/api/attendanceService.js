import axios from './axios';

const API_URL = '/attendance';

export const attendanceService = {
  // Mark attendance
  markAttendance: async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  // Get attendance records
  getAttendance: async (params = {}) => {
    const response = await axios.get(API_URL, { params });
    return response.data;
  },

  // Get single attendance record
  getAttendanceById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Update attendance record
  updateAttendance: async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  // Delete attendance record
  deleteAttendance: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Get today's attendance (admin)
  getTodayAttendance: async () => {
    const response = await axios.get(`${API_URL}/today`);
    return response.data;
  },

  getMyTodayAttendance: async () => {
    const response = await axios.get(`${API_URL}/my-today`);
    return response.data;
  },

  checkIn: async () => {
    const response = await axios.post(`${API_URL}/check-in`);
    return response.data;
  },

  checkOut: async () => {
    const response = await axios.post(`${API_URL}/check-out`);
    return response.data;
  },

  // Get employee attendance summary
  getEmployeeAttendanceSummary: async (employeeId, year, month) => {
    const response = await axios.get(`${API_URL}/summary/employee`, {
      params: { employeeId, year, month },
    });
    return response.data;
  },

  // Get organization attendance summary
  getOrganizationAttendanceSummary: async (year, month) => {
    const response = await axios.get(`${API_URL}/summary/organization`, {
      params: { year, month },
    });
    return response.data;
  },

  // Get team attendance for manager
  getTeamAttendance: async (params = {}) => {
    const response = await axios.get(`${API_URL}/team`, { params });
    return response.data;
  },
};
