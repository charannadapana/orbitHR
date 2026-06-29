import axios from './axios';

export const teamService = {
  getTeamOptions: async () => {
    const response = await axios.get('/teams/options');
    return response.data;
  },

  getAllTeams: async () => {
    const response = await axios.get('/teams');
    return response.data;
  },

  getMyManagedTeam: async () => {
    const response = await axios.get('/team/my-team');
    return response.data;
  },

  getMyEmployeeTeam: async () => {
    const response = await axios.get('/employee/team');
    return response.data;
  },

  createJoinRequest: async (teamId) => {
    const response = await axios.post('/join-request', { teamId });
    return response.data;
  },

  getJoinRequests: async () => {
    const response = await axios.get('/join-requests');
    return response.data;
  },

  reviewJoinRequest: async (id, status) => {
    const response = await axios.patch(`/join-request/${id}`, { status });
    return response.data;
  },
};
