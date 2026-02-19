// src/services/teacherAssignmentAPI.js
import api from '../Api';

export const teacherAssignmentAPI = {
  getAll: (expand = null) => {
    const config = {};
    if (expand) {
      config.params = { expand };
    }
    return api.get('/teacher-assignments/', config);
  },
  
  getById: (id, expand = null) => {
    const config = {};
    if (expand) {
      config.params = { expand };
    }
    return api.get(`/teacher-assignments/${id}/`, config);
  },
  
  create: (data) => {
    console.log('📤 Creating teacher assignment:', data);
    return api.post('/teacher-assignments/', data);
  },
  
  update: (id, data) => {
    console.log(`🔄 Updating teacher assignment ${id}:`, data);
    return api.put(`/teacher-assignments/${id}/`, data);
  },
  
  delete: (id) => {
    console.log(`🗑️ Deleting teacher assignment ${id}`);
    return api.delete(`/teacher-assignments/${id}/`);
  },
  
  getByTeacher: (teacherId, expand = null) => {
    const config = {};
    if (expand) {
      config.params = { expand };
    }
    return api.get(`/teachers/${teacherId}/assignments/`, config);
  },

  // New method to get assignments with all related data expanded
  getAllWithDetails: () => {
    const expandParams = 'teacher,course,class_section,academic_session';
    return api.get('/teacher-assignments/', {
      params: { expand: expandParams }
    });
  },

  // Method to get assignments by course
  getByCourse: (courseId, expand = null) => {
    const config = {};
    if (expand) {
      config.params = { expand };
    }
    return api.get(`/courses/${courseId}/assignments/`, config);
  },

  // Method to get assignments by section
  getBySection: (sectionId, expand = null) => {
    const config = {};
    if (expand) {
      config.params = { expand };
    }
    return api.get(`/class-sections/${sectionId}/assignments/`, config);
  },

  // Method to get assignments by session
  getBySession: (sessionId, expand = null) => {
    const config = {};
    if (expand) {
      config.params = { expand };
    }
    return api.get(`/sessions/${sessionId}/assignments/`, config);
  },

  // Bulk operations
  createBulk: (assignments) => {
    console.log('📤 Creating bulk assignments:', assignments);
    return api.post('/teacher-assignments/bulk/', assignments);
  },

  // Check for conflicts
  checkConflicts: (assignmentData) => {
    return api.post('/teacher-assignments/check-conflicts/', assignmentData);
  }
};