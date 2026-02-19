// src/services/utilityAPI.js
import api from '../Api';

export const utilityAPI = {
  getSectionSchedule: (sectionId) => api.get(`/class-sections/${sectionId}/schedule/`),
  getSessionSchedule: (sessionId) => api.get(`/sessions/${sessionId}/schedule/`),
};