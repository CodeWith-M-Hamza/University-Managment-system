import api from "../Api";

const studentAPI = {
  getAll: () => {
    console.log('📥 Fetching all students...');
    return api.get('/students/')
      .then(response => {
        console.log(`✅ Retrieved ${response.data?.length || 0} students`);
        return response;
      })
      .catch(error => {
        console.error('❌ Failed to fetch students');
        throw error;
      });
  },
  
  getById: (id) => {
    console.log(`📥 Fetching student with ID: ${id}`);
    return api.get(`/students/${id}/`)
      .then(response => {
        console.log('✅ Student retrieved:', response.data);
        return response;
      })
      .catch(error => {
        console.error(`❌ Failed to fetch student ${id}`);
        throw error;
      });
  },
  
  create: (studentData) => {
    console.log('📤 Creating new student with data:', studentData);
    console.log('🔍 Data type:', typeof studentData);
    console.log('🔍 Data keys:', Object.keys(studentData));
    
    return api.post('/students/', studentData)
      .then(response => {
        console.log('✅ Student created successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error('❌ Failed to create student');
        console.error('🔍 Request payload that failed:', studentData);
        throw error;
      });
  },
  
  update: (id, studentData) => {
    console.log(`🔄 Updating student ${id} with data:`, studentData);
    return api.put(`/students/${id}/`, studentData)
      .then(response => {
        console.log('✅ Student updated successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error(`❌ Failed to update student ${id}`);
        throw error;
      });
  },
  
  patch: (id, studentData) => {
    console.log(`🔄 Partially updating student ${id} with data:`, studentData);
    return api.patch(`/students/${id}/`, studentData)
      .then(response => {
        console.log('✅ Student patched successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error(`❌ Failed to patch student ${id}`);
        throw error;
      });
  },
  
  delete: (id) => {
    console.log(`🗑️ Deleting student with ID: ${id}`);
    return api.delete(`/students/${id}/`)
      .then(response => {
        console.log('✅ Student deleted successfully');
        return response;
      })
      .catch(error => {
        console.error(`❌ Failed to delete student ${id}`);
        throw error;
      });
  },

  getClassSections: () => {
    console.log('📥 Fetching class sections...');
    return api.get('/class-sections/')
      .then(response => {
        console.log(`✅ Retrieved ${response.data?.length || 0} class sections`);
        return response;
      })
      .catch(error => {
        console.error('❌ Failed to fetch class sections');
        throw error;
      });
  },

  getDepartments: () => {
    console.log('📥 Fetching departments...');
    return api.get('/departments/')
      .then(response => {
        console.log(`✅ Retrieved ${response.data?.length || 0} departments`);
        return response;
      })
      .catch(error => {
        console.error('❌ Failed to fetch departments');
        throw error;
      });
  },

  getAcademicSessions: () => {
    console.log('📥 Fetching academic sessions...');
    return api.get('/sessions/')
      .then(response => {
        console.log(`✅ Retrieved ${response.data?.length || 0} academic sessions`);
        return response;
      })
      .catch(error => {
        console.error('❌ Failed to fetch academic sessions');
        throw error;
      });
  }
};

export default studentAPI;