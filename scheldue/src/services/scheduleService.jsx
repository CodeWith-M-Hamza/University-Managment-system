

import api from "../Api";

const ScheduleService = {
  getAll: (expand = null) => {
    console.log('📥 Fetching all schedules...');
    
    const config = {};
    if (expand) {
      config.params = { expand };
    }
    
    return api.get('/schedule/', config)
      .then(response => {
        console.log(`✅ Retrieved ${response.data?.length || 0} schedules`);
        return response;
      })
      .catch(error => {
        console.error('❌ Failed to fetch schedules:', error.response?.data || error.message);
        throw error;
      });
  },
  
  // ... keep other methods the same but add expand support to getById as well
  getById: (id, expand = null) => {
    console.log(`📥 Fetching schedule with ID: ${id}`);
    
    const config = {};
    if (expand) {
      config.params = { expand };
    }
    
    return api.get(`/schedule/${id}/`, config)
      .then(response => {
        console.log('✅ Schedule retrieved:', response.data);
        return response;
      })
      .catch(error => {
        console.error(`❌ Failed to fetch schedule ${id}:`, error.response?.data || error.message);
        throw error;
      });
  },
  
  // ... rest of your methods remain the same
};

export default ScheduleService;