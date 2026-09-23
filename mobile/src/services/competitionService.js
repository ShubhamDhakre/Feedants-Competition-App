import api from './api';

// Competition-related API calls
const competitionService = {
  getCompetitions: () => {
    return api.get('/competitions');
  },

  getCompetition: (id) => {
    return api.get(`/competitions/${id}`);
  },

  register: (competitionId) => {
    return api.post(`/competitions/${competitionId}/register`);
  },

  submitEntry: (competitionId, submission) => {
    return api.post(`/competitions/${competitionId}/submission`, submission);
  },
};

export default competitionService;
