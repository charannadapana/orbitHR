import axios from './axios';

export const notificationService = {
  getMyNotifications: async (params = {}) => {
    const response = await axios.get('/notifications', { params });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await axios.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axios.patch('/notifications/read-all');
    return response.data;
  },
};
