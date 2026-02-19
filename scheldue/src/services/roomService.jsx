
// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8000/api';

// // Create axios instance with default config
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   withCredentials: true, // Important for cookies/sessions
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Add request interceptor to include CSRF token
// api.interceptors.request.use(
//   (config) => {
//     const csrfToken = getCookie('csrftoken');
//     if (csrfToken) {
//       config.headers['X-CSRFToken'] = csrfToken;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Helper function to get CSRF token from cookies
// const getCookie = (name) => {
//   let cookieValue = null;
//   if (document.cookie && document.cookie !== '') {
//     const cookies = document.cookie.split(';');
//     for (let i = 0; i < cookies.length; i++) {
//       const cookie = cookies[i].trim();
//       if (cookie.substring(0, name.length + 1) === (name + '=')) {
//         cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//         break;
//       }
//     }
//   }
//   return cookieValue;
// };

// const RoomService = {
//   getAll: () => api.get('/rooms/'),
  
//   getById: (id) => api.get(`/rooms/${id}/`),
  
//   create: (roomData) => {
//     console.log('📤 Sending room data:', roomData);
//     return api.post('/rooms/', roomData);
//   },
  
//   update: (id, roomData) => api.put(`/rooms/${id}/`, roomData),
  
//   delete: (id) => api.delete(`/rooms/${id}/`),
// };

// // Add response interceptor for error handling
// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     console.error('API Error:', error.response?.data || error.message);
//     return Promise.reject(error);
//   }
// );

// export default RoomService;




import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies/sessions
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Enhanced request interceptor with better logging
api.interceptors.request.use(
  (config) => {
    const csrfToken = getCookie('csrftoken');
    
    console.log(`🚀 ${config.method?.toUpperCase()} Request to: ${config.url}`);
    console.log('📦 Request data:', config.data);
    console.log('🔧 Request config:', {
      baseURL: config.baseURL,
      withCredentials: config.withCredentials,
      headers: config.headers
    });
    
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
      console.log('✅ CSRF token added to headers');
    } else {
      console.warn('⚠️ CSRF token not found in cookies');
      console.log('🍪 Available cookies:', document.cookie);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    console.log('📥 Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error Details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });
    
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          console.error('🛑 Bad Request - Validation errors:', data);
          break;
        case 401:
          console.error('🔐 Unauthorized - Check authentication');
          break;
        case 403:
          console.error('🚫 Forbidden - Check CSRF token or permissions');
          break;
        case 404:
          console.error('🔍 Not Found - Endpoint does not exist');
          break;
        case 500:
          console.error('💥 Server Error - Backend issue');
          break;
        default:
          console.error(`❌ HTTP Error ${status}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('🌐 Network Error - No response received:', error.request);
      
      if (error.code === 'ECONNABORTED') {
        console.error('⏰ Request timeout');
      }
    } else {
      // Something else happened
      console.error('⚡ Unexpected Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Enhanced cookie function with better logging
const getCookie = (name) => {
  let cookieValue = null;
  
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    console.log(`🍪 Looking for ${name} cookie in:`, cookies);
    
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        console.log(`✅ Found ${name} cookie:`, cookieValue ? `"${cookieValue.substring(0, 10)}..."` : 'Empty');
        break;
      }
    }
  }
  
  if (!cookieValue) {
    console.warn(`❌ ${name} cookie not found in document.cookie`);
    console.log('🔍 Full document.cookie:', document.cookie);
  }
  
  return cookieValue;
};

const RoomService = {
  // GET all rooms
  getAll: () => {
    console.log('📋 Fetching all rooms...');
    return api.get('/rooms/')
      .then(response => {
        console.log(`✅ Successfully fetched ${response.data?.length || 0} rooms`);
        return response;
      })
      .catch(error => {
        console.error('❌ Failed to fetch rooms');
        throw error;
      });
  },
  
  // GET room by ID
  getById: (id) => {
    console.log(`📋 Fetching room with ID: ${id}`);
    return api.get(`/rooms/${id}/`)
      .then(response => {
        console.log('✅ Successfully fetched room:', response.data);
        return response;
      })
      .catch(error => {
        console.error(`❌ Failed to fetch room ${id}`);
        throw error;
      });
  },
  
  // CREATE new room
  create: (roomData) => {
    console.log('🆕 Creating new room...');
    console.log('📤 Room data being sent:', roomData);
    console.log('🔍 Data types:', {
      room_number: typeof roomData.room_number,
      room_type: typeof roomData.room_type,
      capacity: typeof roomData.capacity,
      department: typeof roomData.department
    });
    
    return api.post('/rooms/', roomData)
      .then(response => {
        console.log('✅ Room created successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error('❌ Room creation failed');
        throw error;
      });
  },
  
  // UPDATE room
  update: (id, roomData) => {
    console.log(`✏️ Updating room ${id}...`);
    console.log('📤 Update data:', roomData);
    
    return api.put(`/rooms/${id}/`, roomData)
      .then(response => {
        console.log('✅ Room updated successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error(`❌ Failed to update room ${id}`);
        throw error;
      });
  },
  
  // DELETE room
  delete: (id) => {
    console.log(`🗑️ Deleting room ${id}...`);
    
    return api.delete(`/rooms/${id}/`)
      .then(response => {
        console.log('✅ Room deleted successfully');
        return response;
      })
      .catch(error => {
        console.error(`❌ Failed to delete room ${id}`);
        throw error;
      });
  },
};

// Test function to verify service connectivity
export const testRoomServiceConnection = async () => {
  console.group('🧪 RoomService Connection Test');
  
  try {
    // Test CSRF token
    const csrfToken = getCookie('csrftoken');
    console.log(`CSRF Token: ${csrfToken ? 'Present' : 'Missing'}`);
    
    // Test GET request
    console.log('Testing GET /rooms/...');
    const getResponse = await RoomService.getAll();
    console.log(`GET Test: ✅ Success (${getResponse.status})`);
    
    return {
      csrfToken: csrfToken ? 'Present' : 'Missing',
      getTest: '✅ Success',
      status: getResponse.status
    };
    
  } catch (error) {
    console.error('Connection Test: ❌ Failed', error);
    return {
      csrfToken: 'Missing',
      getTest: '❌ Failed',
      error: error.message
    };
  } finally {
    console.groupEnd();
  }
};

// Utility function to test POST with sample data
export const testRoomCreation = async (sampleData = null) => {
  console.group('🧪 Room Creation Test');
  
  const testData = sampleData || {
    room_number: `TEST-${Date.now()}`,
    room_type: "classroom",
    capacity: 30,
    department: "Test Department"
  };
  
  try {
    console.log('Testing POST /rooms/ with:', testData);
    const response = await RoomService.create(testData);
    console.log('POST Test: ✅ Success', response.data);
    return response;
    
  } catch (error) {
    console.error('POST Test: ❌ Failed', error.response?.data || error.message);
    throw error;
  } finally {
    console.groupEnd();
  }
};

export default RoomService;