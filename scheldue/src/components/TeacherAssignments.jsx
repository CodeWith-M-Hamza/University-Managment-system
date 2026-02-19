
// src/components/TeacherAssignments.jsx
import React, { useState, useEffect } from 'react';
import { teacherAssignmentAPI } from '../services/teacherAssignmentAPI';
import teacherService from '../services/teacherService';
import courseService from '../services/courseService';
import classSectionAPI from '../services/classSectionAPI';
import { academicSessionAPI } from '../services/academicSessionAPI';
import { 
  UserCheck, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Users, 
  BookOpen, 
  Calendar, 
  Loader, 
  AlertCircle,
  Download,
  Shield,
  GraduationCap,
  Building,
  RefreshCw,
  X
} from 'lucide-react';

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const [formData, setFormData] = useState({
    teacher: '',
    course: '',
    class_section: '',
    academic_session: '',
    is_responsible_teacher: false
  });

  useEffect(() => {
    loadAllData();
  }, []);
  // /////////////////////////////////////////////////////////////////
  // Temporary debug - add this inside your component
useEffect(() => {
  if (teachers.length > 0) {
    console.log('👥 ALL TEACHERS DATA:', teachers);
    console.log('📋 Teachers structure sample:', teachers[0]);
    console.log('🆔 Available teacher IDs:', teachers.map(t => t.id));
    console.log('👤 Teacher names:', teachers.map(t => ({
      id: t.id,
      name: t.user?.first_name + ' ' + t.user?.last_name,
      department: t.department?.name || t.department_name
    })));
  }
}, [teachers]);

  ///////////////////////////////////////////////////////////////////

  const loadAllData = async () => {
    try {
      setDataLoading(true);
      setError('');
      
      console.log('🔄 Loading all data...');
      
      const [
        assignmentsRes, 
        teachersRes, 
        coursesRes, 
        sectionsRes, 
        sessionsRes
      ] = await Promise.all([
        teacherAssignmentAPI.getAllWithDetails().catch(err => {
          console.error('❌ Assignments API error:', err);
          return { data: [] };
        }),
        teacherService.getAllWithUser().catch(err => {
          console.error('❌ Teachers API error:', err);
          // Fallback to regular getAll if getAllWithUser fails
          return teacherService.getAll().catch(err2 => {
            console.error('❌ Teachers API fallback error:', err2);
            return { data: [] };
          });
        }),
        courseService.getAll().catch(err => {
          console.error('❌ Courses API error:', err);
          return { data: [] };
        }),
        classSectionAPI.getAllSections().catch(err => {
          console.error('❌ Sections API error:', err);
          return { data: [] };
        }),
        academicSessionAPI.getAll().catch(err => {
          console.error('❌ Sessions API error:', err);
          return { data: [] };
        })
      ]);

      // Handle different response structures - IMPORTANT FIX
      const assignmentsData = Array.isArray(assignmentsRes?.data) ? assignmentsRes.data : 
                            Array.isArray(assignmentsRes) ? assignmentsRes : [];
      
      const teachersData = Array.isArray(teachersRes?.data) ? teachersRes.data : 
                          Array.isArray(teachersRes) ? teachersRes : [];
      
      const coursesData = Array.isArray(coursesRes?.data) ? coursesRes.data : 
                         Array.isArray(coursesRes) ? coursesRes : [];
      
      const sectionsData = Array.isArray(sectionsRes?.data) ? sectionsRes.data : 
                          Array.isArray(sectionsRes) ? sectionsRes : [];
      
      const sessionsData = Array.isArray(sessionsRes?.data) ? sessionsRes.data : 
                          Array.isArray(sessionsRes) ? sessionsRes : [];

      console.log('✅ Data loaded successfully:', {
        assignments: assignmentsData.length,
        teachers: teachersData.length,
        courses: coursesData.length,
        sections: sectionsData.length,
        sessions: sessionsData.length
      });

      // Debug: Check the structure of first items
      if (assignmentsData.length > 0) {
        console.log('🔍 First assignment structure:', assignmentsData[0]);
        console.log('🔍 Assignment teacher:', assignmentsData[0].teacher);
        console.log('🔍 Assignment course:', assignmentsData[0].course);
        console.log('🔍 Assignment section:', assignmentsData[0].class_section);
        console.log('🔍 Assignment session:', assignmentsData[0].academic_session);
      }

      if (teachersData.length > 0) {
        console.log('🔍 First teacher structure:', teachersData[0]);
        console.log('🔍 Teacher ALL fields:', JSON.stringify(teachersData[0], null, 2));
        console.log('🔍 Teacher keys:', Object.keys(teachersData[0]));
      }

      if (coursesData.length > 0) {
        console.log('🔍 First course structure:', coursesData[0]);
      }

      // IMPORTANT: Only set data if we have it
      console.log('📊 Setting data to state...');
      if (assignmentsData.length === 0) {
        console.warn('⚠️ No assignments data returned from API');
      }
      if (teachersData.length === 0) {
        console.warn('⚠️ No teachers data returned from API');
      }
      if (coursesData.length === 0) {
        console.warn('⚠️ No courses data returned from API');
      }
      if (sectionsData.length === 0) {
        console.warn('⚠️ No sections data returned from API');
      }
      if (sessionsData.length === 0) {
        console.warn('⚠️ No sessions data returned from API');
      }

      setAssignments(assignmentsData);
      setTeachers(teachersData);
      setCourses(coursesData);
      setSections(sectionsData);
      setSessions(sessionsData);
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      
      if (retryCount < 3) {
        setError(`Failed to load data. Retrying... (${retryCount + 1}/3)`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadAllData();
        }, 2000);
      } else {
        setError('Failed to load data. Please refresh the page or check your connection.');
      }
    } finally {
      setDataLoading(false);
    }
  };

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const response = await teacherAssignmentAPI.getAllWithDetails();
      const assignmentsData = Array.isArray(response?.data) ? response.data : 
                            Array.isArray(response) ? response : [];
      console.log('✅ Assignments loaded:', assignmentsData);
      setAssignments(assignmentsData);
      setError('');
    } catch (error) {
      console.error('❌ Error loading assignments:', error);
      setError('Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get teacher name by ID or object
  const getTeacherName = (teacherData) => {
    if (!teacherData) return 'Unknown Teacher';
    
    // If it's an object, extract the name
    if (typeof teacherData === 'object') {
      if (teacherData.user?.first_name || teacherData.user?.last_name) {
        const firstName = teacherData.user.first_name || '';
        const lastName = teacherData.user.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        if (fullName) return fullName;
      }
      if (teacherData.first_name || teacherData.last_name) {
        const firstName = teacherData.first_name || '';
        const lastName = teacherData.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        if (fullName) return fullName;
      }
      if (teacherData.username) return teacherData.username;
      if (teacherData.email) return teacherData.email;
    }
    
    // If it's just an ID, look up the teacher
    if (typeof teacherData === 'string' || typeof teacherData === 'number') {
      const teacher = teachers.find(t => t.id?.toString() === teacherData?.toString());
      if (teacher) return getTeacherName(teacher);
      return `Teacher #${teacherData}`;
    }
    
    return 'Unknown Teacher';
  };

const getTeacherDisplay = (teacher) => {
  console.log('🔍 getTeacherDisplay input:', teacher);
  
  if (!teacher) {
    return { name: 'No Teacher Assigned', department: 'No Department' };
  }
  
  // If it's just an ID (string or number), find the teacher object
  if (typeof teacher === 'string' || typeof teacher === 'number') {
    const teacherId = teacher.toString();
    console.log('🔍 Looking for teacher with ID:', teacherId);
    
    const foundTeacher = teachers.find(t => {
      return t.id?.toString() === teacherId;
    });
    
    if (foundTeacher) {
      console.log('✅ Found teacher:', foundTeacher);
      return getTeacherDisplay(foundTeacher);
    }
    
    console.log('❌ Teacher not found with ID:', teacherId);
    return { name: `Teacher ${teacher}`, department: 'Unknown' };
  }
  
  // Handle complete teacher object
  const name = getTeacherName(teacher);
  
  // Extract department
  let department = 'No Department';
  if (teacher.department?.name) {
    department = teacher.department.name;
  } else if (teacher.department_name) {
    department = teacher.department_name;
  } else if (typeof teacher.department === 'string') {
    department = teacher.department;
  }
  
  console.log('✅ Final teacher display:', { name, department });
  return { name, department };
};

  const getCourseDisplay = (course) => {
    console.log('🔍 getCourseDisplay input:', course);
    
    if (!course) {
      return { name: 'No Course', code: 'N/A', department: 'No Department', type: 'Theory', credits: 'N/A' };
    }
    
    // If it's just an ID, find the course object
    if (typeof course === 'string' || typeof course === 'number') {
      const courseId = course.toString();
      console.log('🔍 Looking for course with ID:', courseId);
      
      const foundCourse = courses.find(c => {
        const possibleIds = [
          c.id?.toString(),
          c._id?.toString()
        ].filter(Boolean);
        
        return possibleIds.includes(courseId);
      });
      
      if (foundCourse) {
        console.log('✅ Found course:', foundCourse);
        return getCourseDisplay(foundCourse);
      }
      
      console.log('❌ Course not found with ID:', courseId);
      return { name: `Course ${course}`, code: 'N/A', department: 'Unknown', type: 'Theory', credits: 'N/A' };
    }
    
    // Handle complete course object
    return {
      name: course.name || course.course_name || 'Unknown Course',
      code: course.code || course.course_code || 'N/A',
      department: course.department?.name || course.department || 'No Department',
      credits: course.credit_hours || course.credits || 'N/A',
      type: course.course_type || course.type || 'Theory'
    };
  };

  const getSectionDisplay = (section) => {
    console.log('🔍 getSectionDisplay input:', section);
    
    if (!section) {
      return { name: 'No Section', semester: 'N/A', department: 'No Department', strength: 0 };
    }
    
    // If it's just an ID, find the section object
    if (typeof section === 'string' || typeof section === 'number') {
      const sectionId = section.toString();
      console.log('🔍 Looking for section with ID:', sectionId);
      
      const foundSection = sections.find(s => {
        const possibleIds = [
          s.id?.toString(),
          s._id?.toString()
        ].filter(Boolean);
        
        return possibleIds.includes(sectionId);
      });
      
      if (foundSection) {
        console.log('✅ Found section:', foundSection);
        return getSectionDisplay(foundSection);
      }
      
      console.log('❌ Section not found with ID:', sectionId);
      return { name: `Section ${section}`, semester: 'N/A', department: 'Unknown', strength: 0 };
    }
    
    // Handle complete section object
    return {
      name: section.name || section.section_name || `Section ${section.id || section._id}`,
      semester: section.semester || section.semester_number || 'N/A',
      department: section.department?.name || section.department || 'No Department',
      strength: section.total_students || section.strength || 0
    };
  };

  const getSessionDisplay = (session) => {
    console.log('🔍 getSessionDisplay input:', session);
    
    if (!session) {
      return { name: 'No Session', type: 'Regular', status: 'Unknown' };
    }
    
    // If it's just an ID, find the session object
    if (typeof session === 'string' || typeof session === 'number') {
      const sessionId = session.toString();
      console.log('🔍 Looking for session with ID:', sessionId);
      
      const foundSession = sessions.find(s => {
        const possibleIds = [
          s.id?.toString(),
          s._id?.toString()
        ].filter(Boolean);
        
        return possibleIds.includes(sessionId);
      });
      
      if (foundSession) {
        console.log('✅ Found session:', foundSession);
        return getSessionDisplay(foundSession);
      }
      
      console.log('❌ Session not found with ID:', sessionId);
      return { name: `Session ${session}`, type: 'Regular', status: 'Unknown' };
    }
    
    // Handle complete session object
    const now = new Date();
    const startDate = session.start_date ? new Date(session.start_date) : null;
    const endDate = session.end_date ? new Date(session.end_date) : null;
    
    let status = 'Unknown';
    if (startDate && endDate) {
      if (now < startDate) status = 'Upcoming';
      else if (now > endDate) status = 'Completed';
      else status = 'Active';
    }
    
    if (session.is_active === false) {
      status = 'Inactive';
    }
    
    return {
      name: session.name || session.session_name || `Session ${session.id || session._id}`,
      type: session.session_type || session.type || 'Regular',
      status: status
    };
  };

  // Get assignment details for display
  const getAssignmentDetails = (assignment) => {
    console.log('🎯 Getting details for assignment:', assignment);
    
    if (!assignment) {
      console.warn('⚠️ Assignment is null/undefined');
      return {
        teacher: { name: 'Unknown', department: 'Unknown' },
        course: { name: 'Unknown', code: 'N/A', type: 'Theory', credits: 'N/A', department: 'Unknown' },
        section: { name: 'Unknown', semester: 'N/A', department: 'Unknown', strength: 0 },
        session: { name: 'Unknown', type: 'Regular', status: 'Unknown' },
        isResponsible: false,
        assignmentDate: null,
        id: null
      };
    }
    
    try {
      const teacher = getTeacherDisplay(assignment.teacher);
      const course = getCourseDisplay(assignment.course);
      const section = getSectionDisplay(assignment.class_section);
      const session = getSessionDisplay(assignment.academic_session);
      
      const details = {
        teacher,
        course,
        section,
        session,
        isResponsible: assignment.is_responsible_teacher || false,
        assignmentDate: assignment.assignment_date,
        id: assignment.id || assignment._id
      };
      
      console.log('✅ Assignment details resolved:', details);
      return details;
    } catch (err) {
      console.error('❌ Error getting assignment details:', err);
      return {
        teacher: { name: 'Error', department: 'Error' },
        course: { name: 'Error Loading', code: 'N/A', type: 'Theory', credits: 'N/A', department: 'Error' },
        section: { name: 'Error', semester: 'N/A', department: 'Error', strength: 0 },
        session: { name: 'Error', type: 'Regular', status: 'Error' },
        isResponsible: false,
        assignmentDate: null,
        id: assignment.id || assignment._id
      };
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = [];
    
    if (!formData.teacher) errors.push('Teacher');
    if (!formData.course) errors.push('Course');
    if (!formData.class_section) errors.push('Class Section');
    if (!formData.academic_session) errors.push('Academic Session');
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Validate all fields
      const missingFields = validateForm();
      if (missingFields.length > 0) {
        setError(`Please select: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      console.log('📤 Submitting form data:', formData);

      let response;
      if (editingAssignment) {
        response = await teacherAssignmentAPI.update(editingAssignment.id || editingAssignment._id, formData);
        setSuccess('Assignment updated successfully!');
      } else {
        response = await teacherAssignmentAPI.create(formData);
        setSuccess('Assignment created successfully!');
      }

      console.log('✅ API Response:', response);
      
      setShowForm(false);
      setEditingAssignment(null);
      resetForm();
      await loadAssignments();
      
    } catch (error) {
      console.error('❌ Error saving assignment:', error);
      
      let errorMessage = 'Error saving teacher assignment';
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          const errors = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          errorMessage = errors;
        } else {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assignment) => {
    console.log('✏️ Editing assignment:', assignment);
    
    // Extract IDs from assignment object - handle both object and ID cases
    const getAssignmentId = (field) => {
      if (!field) return '';
      if (typeof field === 'object') {
        return field.id?.toString() || field._id?.toString() || '';
      }
      return field.toString();
    };

    setEditingAssignment(assignment);
    setFormData({
      teacher: getAssignmentId(assignment.teacher),
      course: getAssignmentId(assignment.course),
      class_section: getAssignmentId(assignment.class_section),
      academic_session: getAssignmentId(assignment.academic_session),
      is_responsible_teacher: assignment.is_responsible_teacher || false
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await teacherAssignmentAPI.delete(id);
      await loadAssignments();
      setSuccess('Assignment deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting assignment:', error);
      setError('Error deleting teacher assignment');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      teacher: '',
      course: '',
      class_section: '',
      academic_session: '',
      is_responsible_teacher: false
    });
    setEditingAssignment(null);
    setError('');
    setSuccess('');
  };

  // Filter assignments based on search term and filters
  const filteredAssignments = assignments.filter(assignment => {
    try {
      const details = getAssignmentDetails(assignment);
      
      // Skip if critical details are missing
      if (!details.teacher?.name || !details.course?.name) {
        console.warn('⚠️ Skipping assignment with missing details:', assignment);
        return false;
      }
      
      const searchText = searchTerm.toLowerCase();
      
      const matchesSearch = 
        !searchText || 
        details.teacher.name.toLowerCase().includes(searchText) ||
        details.course.name.toLowerCase().includes(searchText) ||
        details.course.code.toLowerCase().includes(searchText) ||
        details.section.name.toLowerCase().includes(searchText) ||
        details.session.name.toLowerCase().includes(searchText);
      
      const matchesRole = 
        filterRole === 'all' || 
        (filterRole === 'responsible' && details.isResponsible) ||
        (filterRole === 'course' && !details.isResponsible);
      
      const matchesDepartment = 
        filterDepartment === 'all' || 
        details.teacher.department.toLowerCase().includes(filterDepartment.toLowerCase()) ||
        details.course.department.toLowerCase().includes(filterDepartment.toLowerCase()) ||
        details.section.department.toLowerCase().includes(filterDepartment.toLowerCase());
      
      const passes = matchesSearch && matchesRole && matchesDepartment;
      if (passes) {
        console.log('✅ Assignment passes filters:', details.course.name);
      }
      return passes;
    } catch (err) {
      console.error('❌ Error filtering assignment:', err, assignment);
      return false;
    }
  });

  console.log('📊 Filtered assignments count:', filteredAssignments.length, 'out of', assignments.length);

  // Get unique departments for filter
  const departments = [...new Set([
    ...teachers.map(t => {
      const teacherDisplay = getTeacherDisplay(t);
      return teacherDisplay.department;
    }).filter(Boolean),
    ...courses.map(c => {
      const courseDisplay = getCourseDisplay(c);
      return courseDisplay.department;
    }).filter(Boolean),
    ...sections.map(s => {
      const sectionDisplay = getSectionDisplay(s);
      return sectionDisplay.department;
    }).filter(Boolean)
  ])].filter(dept => dept !== 'No Department' && dept !== 'Unknown');

  // Statistics
  const stats = {
    total: assignments.length,
    responsible: assignments.filter(a => a.is_responsible_teacher).length,
    course: assignments.filter(a => !a.is_responsible_teacher).length,
    departments: departments.length
  };

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading teacher assignments...</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500 mt-2">Retry attempt: {retryCount}/3</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Teacher Assignments</h1>
                <p className="text-gray-600 mt-1">Manage course assignments and teaching responsibilities</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={loadAllData}
                disabled={loading}
                className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Reload Data</span>
              </button>
              <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span className="font-semibold">New Assignment</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 animate-in fade-in duration-300">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-600 transition-colors ml-4"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 animate-in fade-in duration-300">
            <div className="flex items-start">
              <UserCheck className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-green-700 font-medium">Success</p>
                <p className="text-green-600 text-sm mt-1">{success}</p>
              </div>
              <button
                onClick={() => setSuccess('')}
                className="text-green-400 hover:text-green-600 transition-colors ml-4"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Course Coordinators</p>
                <p className="text-3xl font-bold text-gray-900">{stats.responsible}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Course Teachers</p>
                <p className="text-3xl font-bold text-gray-900">{stats.course}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.departments}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Building className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assignments by teacher, course, section, or session..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white min-w-[150px]"
                >
                  <option value="all">All Roles</option>
                  <option value="responsible">Coordinators</option>
                  <option value="course">Teachers</option>
                </select>
              </div>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white min-w-[150px]"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Info - Remove this section after fixing */}
        {assignments.length === 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ No Assignments Loaded</h3>
            <p className="text-red-700 mb-3">The API returned no assignment data. Possible issues:</p>
            <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
              <li>Backend server might not be running</li>
              <li>API endpoint might have wrong expand parameters</li>
              <li>Database might be empty</li>
              <li>Check the browser console for detailed API errors</li>
            </ul>
            <button
              onClick={() => loadAllData()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              🔄 Retry Loading Data
            </button>
          </div>
        )}
        
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="font-medium">Assignments:</span> {assignments.length}
            </div>
            <div>
              <span className="font-medium">Teachers:</span> {teachers.length}
            </div>
            <div>
              <span className="font-medium">Courses:</span> {courses.length}
            </div>
            <div>
              <span className="font-medium">Sections:</span> {sections.length}
            </div>
            <div>
              <span className="font-medium">Sessions:</span> {sessions.length}
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            <p><strong>Filtered:</strong> {filteredAssignments.length} assignments matching current filters</p>
          </div>
        </div>

        {/* Assignments Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-3 text-gray-600">Loading assignments...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAssignments.map((assignment) => {
                const details = getAssignmentDetails(assignment);
                
                return (
                  <div 
                    key={details.id} 
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-purple-200 transition-all duration-300 group"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                            {details.course.name}
                          </h3>
                          <p className="text-sm text-gray-600 font-medium">{details.course.code}</p>
                        </div>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
                          <button
                            onClick={() => handleEdit(assignment)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit assignment"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(details.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete assignment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Teacher Info */}
                      <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-sm">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {details.teacher.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {details.teacher.department}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                          details.isResponsible 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                        }`}>
                          {details.isResponsible ? 'Coordinator' : 'Teacher'}
                        </span>
                      </div>

                      {/* Details Grid */}
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <BookOpen className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="font-medium capitalize">{details.course.type.toLowerCase()}</span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span>{details.course.credits} credits</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <GraduationCap className="h-4 w-4 mr-3 text-green-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="font-medium">{details.section.name}</span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span>Sem {details.section.semester}</span>
                            {details.section.strength > 0 && (
                              <>
                                <span className="mx-2 text-gray-300">•</span>
                                <span>{details.section.strength} students</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-3 text-orange-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="font-medium">{details.session.name}</span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className={`capitalize font-medium ${
                              details.session.status === 'Active' ? 'text-green-600' : 
                              details.session.status === 'Upcoming' ? 'text-blue-600' : 
                              details.session.status === 'Completed' ? 'text-gray-600' : 'text-orange-600'
                            }`}>
                              {details.session.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <Building className="h-4 w-4 mr-3 text-purple-500 flex-shrink-0" />
                          <span className="truncate">{details.course.department}</span>
                        </div>
                      </div>

                      {/* Assignment Date */}
                      {details.assignmentDate && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Assigned on: {new Date(details.assignmentDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredAssignments.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
                <UserCheck className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchTerm || filterRole !== 'all' || filterDepartment !== 'all' 
                    ? 'No matching assignments found' 
                    : 'No assignments yet'
                  }
                </h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  {searchTerm || filterRole !== 'all' || filterDepartment !== 'all'
                    ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                    : 'Start by creating your first teacher assignment to organize course responsibilities.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {(searchTerm || filterRole !== 'all' || filterDepartment !== 'all') ? (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterRole('all');
                        setFilterDepartment('all');
                      }}
                      className="bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 transition-colors font-medium"
                    >
                      Clear All Filters
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowForm(true)}
                      className="bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 transition-colors font-medium flex items-center justify-center mx-auto"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create First Assignment
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {editingAssignment ? 'Update the teacher assignment details' : 'Assign a teacher to a course and section'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Teacher Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teacher *
                    </label>
                    <select
                      required
                      value={formData.teacher}
                      onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                    >
                      <option value="">Select a teacher</option>
                      {teachers.map(teacher => {
                        const teacherName = getTeacherName(teacher);
                        const departmentName = teacher.department_name || teacher.department?.name || 'No Department';
                        return (
                          <option 
                            key={teacher.id || teacher._id} 
                            value={teacher.id || teacher._id}
                          >
                            {teacherName} - {departmentName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  
                  {/* Course Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course *
                    </label>
                    <select
                      required
                      value={formData.course}
                      onChange={(e) => setFormData({...formData, course: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                    >
                      <option value="">Select a course</option>
                      {courses.map(course => {
                        const courseInfo = getCourseDisplay(course);
                        return (
                          <option 
                            key={course.id || course._id} 
                            value={course.id || course._id}
                          >
                            {courseInfo.name} ({courseInfo.code}) - {courseInfo.department}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Class Section Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class Section *
                    </label>
                    <select
                      required
                      value={formData.class_section}
                      onChange={(e) => setFormData({...formData, class_section: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                    >
                      <option value="">Select a class section</option>
                      {sections.map(section => {
                        const sectionInfo = getSectionDisplay(section);
                        return (
                          <option 
                            key={section.id || section._id} 
                            value={section.id || section._id}
                          >
                            {sectionInfo.name} (Sem {sectionInfo.semester}) - {sectionInfo.department}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Academic Session Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Academic Session *
                    </label>
                    <select
                      required
                      value={formData.academic_session}
                      onChange={(e) => setFormData({...formData, academic_session: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                    >
                      <option value="">Select an academic session</option>
                      {sessions.map(session => {
                        const sessionInfo = getSessionDisplay(session);
                        return (
                          <option 
                            key={session.id || session._id} 
                            value={session.id || session._id}
                          >
                            {sessionInfo.name} ({sessionInfo.type}) - {sessionInfo.status}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Role Selection */}
                <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      type="checkbox"
                      id="is_responsible_teacher"
                      checked={formData.is_responsible_teacher}
                      onChange={(e) => setFormData({...formData, is_responsible_teacher: e.target.checked})}
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="is_responsible_teacher" className="block text-sm font-medium text-gray-900">
                      Course Coordinator
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Designate this teacher as the course coordinator with additional responsibilities including 
                      grade management, student coordination, and academic oversight.
                    </p>
                  </div>
                  <Shield className="h-6 w-6 text-purple-500 flex-shrink-0" />
                </div>

                <div className="flex space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin mr-3" />
                        {editingAssignment ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingAssignment ? 'Update Assignment' : 'Create Assignment'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    disabled={loading}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignments;