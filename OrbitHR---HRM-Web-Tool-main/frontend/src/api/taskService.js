import axios from './axios';

export const taskService = {
  createTask: async (data) => {
    const response = await axios.post('/tasks', data);
    return response.data;
  },

  getTasks: async (params = {}) => {
    const response = await axios.get('/tasks', { params });
    return response.data;
  },

  getManagerTasks: async (params = {}) => {
    const response = await axios.get('/tasks/manager', { params });
    return response.data;
  },

  getEmployeeTasks: async (params = {}) => {
    const response = await axios.get('/tasks/employee', { params });
    return response.data;
  },

  updateTaskStatus: async (id, status) => {
    const response = await axios.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  updateTask: async (id, data) => {
    const response = await axios.put(`/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await axios.delete(`/tasks/${id}`);
    return response.data;
  },
};
