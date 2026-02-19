
import React, { useEffect, useState } from 'react';
import DepartmentService from '../services/departmentService';
import FileImportUploader from './FileImportUploader';

function Department() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("add"); // "add" or "import"
  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setError(null);
      const res = await DepartmentService.getAll();
      setDepartments(res.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to load departments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      setError('Department name and code are required.');
      return;
    }

    try {
      setSubmitLoading(true);
      setError(null);
      
      const apiData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase()
      };

      console.log('📤 Creating department with data:', apiData);
      await DepartmentService.create(apiData);
      
      resetForm();
      setIsModalOpen(false);
      await fetchDepartments();
      
    } catch (error) {
      console.error('❌ Error adding department:', error);
      
      let errorMessage = 'Failed to add department. ';
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

  const handleUpdate = async (id) => {
    if (!formData.name.trim() || !formData.code.trim()) {
      setError('Department name and code are required.');
      return;
    }

    try {
      setSubmitLoading(true);
      setError(null);
      
      const apiData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase()
      };

      console.log(`🔄 Updating department ${id} with data:`, apiData);
      await DepartmentService.update(id, apiData);
      
      resetForm();
      setIsModalOpen(false);
      await fetchDepartments();
      
    } catch (error) {
      console.error('❌ Error updating department:', error);
      
      let errorMessage = 'Failed to update department. ';
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
    if (!window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      console.log(`🗑️ Deleting department ${id}...`);
      
      await DepartmentService.delete(id);
      console.log('✅ Department deleted successfully');
      
      await fetchDepartments();
    } catch (error) {
      console.error('❌ Error deleting department:', error);
      
      let errorMessage = 'Failed to delete department. ';
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
      name: '',
      code: ''
    });
    setEditingDepartment(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (department) => {
    setFormData({
      name: department.name || '',
      code: department.code || ''
    });
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Skeleton loader component
  const DepartmentSkeleton = () => (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse"
        >
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
            <span className="text-2xl text-white">🎓</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Academic Departments
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our diverse range of academic departments and programs
          </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{departments.length}</div>
              <div className="text-sm text-gray-500">Total Departments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {departments.filter(dept => dept.code).length}
              </div>
              <div className="text-sm text-gray-500">Active Programs</div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-4">
            <button
              onClick={openAddModal}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            >
              <span>+</span>
              <span>Add New Department</span>
            </button>
            <button
              onClick={fetchDepartments}
              className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
            >
              <span>🔄</span>
              <span>Refresh</span>
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

        {/* Content Section */}
        {loading ? (
          <DepartmentSkeleton />
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 text-red-400">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
            >
              Try Again
            </button>
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Departments Found</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first department to the system.</p>
            <button
              onClick={openAddModal}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              Add First Department
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept, index) => (
              <div
                key={dept.id}
                className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {dept.code?.charAt(0) || 'D'}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(dept)}
                      className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition duration-200"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
                      className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition duration-200"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                  {dept.name}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span><strong>Code:</strong> {dept.code}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => openEditModal(dept)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 px-4 rounded-lg transition duration-200 text-center"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
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

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Showing {departments.length} department{departments.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingDepartment ? 'Edit Department' : 'Add New Department'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition duration-200"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            {!editingDepartment && (
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="Enter department name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="e.g., CS, MATH, PHYS"
                  required
                />
              </div>
            </div>
            )}

            {/* Import from File Tab */}
            {activeTab === "import" && (
              <FileImportUploader
                importType="departments"
                description="Upload an Excel, CSV, or Word file with department data. Required columns: name, code"
                onImportComplete={() => {
                  // Refresh departments and close modal
                  setTimeout(() => {
                    fetchDepartments();
                    setIsModalOpen(false);
                  }, 1000);
                }}
              />
            )}

            {/* Action Buttons - Only show for add one by one tab */}
            {activeTab === "add" && (
            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition duration-200"
                disabled={submitLoading}
              >
                Cancel
              </button>
              <button
                onClick={editingDepartment ? () => handleUpdate(editingDepartment.id) : handleAdd}
                disabled={!formData.name.trim() || !formData.code.trim() || submitLoading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingDepartment ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingDepartment ? 'Update Department' : 'Add Department'
                )}
              </button>
            </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={openAddModal}
          className="bg-blue-500 hover:bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-2xl font-bold"
          title="Add New Department"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default Department;








