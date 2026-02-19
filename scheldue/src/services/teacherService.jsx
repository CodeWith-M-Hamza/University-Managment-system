
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add JWT token interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 JWT token added to request');
    } else {
      console.warn('⚠️ No JWT token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    
    if (error.response) {
      // Server responded with error status
      console.error('🔍 Error response status:', error.response.status);
      console.error('🔍 Error response data:', error.response.data);
      console.error('🔍 Error response headers:', error.response.headers);
      
      // Handle specific status codes
      if (error.response.status === 401) {
        console.error('🔐 Unauthorized - Token may be invalid or expired');
        // Optional: Redirect to login or refresh token
      } else if (error.response.status === 403) {
        console.error('🚫 Forbidden - Insufficient permissions');
      } else if (error.response.status === 404) {
        console.error('🔍 Not Found - Endpoint does not exist');
      } else if (error.response.status === 500) {
        console.error('💥 Server Error - Internal server issue');
      }
    } else if (error.request) {
      // No response received
      console.error('🌐 Network Error - No response received:', error.request);
      console.error('🔍 Request details:', {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      });
    } else {
      // Other errors
      console.error('⚡ Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

const TeacherService = {
  getAll: () => {
    console.log('📥 Fetching all teachers...');
    return api.get('/teachers/')
      .then(response => {
        console.log(`✅ Retrieved ${response.data?.length || 0} teachers`);
        return response;
      })
      .catch(error => {
        console.error('❌ Failed to fetch teachers');
        throw error;
      });
  },

  getAllWithUser: () => {
    console.log('📥 Fetching all teachers with user details...');
    return api.get('/teachers/', {
      params: { expand: 'user' }
    })
      .then(response => {
        console.log(`✅ Retrieved ${response.data?.length || 0} teachers with user details`);
        return response;
      })
      .catch(error => {
        console.error('❌ Failed to fetch teachers with user details');
        throw error;
      });
  },
  
  getById: (id) => {
    console.log(`📥 Fetching teacher with ID: ${id}`);
    return api.get(`/teachers/${id}/`)
      .then(response => {
        console.log('✅ Teacher retrieved:', response.data);
        return response;
      })
      .catch(error => {
        console.error(`❌ Failed to fetch teacher ${id}`);
        throw error;
      });
  },
  
  create: (teacherData) => {
    console.log('📤 Creating new teacher with data:', teacherData);
    console.log('🔍 Data type:', typeof teacherData);
    console.log('🔍 Data keys:', Object.keys(teacherData));
    
    return api.post('/teachers/', teacherData)
      .then(response => {
        console.log('✅ Teacher created successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error('❌ Failed to create teacher');
        console.error('🔍 Request payload that failed:', teacherData);
        throw error;
      });
  },
  
  update: (id, teacherData) => {
    console.log(`🔄 Updating teacher ${id} with data:`, teacherData);
    return api.put(`/teachers/${id}/`, teacherData)
      .then(response => {
        console.log('✅ Teacher updated successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error(`❌ Failed to update teacher ${id}`);
        throw error;
      });
  },
  
  delete: (id) => {
    console.log(`🗑️ Deleting teacher with ID: ${id}`);
    return api.delete(`/teachers/${id}/`)
      .then(response => {
        console.log('✅ Teacher deleted successfully');
        return response;
      })
      .catch(error => {
        console.error(`❌ Failed to delete teacher ${id}`);
        throw error;
      });
  },
};

export default TeacherService;