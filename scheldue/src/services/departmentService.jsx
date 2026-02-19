
import api from "../Api";

const departmentService = {
  getAll: () => {
    console.log('📥 Fetching all departments...');
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
  
  getById: (id) => {
    console.log(`📥 Fetching department with ID: ${id}`);
    return api.get(`/departments/${id}/`)
      .then(response => {
        console.log('✅ Department retrieved:', response.data);
        return response;
      })
      .catch(error => {
        console.error(`❌ Failed to fetch department ${id}`);
        throw error;
      });
  },
  
  create: (departmentData) => {
    console.log('📤 Creating new department with data:', departmentData);
    console.log('🔍 Data type:', typeof departmentData);
    console.log('🔍 Data keys:', Object.keys(departmentData));
    
    return api.post('/departments/', departmentData)
      .then(response => {
        console.log('✅ Department created successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error('❌ Failed to create department');
        console.error('🔍 Request payload that failed:', departmentData);
        throw error;
      });
  },
  
  update: (id, departmentData) => {
    console.log(`🔄 Updating department ${id} with data:`, departmentData);
    return api.put(`/departments/${id}/`, departmentData)
      .then(response => {
        console.log('✅ Department updated successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error(`❌ Failed to update department ${id}`);
        throw error;
      });
  },
  
  patch: (id, departmentData) => {
    console.log(`🔄 Partially updating department ${id} with data:`, departmentData);
    return api.patch(`/departments/${id}/`, departmentData)
      .then(response => {
        console.log('✅ Department patched successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error(`❌ Failed to patch department ${id}`);
        throw error;
      });
  },
  
  delete: (id) => {
    console.log(`🗑️ Deleting department with ID: ${id}`);
    return api.delete(`/departments/${id}/`)
      .then(response => {
        console.log('✅ Department deleted successfully');
        return response;
      })
      .catch(error => {
        console.error(`❌ Failed to delete department ${id}`);
        throw error;
      });
  },
};

export default departmentService;