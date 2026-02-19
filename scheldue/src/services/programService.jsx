import api from '../Api';

const PROGRAM_BASE_URL = '/programs/';

export const programService = {
  // GET all programs
  getAllPrograms: async () => {
    try {
      const response = await api.get(PROGRAM_BASE_URL);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // GET single program
  getProgram: async (id) => {
    try {
      const response = await api.get(`${PROGRAM_BASE_URL}${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // CREATE new program
  createProgram: async (programData) => {
    try {
      const response = await api.post(PROGRAM_BASE_URL, programData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // UPDATE program
  updateProgram: async (id, programData) => {
    try {
      const response = await api.put(`${PROGRAM_BASE_URL}${id}/`, programData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // DELETE program
  deleteProgram: async (id) => {
    try {
      const response = await api.delete(`${PROGRAM_BASE_URL}${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};