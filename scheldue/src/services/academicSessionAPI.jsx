// src/services/academicSessionAPI.js
import api from '../Api';

export const academicSessionAPI = {
  getAll: async () => {
    console.log('📥 Fetching all academic sessions...');
    try {
      const response = await api.get('/sessions/');
      console.log(`✅ Retrieved ${response.data?.length || 0} academic sessions`);
      return response.data; // Return just the data, not full response
    } catch (error) {
      console.error('❌ Failed to fetch academic sessions:', error.response?.data || error.message);
      throw error;
    }
  },

  getById: async (id) => {
    console.log(`📥 Fetching academic session with ID: ${id}`);
    try {
      const response = await api.get(`/sessions/${id}/`);
      console.log('✅ Academic session retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch academic session ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  create: async (sessionData) => {
    console.log('📤 Creating new academic session with data:', sessionData);
    try {
      const response = await api.post('/sessions/', sessionData);
      console.log('✅ Academic session created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create academic session:', error.response?.data || error.message);
      throw error;
    }
  },

  update: async (id, sessionData) => {
    console.log(`🔄 Updating academic session ${id} with data:`, sessionData);
    try {
      const response = await api.put(`/sessions/${id}/`, sessionData);
      console.log('✅ Academic session updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to update academic session ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  delete: async (id) => {
    console.log(`🗑️ Deleting academic session with ID: ${id}`);
    try {
      await api.delete(`/sessions/${id}/`);
      console.log('✅ Academic session deleted successfully');
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to delete academic session ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },
};