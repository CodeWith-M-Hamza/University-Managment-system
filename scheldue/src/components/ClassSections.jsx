// src/components/ClassSections.jsx
import React, { useState, useEffect } from 'react';
import classSectionAPI from '../services/classSectionAPI';
import departmentService from '../services/departmentService';
import {academicSessionAPI} from '../services/academicSessionAPI';
import { Users, Plus, Edit, Trash2, Building, Calendar } from 'lucide-react';
import FileImportUploader from './FileImportUploader';

const ClassSections = () => {
  const [sections, setSections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState("add"); // "add" or "import"

  const [formData, setFormData] = useState({
    name: '',
    section_code: 'A',
    department: '',
    academic_session: '',
    total_students: 0,
    semester: 1,
    year: 1
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setDataLoading(true);
      setError('');
      
      const [sectionsRes, departmentsRes, sessionsRes] = await Promise.all([
        classSectionAPI.getAllSections(),
        departmentService.getAll(),
        academicSessionAPI.getAll()
      ]);

      console.log('📊 Sections API response:', sectionsRes);
      console.log('📊 Departments API response:', departmentsRes);
      console.log('📊 Sessions API response:', sessionsRes);

      // Handle different response structures
      let sectionsData = [];
      if (Array.isArray(sectionsRes)) {
        sectionsData = sectionsRes;
      } else if (sectionsRes && Array.isArray(sectionsRes.data)) {
        sectionsData = sectionsRes.data;
      } else if (sectionsRes && sectionsRes.data) {
        sectionsData = sectionsRes.data;
      }

      let sessionsData = [];
      if (Array.isArray(sessionsRes)) {
        sessionsData = sessionsRes;
      } else if (sessionsRes && Array.isArray(sessionsRes.data)) {
        sessionsData = sessionsRes.data;
      } else if (sessionsRes && sessionsRes.data) {
        sessionsData = sessionsRes.data;
      }

      setSections(sectionsData || []);
      setDepartments(departmentsRes.data || []);
      setSessions(sessionsData || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please check your connection.');
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess('');

  try {
    // Validate required fields
    if (!formData.name || !formData.department || !formData.academic_session) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // ✅ Now send names directly - no ID transformation needed!
    const apiData = {
      name: formData.name.trim(),
      section_code: formData.section_code,
      department: formData.department,        // Send department name directly
      academic_session: formData.academic_session, // Send session name directly
      total_students: parseInt(formData.total_students) || 0,
      semester: parseInt(formData.semester) || 1,
      year: parseInt(formData.year) || 1
    };

    console.log('📤 Saving section with data:', apiData);

    if (editingSection) {
      await classSectionAPI.updateSection(editingSection.id, apiData);
      setSuccess('Section updated successfully!');
    } else {
      await classSectionAPI.createSection(apiData);
      setSuccess('Section created successfully!');
    }

    setShowForm(false);
    setEditingSection(null);
    resetForm();
    await loadAllData();
    
  } catch (error) {
    console.error('❌ Error creating section:', error.response?.data);
    if (error.response?.data) {
      const errorData = error.response.data;
      let errorMessage = 'Failed to save section: ';
      for (const [field, messages] of Object.entries(errorData)) {
        errorMessage += `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}. `;
      }
      setError(errorMessage);
    } else {
      setError('Error saving class section');
    }
  } finally {
    setLoading(false);
  }
};

  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData({
      name: section.name || '',
      section_code: section.section_code || 'A',
      department: section.department?.id || section.department || '',
      academic_session: section.academic_session?.id || section.academic_session || '',
      total_students: section.total_students || 0,
      semester: section.semester || 1,
      year: section.year || 1
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this section? This will also delete related student records.')) {
      try {
        await classSectionAPI.deleteSection(id);
        setSuccess('Section deleted successfully!');
        loadAllData();
      } catch (error) {
        console.error('Error deleting section:', error);
        setError('Error deleting class section');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      section_code: 'A',
      department: '',
      academic_session: '',
      total_students: 0,
      semester: 1,
      year: 1
    });
  };

  // Helper function to get display names
  const getDepartmentDisplay = (section) => {
    if (!section) return { name: 'No Department', code: '' };
    
    // If we have direct department object
    if (section.department && typeof section.department === 'object') {
      return { 
        name: section.department.name || 'No Name', 
        code: section.department.code || '' 
      };
    }
    
    // If we have department_name and department_code from serializer
    if (section.department_name) {
      return { 
        name: section.department_name, 
        code: section.department_code || '' 
      };
    }
    
    // Fallback: find department from loaded departments
    const departmentId = section.department;
    const dept = departments.find(d => d.id === departmentId);
    if (dept) {
      return { 
        name: dept.name, 
        code: dept.code 
      };
    }
    
    return { name: 'No Department', code: '' };
  };

  const getSessionDisplay = (section) => {
    if (!section) return { name: 'No Session', type: '' };
    
    // If we have direct academic_session object
    if (section.academic_session && typeof section.academic_session === 'object') {
      return { 
        name: section.academic_session.name || 'No Name', 
        type: section.academic_session.session_type || '' 
      };
    }
    
    // If we have academic_session_name and academic_session_type from serializer
    if (section.academic_session_name) {
      return { 
        name: section.academic_session_name, 
        type: section.academic_session_type || '' 
      };
    }
    
    // Fallback: find session from loaded sessions
    const sessionId = section.academic_session;
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      return { 
        name: session.name, 
        type: session.session_type 
      };
    }
    
    return { name: 'No Session', type: '' };
  };

  const sectionCodes = ['A', 'B', 'C', 'D'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const years = [1, 2, 3, 4, 5];

  if (dataLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-green-500 p-3 rounded-xl">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Class Sections</h1>
              <p className="text-gray-600">Manage class sections and student groups</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-green-700 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5" />
            <span>New Section</span>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-red-400 mr-3">⚠️</div>
                <div>
                  <p className="text-red-700 font-medium">Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                ×
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="text-green-400 mr-3">✅</div>
              <div>
                <p className="text-green-700 font-medium">Success</p>
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sections</p>
                <p className="text-3xl font-bold text-gray-800">{sections.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-800">
                  {sections.reduce((total, section) => total + (section.total_students || 0), 0)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-3xl font-bold text-gray-800">{departments.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sessions</p>
                <p className="text-3xl font-bold text-gray-800">{sessions.length}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Sections Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : sections.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No class sections found</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first class section.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create First Section
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => {
              const departmentInfo = getDepartmentDisplay(section);
              const sessionInfo = getSessionDisplay(section);
              
              return (
                <div key={section.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                        {section.name || 'Unnamed Section'}
                      </h3>
                      <p className="text-sm text-gray-600">Section {section.section_code || 'N/A'}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {section.total_students || 0} Students
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="h-4 w-4 mr-2 text-purple-500" />
                      <span>
                        {departmentInfo.name}
                        {departmentInfo.code && ` (${departmentInfo.code})`}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                      <span>
                        {sessionInfo.name}
                        {sessionInfo.type && ` (${sessionInfo.type})`}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Year:</span>
                      <span className="font-medium">Year {section.year || 1}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Semester:</span>
                      <span className="font-medium">Sem {section.semester || 1}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(section)}
                      className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(section.id)}
                      className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingSection ? 'Edit Section' : 'Create New Section'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingSection(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Tabs */}
                {!editingSection && (
                  <div className="flex gap-2 mb-6 border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab("add")}
                      className={`px-4 py-2 font-medium text-sm transition-colors ${
                        activeTab === "add"
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      ➕ One by One
                    </button>
                    <button
                      onClick={() => setActiveTab("import")}
                      className={`px-4 py-2 font-medium text-sm transition-colors ${
                        activeTab === "import"
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      📤 Import File
                    </button>
                  </div>
                )}

                {/* Add One by One Tab */}
                {activeTab === "add" && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Section Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="e.g., CS-3A, EE-2B"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Section Code *
                      </label>
                      <select
                        value={formData.section_code}
                        onChange={(e) => setFormData({...formData, section_code: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                      >
                        {sectionCodes.map(code => (
                          <option key={code} value={code}>Section {code}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department *
                      </label>
                      <select
                        required
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                      >
                        <option value="">Select a department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.name}>
                            {dept.name} ({dept.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Academic Session *
                      </label>
                      <select
                        required
                        value={formData.academic_session}
                        onChange={(e) => setFormData({...formData, academic_session: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                      >
                        <option value="">Select an academic session</option>
                        {sessions.map(session => (
                          <option key={session.id} value={session.name}>
                            {session.name} ({session.session_type})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year *
                      </label>
                      <select
                        required
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                      >
                        {years.map(year => (
                          <option key={year} value={year}>Year {year}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Semester *
                      </label>
                      <select
                        required
                        value={formData.semester}
                        onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                      >
                        {semesters.map(sem => (
                          <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Students
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.total_students}
                        onChange={(e) => setFormData({...formData, total_students: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white py-4 px-6 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors font-semibold flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          {editingSection ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        editingSection ? 'Update Section' : 'Create Section'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingSection(null);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
                )}

                {/* Import from File Tab */}
                {activeTab === "import" && (
                  <FileImportUploader
                    importType="sections"
                    description="Upload an Excel, CSV, or Word file with section data. Required columns: name, section_code, department, academic_session, total_students, semester, year"
                    onImportComplete={() => {
                      // Refresh sections and close modal
                      setTimeout(() => {
                        loadAllData();
                        setShowForm(false);
                        setActiveTab("add");
                      }, 1000);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassSections;