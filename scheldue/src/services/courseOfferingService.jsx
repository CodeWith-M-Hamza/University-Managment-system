import api from '../Api';

const COURSE_OFFERING_BASE_URL = '/course-offerings/';

export const courseOfferingService = {
  // GET all course offerings
  getAllOfferings: async () => {
    try {
      const response = await api.get(COURSE_OFFERING_BASE_URL);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // GET single offering
  getOffering: async (id) => {
    try {
      const response = await api.get(`${COURSE_OFFERING_BASE_URL}${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // CREATE new offering
  createOffering: async (offeringData) => {
    try {
      const response = await api.post(COURSE_OFFERING_BASE_URL, offeringData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // UPDATE offering
  updateOffering: async (id, offeringData) => {
    try {
      const response = await api.put(`${COURSE_OFFERING_BASE_URL}${id}/`, offeringData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // DELETE offering
  deleteOffering: async (id) => {
    try {
      const response = await api.delete(`${COURSE_OFFERING_BASE_URL}${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};