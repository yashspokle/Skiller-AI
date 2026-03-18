import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Skill Audit
export const auditAPI = {
  submitCV: (cvText, targetRole) =>
    api.post('/skill-audit/cv', { cvText, targetRole }).then(r => r.data),
  analyseGithub: (username, targetRole) =>
    api.post('/skill-audit/github', { username, targetRole }).then(r => r.data),
  getProfile: () => api.get('/skill-audit/profile').then(r => r.data),
};

// Roadmap
export const roadmapAPI = {
  generate: (targetRole) =>
    api.post('/roadmap/generate', { targetRole }).then(r => r.data),
  getMy: () => api.get('/roadmap/my').then(r => r.data),
  completeWeek: (week) =>
    api.patch(`/roadmap/complete-week/${week}`).then(r => r.data)
};

// Opportunities
export const oppsAPI = {
  getAll: (params) => api.get('/opportunities', { params }).then(r => r.data)
};

// Analytics
export const analyticsAPI = {
  trends: () => api.get('/analytics/skill-trends').then(r => r.data),
  userProgress: () => api.get('/analytics/user-progress').then(r => r.data)
};

// Enterprise
export const enterpriseAPI = {
  teamOverview: () => api.get('/enterprise/team-overview').then(r => r.data)
};

export default api;