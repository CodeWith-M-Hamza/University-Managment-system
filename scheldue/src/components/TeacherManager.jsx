import React, { useState, useEffect } from 'react';
import { AwesomeFormDialog, DataCard, EmptyState } from './AwesomeFormComponents';
import teacherService from '../services/teacherService';
import departmentService from '../services/departmentService';
import { Users, Plus, Search, Edit2, Trash2 } from 'lucide-react';

/**
 * Beautiful Teachers Manager Component
 * Easy data entry with awesome UI
 */
const TeacherManager = () => {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingTeacher, setEditingTeacher] = useState(null);

  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await teacherService.getAll();
      setTeachers(response.data || []);
    } catch (err) {
      setErrorMessage('Failed to load teachers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getAll();
      setDepartments(response.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTeacher = async (formData) => {
    try {
      setLoading(true);
      const data = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        employee_id: formData.employee_id,
        department_id: parseInt(formData.department),
        phone: formData.phone || '',
        max_lectures_per_week: parseInt(formData.max_lectures) || 20,
      };

      if (editingTeacher) {
        await teacherService.update(editingTeacher.id, data);
        setSuccessMessage('Teacher updated successfully!');
      } else {
        await teacherService.create(data);
        setSuccessMessage('Teacher added successfully!');
      }

      setIsFormOpen(false);
      setEditingTeacher(null);
      fetchTeachers();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to save teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await teacherService.delete(id);
        setSuccessMessage('Teacher deleted successfully!');
        fetchTeachers();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setErrorMessage('Failed to delete teacher');
      }
    }
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setIsFormOpen(true);
  };

  const filteredTeachers = teachers.filter(t =>
    (t.teacher_name || t.first_name + ' ' + t.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formFields = [
    { name: 'first_name', label: 'First Name', type: 'text', placeholder: 'John', required: true },
    { name: 'last_name', label: 'Last Name', type: 'text', placeholder: 'Doe', required: true },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com', required: true },
    { name: 'employee_id', label: 'Employee ID', type: 'text', placeholder: 'EMP001', required: true },
    { name: 'department', label: 'Department', type: 'select', options: departments, required: true },
    { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 000-0000' },
    { name: 'max_lectures', label: 'Max Lectures/Week', type: 'number', placeholder: '20', min: '1', max: '40' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Teacher Management</h1>
              <p className="text-gray-600 mt-1">Add and manage teachers easily</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingTeacher(null); setIsFormOpen(true); }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Teacher
          </button>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
            ✓ {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
            ✗ {errorMessage}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Teachers Grid */}
        {loading && teachers.length === 0 ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredTeachers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Teachers Yet"
            description="Add your first teacher to get started"
            action={
              <button
                onClick={() => { setEditingTeacher(null); setIsFormOpen(true); }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Add Teacher
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map(teacher => (
              <DataCard
                key={teacher.id}
                data={teacher}
                color="blue"
                title={teacher.teacher_name || `${teacher.first_name} ${teacher.last_name}`}
                subtitle={teacher.department_name || 'Department'}
                fields={[
                  { key: 'email', label: 'Email' },
                  { key: 'employee_id', label: 'Employee ID' },
                  { key: 'phone', label: 'Phone' },
                  { key: 'max_lectures_per_week', label: 'Max Classes/Week' },
                ]}
                onEdit={handleEditTeacher}
                onDelete={handleDeleteTeacher}
              />
            ))}
          </div>
        )}

        {/* Form Dialog */}
        <AwesomeFormDialog
          isOpen={isFormOpen}
          title={editingTeacher ? "Edit Teacher" : "Add New Teacher"}
          description={editingTeacher ? "Update teacher information" : "Add a new teacher to the system"}
          icon={Users}
          fields={formFields.map(f => ({
            ...f,
            validate: f.name === 'email' ? (val) => {
              if (!val.includes('@')) return 'Please enter a valid email';
              return null;
            } : null
          }))}
          onSubmit={handleAddTeacher}
          onClose={() => { setIsFormOpen(false); setEditingTeacher(null); }}
          loading={loading}
          submitButtonText={editingTeacher ? "Update Teacher" : "Add Teacher"}
          color="blue"
        />
      </div>
    </div>
  );
};

export default TeacherManager;
