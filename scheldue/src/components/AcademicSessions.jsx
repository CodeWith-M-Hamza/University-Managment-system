// src/components/AcademicSessions.jsx
import React, { useState, useEffect } from 'react';
import departmentService from '../services/departmentService';
import { academicSessionAPI } from '../services/academicSessionAPI';
import { Calendar, Plus, Edit, Trash2, Search, Filter, Loader, Sun, Moon, Building } from 'lucide-react';
import FileImportUploader from './FileImportUploader';

const AcademicSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState("add"); // "add" or "import"

  const [formData, setFormData] = useState({
    name: '',
    session_type: 'morning',
    start_date: '',
    end_date: '',
    is_active: false,
    department: ''
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sessionsData, departmentsData] = await Promise.all([
        academicSessionAPI.getAll(),
        departmentService.getAll()
      ]);
      
      console.log('📊 Sessions data:', sessionsData);
      console.log('📊 Departments data:', departmentsData);
      
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setDepartments(departmentsData.data || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please try again.');
      setSessions([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.name || !formData.start_date || !formData.end_date || !formData.department) {
        setError('Please fill in all required fields (Name, Start Date, End Date, Department)');
        setFormLoading(false);
        return;
      }

      // Validate dates
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate <= startDate) {
        setError('End date must be after start date');
        setFormLoading(false);
        return;
      }

      const apiData = {
        name: formData.name.trim(),
        session_type: formData.session_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
        department: formData.department // Send department ID
      };

      console.log('📤 Sending to API:', apiData);

      if (editingSession) {
        await academicSessionAPI.update(editingSession.id, apiData);
        setSuccess('Session updated successfully!');
      } else {
        await academicSessionAPI.create(apiData);
        setSuccess('Session created successfully!');
      }

      setShowForm(false);
      setEditingSession(null);
      resetForm();
      loadAllData();
    } catch (error) {
      console.error('Error saving session:', error);
      
      // Better error handling
      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = 'Failed to save session: ';
        
        // Handle field-specific errors
        for (const [field, messages] of Object.entries(errorData)) {
          if (Array.isArray(messages)) {
            errorMessage += `${field}: ${messages.join(', ')}. `;
          } else if (typeof messages === 'string') {
            errorMessage += `${field}: ${messages}. `;
          }
        }
        
        setError(errorMessage);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Failed to save session. Please check your data and try again.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setFormData({
      name: session.name || '',
      session_type: session.session_type || 'morning',
      start_date: session.start_date ? session.start_date.split('T')[0] : '',
      end_date: session.end_date ? session.end_date.split('T')[0] : '',
      is_active: session.is_active || false,
      department: session.department?.id || session.department || ''
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await academicSessionAPI.delete(id);
        setSuccess('Session deleted successfully!');
        loadAllData();
      } catch (error) {
        console.error('Error deleting session:', error);
        setError('Error deleting academic session');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      session_type: 'morning',
      start_date: '',
      end_date: '',
      is_active: false,
      department: ''
    });
  };

  const getStatusBadge = (session) => {
    if (!session.is_active) return 'bg-gray-100 text-gray-800';
    
    const today = new Date();
    const startDate = session.start_date ? new Date(session.start_date) : null;
    const endDate = session.end_date ? new Date(session.end_date) : null;
    
    if (!startDate || !endDate) return 'bg-gray-100 text-gray-800';
    if (today < startDate) return 'bg-blue-100 text-blue-800';
    if (today > endDate) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (session) => {
    if (!session.is_active) return 'Inactive';
    
    const today = new Date();
    const startDate = session.start_date ? new Date(session.start_date) : null;
    const endDate = session.end_date ? new Date(session.end_date) : null;
    
    if (!startDate || !endDate) return 'Unknown';
    if (today < startDate) return 'Upcoming';
    if (today > endDate) return 'Completed';
    return 'Active';
  };

  const getSessionTypeDisplay = (sessionType) => {
    const typeMap = {
      'morning': { label: 'Morning', icon: Sun, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
      'evening': { label: 'Evening', icon: Moon, color: 'text-blue-500', bgColor: 'bg-blue-100' }
    };
    return typeMap[sessionType] || { label: sessionType, icon: Calendar, color: 'text-gray-500', bgColor: 'bg-gray-100' };
  };

  const getDepartmentName = (departmentId) => {
    if (!departmentId) return 'No Department';
    const dept = departments.find(d => d.id === departmentId);
    return dept ? `${dept.name} (${dept.code})` : `Department ${departmentId}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Academic Sessions</h1>
            <p className="text-gray-600">Manage academic sessions and schedules</p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingSession(null);
            resetForm();
            setError('');
            setSuccess('');
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span>New Session</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-800">{sessions.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-3xl font-bold text-gray-800">
                {sessions.filter(s => s.is_active && getStatusText(s) === 'Active').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <div className="h-6 w-6 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Morning</p>
              <p className="text-3xl font-bold text-gray-800">
                {sessions.filter(s => s.session_type === 'morning').length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Sun className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Evening</p>
              <p className="text-3xl font-bold text-gray-800">
                {sessions.filter(s => s.session_type === 'evening').length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Moon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
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

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => {
          const sessionTypeInfo = getSessionTypeDisplay(session.session_type);
          const IconComponent = sessionTypeInfo.icon;
          
          return (
            <div key={session.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {session.name || 'Unnamed Session'}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`p-1 rounded-lg ${sessionTypeInfo.bgColor}`}>
                      <IconComponent className={`h-4 w-4 ${sessionTypeInfo.color}`} />
                    </div>
                    <span className="text-sm text-gray-600">{sessionTypeInfo.label}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(session)}`}>
                  {getStatusText(session)}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="h-4 w-4 mr-2 text-purple-500" />
                  <span>{getDepartmentName(session.department?.id || session.department)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium">{formatDate(session.start_date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">End Date:</span>
                  <span className="font-medium">{formatDate(session.end_date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {session.start_date && session.end_date ? 
                      `${Math.ceil((new Date(session.end_date) - new Date(session.start_date)) / (1000 * 60 * 60 * 24))} days` : 
                      'N/A'
                    }
                  </span>
                </div>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(session)}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(session.id)}
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

      {/* Empty State */}
      {sessions.length === 0 && !loading && (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No academic sessions found</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first academic session.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Session
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingSession ? 'Edit Session' : 'Create New Session'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingSession(null);
                    resetForm();
                    setError('');
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Tabs */}
              {!editingSession && (
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
              <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., Fall 2024 Morning, Spring 2024 Evening"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Type *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, session_type: 'morning'})}
                      className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center space-y-2 transition-all ${
                        formData.session_type === 'morning' 
                          ? 'border-yellow-500 bg-yellow-50' 
                          : 'border-gray-300 hover:border-yellow-300'
                      }`}
                    >
                      <Sun className={`h-6 w-6 ${
                        formData.session_type === 'morning' ? 'text-yellow-600' : 'text-gray-400'
                      }`} />
                      <span className={`font-medium ${
                        formData.session_type === 'morning' ? 'text-yellow-700' : 'text-gray-600'
                      }`}>
                        Morning
                      </span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, session_type: 'evening'})}
                      className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center space-y-2 transition-all ${
                        formData.session_type === 'evening' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <Moon className={`h-6 w-6 ${
                        formData.session_type === 'evening' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <span className={`font-medium ${
                        formData.session_type === 'evening' ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        Evening
                      </span>
                    </button>
                  </div>
                </div>

                {/* Department Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  >
                    <option value="">Select a department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                  {departments.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">
                      No departments found. Please create departments first.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Set as active session
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Active sessions will be available for scheduling and assignments
                    </p>
                  </div>
                </div>

                <div className="flex space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold flex items-center justify-center"
                  >
                    {formLoading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin mr-3" />
                        {editingSession ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingSession ? 'Update Session' : 'Create Session'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingSession(null);
                      resetForm();
                      setError('');
                    }}
                    disabled={formLoading}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              </>
              )}

              {/* Import from File Tab */}
              {activeTab === "import" && (
                <FileImportUploader
                  importType="sessions"
                  description="Upload an Excel, CSV, or Word file with session data. Required columns: name, session_type, department, start_date, end_date, is_active"
                  onImportComplete={() => {
                    // Refresh sessions and close modal
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
  );
};

export default AcademicSessions;