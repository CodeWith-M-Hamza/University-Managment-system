import api from '../Api';

const timetableService = {
  // Get all schedules with related data - FIXED ENDPOINT
  getAllSchedules: async () => {
    try {
      console.log('📅 Fetching schedules from /schedule/ endpoint...');
      const response = await api.get('/schedule/?expand=time_slot,teacher,course,room,department,academic_session,class_section');
      console.log('✅ Schedules response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching schedules:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      // Return empty array instead of throwing error
      return [];
    }
  },

  // Get master timetable with all relationships - FIXED ENDPOINT
  getMasterTimetable: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      params.append('expand', 'time_slot,teacher,course,room,department,academic_session,class_section');
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await api.get(`/schedule/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching master timetable:', error);
      return [];
    }
  },

  // Create new schedule - FIXED ENDPOINT
  createSchedule: async (scheduleData) => {
    try {
      const response = await api.post('/schedule/', scheduleData);
      return response.data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  },

  // Update schedule - FIXED ENDPOINT
  updateSchedule: async (id, scheduleData) => {
    try {
      const response = await api.put(`/schedule/${id}/`, scheduleData);
      return response.data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  },

  // Delete schedule - FIXED ENDPOINT
  deleteSchedule: async (id) => {
    try {
      const response = await api.delete(`/schedule/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }
};

export { timetableService };