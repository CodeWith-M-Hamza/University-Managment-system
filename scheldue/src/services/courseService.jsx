// import api from "../Api";

// const CourseService = {
//   getAll: () => api.get("courses/"),
//   getById: (id) => api.get(`courses/${id}/`),
//   create: (data) => api.post("courses/", data),
//   update: (id, data) => api.put(`courses/${id}/`, data),
//   patch: (id, data) => api.patch(`courses/${id}/`, data),
//   delete: (id) => api.delete(`courses/${id}/`),
// };

// export default CourseService;



import api from "../Api";

const CourseService = {
  getAll: () => {
    console.log('📥 Fetching all courses...');
    return api.get('/courses/')
      .then(response => {
        console.log(`✅ Retrieved ${response.data?.length || 0} courses`);
        return response;
      })
      .catch(error => {
        console.error('❌ Failed to fetch courses');
        throw error;
      });
  },
  
  getById: (id) => {
    console.log(`📥 Fetching course with ID: ${id}`);
    return api.get(`/courses/${id}/`)
      .then(response => {
        console.log('✅ Course retrieved:', response.data);
        return response;
      })
      .catch(error => {
        console.error(`❌ Failed to fetch course ${id}`);
        throw error;
      });
  },
  
  create: (courseData) => {
    console.log('📤 Creating new course with data:', courseData);
    console.log('🔍 Data type:', typeof courseData);
    console.log('🔍 Data keys:', Object.keys(courseData));
    console.log('🔍 Stringified data:', JSON.stringify(courseData, null, 2));
    
    return api.post('/courses/', courseData)
      .then(response => {
        console.log('✅ Course created successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error('❌ Failed to create course');
        console.error('🔍 Request payload that failed:', courseData);
        console.error('🔍 Error details:', error.response?.data);
        throw error;
      });
  },
  
  update: (id, courseData) => {
    console.log(`🔄 Updating course ${id} with data:`, courseData);
    return api.put(`/courses/${id}/`, courseData)
      .then(response => {
        console.log('✅ Course updated successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error(`❌ Failed to update course ${id}`);
        console.error('🔍 Error details:', error.response?.data);
        throw error;
      });
  },
  
  patch: (id, courseData) => {
    console.log(`🔄 Partially updating course ${id} with data:`, courseData);
    return api.patch(`/courses/${id}/`, courseData)
      .then(response => {
        console.log('✅ Course patched successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error(`❌ Failed to patch course ${id}`);
        console.error('🔍 Error details:', error.response?.data);
        throw error;
      });
  },
  
  delete: (id) => {
    console.log(`🗑️ Deleting course with ID: ${id}`);
    return api.delete(`/courses/${id}/`)
      .then(response => {
        console.log('✅ Course deleted successfully');
        return response;
      })
      .catch(error => {
        console.error(`❌ Failed to delete course ${id}`);
        throw error;
      });
  },
};

export default CourseService;