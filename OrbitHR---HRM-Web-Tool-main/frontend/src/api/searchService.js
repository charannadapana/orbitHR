import axios from './axios';

export const searchService = {
  globalSearch: async (query) => {
    const response = await axios.get('/search/global', {
      params: { q: query },
    });
    return response.data;
  },
};
