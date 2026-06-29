import api from './axios';

export const announcementService = {
  getAnnouncements: async () => {
    const response = await api.get('/announcements');
    return response.data;
  },
  createAnnouncement: async (data) => {
    const response = await api.post('/announcements', data);
    return response.data;
  },
  updateAnnouncement: async (id, data) => {
    const response = await api.put(`/announcements/${id}`, data);
    return response.data;
  },
  deleteAnnouncement: async (id) => {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  }
};
