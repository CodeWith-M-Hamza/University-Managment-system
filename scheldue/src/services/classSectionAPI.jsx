// src/services/classSectionAPI.jsx
import api from '../Api';

const classSectionAPI = {
  getAllSections: async () => {
    try {
      const response = await api.get('/class-sections/');
      return response.data;
    } catch (error) {
      console.error('Error fetching sections:', error);
      throw error.response?.data || error.message;
    }
  },

  getSection: async (id) => {
    try {
      const response = await api.get(`/class-sections/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching section:', error);
      throw error.response?.data || error.message;
    }
  },

  createSection: async (sectionData) => {
    try {
      console.log('📤 Creating section with data:', sectionData);
      const response = await api.post('/class-sections/', sectionData);
      console.log('✅ Section created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating section:', error.response?.data || error);
      throw error.response?.data || error.message;
    }
  },

  updateSection: async (id, sectionData) => {
    try {
      console.log('🔄 Updating section', id, 'with data:', sectionData);
      const response = await api.put(`/class-sections/${id}/`, sectionData);
      console.log('✅ Section updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating section:', error.response?.data || error);
      throw error.response?.data || error.message;
    }
  },

  deleteSection: async (id) => {
    try {
      console.log('🗑️ Deleting section:', id);
      const response = await api.delete(`/class-sections/${id}/`);
      console.log('✅ Section deleted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting section:', error.response?.data || error);
      throw error.response?.data || error.message;
    }
  }
};

export default classSectionAPI;