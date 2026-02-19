import api from '../Api';

const GENERATED_SCHEDULE_BASE_URL = '/generated-schedules/';

export const generatedScheduleService = {
  // GET all generated schedules
  getAllSchedules: async () => {
    try {
      console.log('Fetching all generated schedules...');
      const response = await api.get(GENERATED_SCHEDULE_BASE_URL);
      console.log('Schedules fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error.response?.data || error.message;
    }
  },

  // GET single schedule
  getSchedule: async (id) => {
    try {
      console.log(`Fetching schedule with ID: ${id}`);
      const response = await api.get(`${GENERATED_SCHEDULE_BASE_URL}${id}/`);
      console.log('Schedule fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching schedule ${id}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error.response?.data || error.message;
    }
  },

  // CREATE new schedule
  createSchedule: async (scheduleData) => {
    try {
      console.log('Creating new schedule with data:', scheduleData);
      
      // ✅ CORRECT: Check for fields without _id suffix
      if (!scheduleData.name || !scheduleData.academic_session || !scheduleData.department) {
        throw new Error('Missing required fields: name, academic_session, department');
      }

      // Ensure data types are correct
      const processedData = {
        name: scheduleData.name,
        academic_session: parseInt(scheduleData.academic_session),
        department: parseInt(scheduleData.department),
        is_active: Boolean(scheduleData.is_active)
        // Remove generated_by - backend sets it automatically
      };

      console.log('Processed schedule data:', processedData);

      const response = await api.post(GENERATED_SCHEDULE_BASE_URL, processedData);
      console.log('Schedule created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ ERROR creating schedule:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        requestData: scheduleData
      });

      if (error.response?.data) {
        console.log('🔍 Backend validation errors:', JSON.stringify(error.response.data, null, 2));
      }

      if (error.response?.status === 400) {
        const errorData = error.response.data;
        let errorMessage = 'Validation error: ';
        
        if (typeof errorData === 'string') {
          errorMessage += errorData;
        } else if (errorData.detail) {
          errorMessage += errorData.detail;
        } else if (errorData.message) {
          errorMessage += errorData.message;
        } else if (typeof errorData === 'object') {
          const fieldErrors = Object.entries(errorData)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          errorMessage += fieldErrors || 'Invalid data provided';
        } else {
          errorMessage += 'Invalid data provided';
        }
        
        throw new Error(errorMessage);
      } else {
        throw error.response?.data || error.message;
      }
    }
  },

  // UPDATE schedule
  updateSchedule: async (id, scheduleData) => {
    try {
      console.log(`Updating schedule ${id} with data:`, scheduleData);
      
      const processedData = { ...scheduleData };
      if (processedData.department) {
        processedData.department = parseInt(processedData.department);
      }
      if (processedData.academic_session) {
        processedData.academic_session = parseInt(processedData.academic_session);
      }

      const response = await api.put(`${GENERATED_SCHEDULE_BASE_URL}${id}/`, processedData);
      console.log('Schedule updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating schedule ${id}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error.response?.data || error.message;
    }
  },

  // DELETE schedule
  deleteSchedule: async (id) => {
    try {
      console.log(`Deleting schedule with ID: ${id}`);
      const response = await api.delete(`${GENERATED_SCHEDULE_BASE_URL}${id}/`);
      console.log('Schedule deleted successfully');
      return response.data;
    } catch (error) {
      console.error(`Error deleting schedule ${id}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error.response?.data || error.message;
    }
  },

  // ACTIVATE schedule
  activateSchedule: async (id) => {
    try {
      console.log(`Activating schedule with ID: ${id}`);
      const response = await api.post(`${GENERATED_SCHEDULE_BASE_URL}${id}/activate/`);
      console.log('Schedule activated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error activating schedule ${id}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error.response?.data || error.message;
    }
  }
};