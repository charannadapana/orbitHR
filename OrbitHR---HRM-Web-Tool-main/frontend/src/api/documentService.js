import axios from './axios';

export const documentService = {
  uploadDocument: async ({ employeeId, file }) => {
    const formData = new FormData();
    formData.append('employeeId', employeeId);
    formData.append('file', file);

    const response = await axios.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  getEmployeeDocuments: async (employeeId) => {
    const response = await axios.get(`/documents/employee/${employeeId}`);
    return response.data;
  },

  downloadDocument: async (id) => {
    return axios.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
  },

  deleteDocument: async (id) => {
    const response = await axios.delete(`/documents/${id}`);
    return response.data;
  },
};
