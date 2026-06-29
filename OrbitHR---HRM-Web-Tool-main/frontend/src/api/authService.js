import axios from './axios';

const API_URL = '/auth';

export const authService = {
  register: async (payload) => {
    const response = await axios.post(`${API_URL}/register`, payload);
    return response.data;
  },
};
