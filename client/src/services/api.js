import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth & User
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const changePassword = (data) => api.put('/auth/password', data);
export const deleteAccount = () => api.delete('/auth/account');

// Notifications
export const getNotifications = () => api.get('/notifications');
export const markNotificationAsRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => api.put('/notifications/read-all');

// Activities
export const getActivities = () => api.get('/activities');

// Tasks
export const getTasks = (params) => api.get('/tasks', { params });
export const getTask = (id) => api.get(`/tasks/${id}`);
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const updateTaskOrder = (data) => api.put('/tasks/order', data);
export const getAnalytics = () => api.get('/tasks/analytics/dashboard');

// Projects
export const getProjects = (params) => api.get('/projects', { params });
export const getProject = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// Teams
export const getTeams = () => api.get('/teams');
export const getTeam = (id) => api.get(`/teams/${id}`);
export const createTeam = (data) => api.post('/teams', data);
export const updateTeam = (id, data) => api.put(`/teams/${id}`, data);
export const deleteTeam = (id) => api.delete(`/teams/${id}`);
export const inviteMember = (teamId, data) => api.post(`/teams/${teamId}/invite`, data);
export const acceptInvitation = (token) => api.post(`/teams/invite/accept/${token}`);
export const removeMember = (teamId, userId) => api.delete(`/teams/${teamId}/members/${userId}`);
export const updateMemberRole = (teamId, userId, role) => api.put(`/teams/${teamId}/members/${userId}`, { role });

// Files
export const getFiles = (params) => api.get('/files', { params });
export const uploadFile = (data) => api.post('/files', data, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
export const deleteFile = (id) => api.delete(`/files/${id}`);

// Messages
export const getMessages = (params) => api.get('/messages', { params });
export const sendMessage = (data) => api.post('/messages', data);

export default api;
