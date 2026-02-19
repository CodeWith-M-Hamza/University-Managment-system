

import React, { useEffect, useState } from "react";
import TeacherService from "../services/teacherService";
import DepartmentService from "../services/departmentService"; // Import DepartmentService
import FileImportUploader from "./FileImportUploader";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]); // New state for departments
  const [loading, setLoading] = useState(true);
  const [departmentLoading, setDepartmentLoading] = useState(true); // Loading for departments
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [activeTab, setActiveTab] = useState("add"); // "add" or "import"
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "default123",
    employee_id: "",
    department: "", // Changed to empty string for select
    max_lectures_per_week: 20,
    phone: ""
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchTeachers();
    fetchDepartments(); // Fetch departments on component mount
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📥 Fetching teachers...');
      
      const response = await TeacherService.getAll();
      console.log('✅ Teachers fetched successfully:', response.data);
      
      // Debug: Check the actual field names in the response
      if (response.data.length > 0) {
        console.log('🔍 First teacher object keys:', Object.keys(response.data[0]));
        console.log('🔍 First teacher data:', response.data[0]);
      }
      
      // Transform API data using the correct field names from your API
      const transformedTeachers = response.data.map(teacher => ({
        id: teacher.id,
        name: teacher.teacher_name || 'Unknown Teacher',
        email: teacher.email || 'No email',
        department: teacher.department_name || 'No department',
        department_id: teacher.department || teacher.department_id, // Store department ID
        phone: teacher.phone || 'No phone',
        employee_id: teacher.employee_id || 'No ID',
        max_lectures: teacher.max_lectures_per_week || 20,
        originalData: teacher
      }));
      
      setTeachers(transformedTeachers);
    } catch (error) {
      console.error('❌ Error fetching teachers:', error);
      let errorMessage = 'Failed to load teachers. ';
      
      if (error.response?.data) {
        errorMessage += JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setDepartmentLoading(true);
      console.log('📥 Fetching departments...');
      
      const response = await DepartmentService.getAll();
      console.log('✅ Departments fetched successfully:', response.data);
      
      setDepartments(response.data);
    } catch (error) {
      console.error('❌ Error fetching departments:', error);
      setError('Failed to load departments. Please refresh the page.');
    } finally {
      setDepartmentLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.employee_id.trim() || !formData.department) {
      setError('First name, last name, employee ID, and department are required.');
      return;
    }
    
    try {
      setSubmitLoading(true);
      setError(null);
      
      // Data structure that matches your Django Teacher model
      const apiData = {
        user: {
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim(),
          username: formData.username.trim() || formData.email.trim(),
          password: formData.password
        },
        employee_id: formData.employee_id.trim(),
        department: parseInt(formData.department), // Convert selected value to number
        max_lectures_per_week: formData.max_lectures_per_week,
        phone: formData.phone.trim() || ''
      };

      console.log('📤 Creating teacher with data:', apiData);

      const response = await TeacherService.create(apiData);
      console.log('✅ Teacher created successfully:', response.data);
      
      resetForm();
      setIsModalOpen(false);
      await fetchTeachers();
      
    } catch (error) {
      console.error('❌ Error adding teacher:', error);
      
      let errorMessage = 'Failed to add teacher. ';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'object') {
          const errorMessages = [];
          
          for (const [field, messages] of Object.entries(errorData)) {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`);
            } else if (typeof messages === 'string') {
              errorMessages.push(`${field}: ${messages}`);
            } else {
              errorMessages.push(`${field}: Invalid data`);
            }
          }
          
          errorMessage += errorMessages.join('; ');
        } else if (typeof errorData === 'string') {
          errorMessage += errorData;
        } else {
          errorMessage += `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage += 'No response from server. Please check if the server is running.';
      } else {
        errorMessage += error.message;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.department) {
      setError('First name, last name, and department are required.');
      return;
    }
    
    try {
      setSubmitLoading(true);
      setError(null);
      
      const apiData = {
        user: {
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim(),
          username: formData.username.trim()
        },
        employee_id: formData.employee_id.trim(),
        department: parseInt(formData.department), // Convert selected value to number
        max_lectures_per_week: formData.max_lectures_per_week,
        phone: formData.phone.trim() || ''
      };

      console.log(`🔄 Updating teacher ${id} with data:`, apiData);

      const response = await TeacherService.update(id, apiData);
      console.log('✅ Teacher updated successfully:', response.data);
      
      resetForm();
      setIsModalOpen(false);
      await fetchTeachers();
      
    } catch (error) {
      console.error('❌ Error updating teacher:', error);
      
      let errorMessage = 'Failed to update teacher. ';
      
      if (error.response?.data) {
        errorMessage += JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    
    try {
      setError(null);
      console.log(`🗑️ Deleting teacher ${id}...`);
      
      await TeacherService.delete(id);
      console.log('✅ Teacher deleted successfully');
      
      await fetchTeachers();
    } catch (error) {
      console.error('❌ Error deleting teacher:', error);
      
      let errorMessage = 'Failed to delete teacher. ';
      
      if (error.response?.data) {
        errorMessage += JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      setError(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      username: "",
      password: "default123",
      employee_id: "",
      department: "", // Reset to empty string
      max_lectures_per_week: 20,
      phone: ""
    });
    setEditingTeacher(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setFormData({
      first_name: teacher.originalData?.user?.first_name || "",
      last_name: teacher.originalData?.user?.last_name || "",
      email: teacher.email || "",
      username: teacher.originalData?.user?.username || "",
      employee_id: teacher.employee_id || "",
      department: teacher.department_id?.toString() || teacher.originalData?.department?.toString() || "",
      max_lectures_per_week: teacher.max_lectures || 20,
      phone: teacher.phone || ""
    });
    setEditingTeacher(teacher);
    setIsModalOpen(true);
  };

  // Skeleton Loader for Department Select
  const DepartmentSelectSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-12 bg-gray-200 rounded-xl"></div>
    </div>
  );

  // Rest of your existing code remains the same...
  // Debug API response
  const debugApiResponse = () => {
    TeacherService.getAll()
      .then(response => {
        console.log('🔍 Full API response:', response.data);
        if (response.data.length > 0) {
          const firstTeacher = response.data[0];
          console.log('🔍 Available fields:', Object.keys(firstTeacher));
          console.log('🔍 Teacher name field value:', firstTeacher.teacher_name);
          console.log('🔍 Department field value:', firstTeacher.department_name);
        }
      })
      .catch(error => console.error('Debug error:', error));
  };

  // Test API connection
  const testApiConnection = async () => {
    try {
      console.log('🧪 Testing API connection...');
      setError(null);
      
      // Test GET first
      const getResponse = await TeacherService.getAll();
      console.log('✅ GET test passed - Teachers count:', getResponse.data?.length || 0);
      
      alert('API connection test passed! Check console for details.');
      
    } catch (error) {
      console.error('❌ API test failed:', error);
      alert('API test failed! Check console for error details.');
    }
  };

  // Skeleton Loader
  const TeacherSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mt-2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex flex-col">
      <div className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-6">
              <span className="text-3xl text-white">👨‍🏫</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Faculty Management</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage your teaching staff with ease. Add, edit, and organize faculty information.
            </p>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-wrap justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{teachers.length}</div>
                <div className="text-sm text-gray-500">Total Teachers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {teachers.filter(t => t.department && t.department !== 'No department').length}
                </div>
                <div className="text-sm text-gray-500">Assigned Departments</div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex space-x-4">
              <button
                onClick={openAddModal}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
              >
                <span>+</span>
                <span>Add New Teacher</span>
              </button>
              <button
                onClick={fetchTeachers}
                className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
              <button
                onClick={debugApiResponse}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
              >
                <span>🔍</span>
                <span>Debug API</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-500 text-lg">⚠️</span>
                  </div>
                  <div>
                    <span className="text-red-700 font-medium">Error:</span>
                    <span className="text-red-700 ml-2">{error}</span>
                  </div>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700 text-lg font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Teachers Grid */}
          {loading ? (
            <TeacherSkeleton />
          ) : teachers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Teachers Found</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first teacher to the system.</p>
              <button
                onClick={openAddModal}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                Add First Teacher
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {teacher.name?.charAt(0) || 'T'}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(teacher)}
                        className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition duration-200"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition duration-200"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2">{teacher.name}</h3>
                  
                  <div className="space-y-3">
                    {teacher.email && teacher.email !== 'No email' && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-5 mr-2">📧</span>
                        <span className="truncate">{teacher.email}</span>
                      </div>
                    )}
                    
                    {teacher.employee_id && teacher.employee_id !== 'No ID' && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-5 mr-2">🆔</span>
                        <span>{teacher.employee_id}</span>
                      </div>
                    )}
                    
                    {teacher.department && teacher.department !== 'No department' && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-5 mr-2">🏫</span>
                        <span>{teacher.department}</span>
                      </div>
                    )}
                    
                    {teacher.phone && teacher.phone !== 'No phone' && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-5 mr-2">📞</span>
                        <span>{teacher.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => openEditModal(teacher)}
                        className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium py-2 px-4 rounded-lg transition duration-200 text-center"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-lg transition duration-200 text-center"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Section - Remains the same */}
      <footer className="bg-gray-900 text-white mt-20">
        {/* ... Your existing footer code ... */}
      </footer>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={openAddModal}
          className="bg-indigo-500 hover:bg-indigo-600 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-2xl font-bold"
          title="Add New Teacher"
        >
          +
        </button>
      </div>

      {/* Modal - Updated with Department Select */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition duration-200"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            {!editingTeacher && (
              <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("add")}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeTab === "add"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  ➕ One by One
                </button>
                <button
                  onClick={() => setActiveTab("import")}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeTab === "import"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  📤 Import File
                </button>
              </div>
            )}

            {/* Add One by One Tab */}
            {activeTab === "add" && (
            <div className="space-y-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  placeholder="Enter last name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  placeholder="teacher@school.edu"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID *
                </label>
                <input
                  type="text"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  placeholder="e.g., EMP001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                {departmentLoading ? (
                  <DepartmentSelectSkeleton />
                ) : (
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    required
                  >
                    <option value="">Select a department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            )}
            {/* Import from File Tab */}
            {activeTab === "import" && (
              <FileImportUploader
                importType="teachers"
                description="Upload an Excel, CSV, or Word file with teacher data. Required columns: first_name, last_name, email, department, employee_id"
                onImportComplete={() => {
                  // Refresh teachers list and close modal
                  setTimeout(() => {
                    fetchTeachers();
                    setIsModalOpen(false);
                  }, 1000);
                }}
              />
            )}

            {/* Action Buttons - Only show for add one by one tab */}
            {activeTab === "add" && (
            <>
            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition duration-200"
                disabled={submitLoading}
              >
                Cancel
              </button>
              <button
                onClick={editingTeacher ? () => handleUpdate(editingTeacher.id) : handleAdd}
                disabled={!formData.first_name.trim() || !formData.last_name.trim() || !formData.employee_id.trim() || !formData.department || submitLoading}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingTeacher ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingTeacher ? 'Update Teacher' : 'Add Teacher'
                )}
              </button>
            </div>
            </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Teachers;