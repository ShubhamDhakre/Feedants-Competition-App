import api from './api';

// Auth-related API calls
const authService = {
  register: (name, email, password) => {
    return api.post('/auth/register', { name, email, password });
  },

  login: (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  getMe: () => {
    return api.get('/auth/me');
  },
};

export default authService;
