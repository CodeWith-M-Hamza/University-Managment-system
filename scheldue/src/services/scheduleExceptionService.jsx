import api from '../Api';

const SCHEDULE_EXCEPTION_BASE_URL = '/schedule-exceptions/';

export const scheduleExceptionService = {
  // GET all schedule exceptions
  getAllExceptions: async () => {
    try {
      const response = await api.get(SCHEDULE_EXCEPTION_BASE_URL);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // GET single exception
  getException: async (id) => {
    try {
      const response = await api.get(`${SCHEDULE_EXCEPTION_BASE_URL}${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // CREATE new exception
  createException: async (exceptionData) => {
    try {
      const response = await api.post(SCHEDULE_EXCEPTION_BASE_URL, exceptionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // UPDATE exception
  updateException: async (id, exceptionData) => {
    try {
      const response = await api.put(`${SCHEDULE_EXCEPTION_BASE_URL}${id}/`, exceptionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // DELETE exception
  deleteException: async (id) => {
    try {
      const response = await api.delete(`${SCHEDULE_EXCEPTION_BASE_URL}${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};