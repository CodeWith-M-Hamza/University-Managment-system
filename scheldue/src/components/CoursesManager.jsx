import React, { useState, useEffect } from 'react';
import { AwesomeFormDialog, DataCard, EmptyState } from './AwesomeFormComponents';
import CourseService from '../services/courseService';
import DepartmentService from '../services/departmentService';
import { BookOpen, Plus, Search } from 'lucide-react';

const CoursesManager = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await CourseService.getAll();
      setCourses(response.data || []);
    } catch (err) {
      setErrorMessage('Failed to load courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await DepartmentService.getAll();
      setDepartments(response.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCourse = async (formData) => {
    try {
      setLoading(true);
      const data = {
        code: formData.code,
        name: formData.name,
        credit_hours: parseInt(formData.credit_hours) || 0,
        course_type: formData.course_type,
        department_id: parseInt(formData.department),
      };

      if (editingCourse) {
        await CourseService.update(editingCourse.id, data);
        setSuccessMessage('Course updated successfully!');
      } else {
        await CourseService.create(data);
        setSuccessMessage('Course added successfully!');
      }

      setIsFormOpen(false);
      setEditingCourse(null);
      fetchCourses();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Delete this course?')) {
      try {
        await CourseService.delete(id);
        setSuccessMessage('Course deleted successfully!');
        fetchCourses();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setErrorMessage('Failed to delete course');
      }
    }
  };

  const filteredCourses = courses.filter(c =>
    (c.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formFields = [
    { name: 'code', label: 'Course Code', type: 'text', placeholder: 'CS101', required: true },
    { name: 'name', label: 'Course Name', type: 'text', placeholder: 'Introduction to CS', required: true },
    { name: 'credit_hours', label: 'Credit Hours', type: 'number', placeholder: '3', min: '1', max: '6' },
    {
      name: 'course_type',
      label: 'Course Type',
      type: 'select',
      options: [
        { id: 'theory', name: 'Theory' },
        { id: 'lab', name: 'Lab' },
        { id: 'practical', name: 'Practical' },
      ],
      required: true
    },
    { name: 'department', label: 'Department', type: 'select', options: departments, required: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Course Management</h1>
              <p className="text-gray-600 mt-1">Add and manage university courses</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingCourse(null); setIsFormOpen(true); }}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Course
          </button>
        </div>

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

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {loading && courses.length === 0 ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredCourses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Courses Yet"
            description="Add your first course to the system"
            action={
              <button
                onClick={() => { setEditingCourse(null); setIsFormOpen(true); }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold"
              >
                Add Course
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <DataCard
                key={course.id}
                data={course}
                color="indigo"
                title={course.code}
                subtitle={course.name}
                fields={[
                  { key: 'credit_hours', label: 'Credits' },
                  { key: 'course_type', label: 'Type' },
                ]}
                onEdit={() => { setEditingCourse(course); setIsFormOpen(true); }}
                onDelete={handleDeleteCourse}
              />
            ))}
          </div>
        )}

        <AwesomeFormDialog
          isOpen={isFormOpen}
          title={editingCourse ? "Edit Course" : "Add New Course"}
          description={editingCourse ? "Update course information" : "Add a new course to the system"}
          icon={BookOpen}
          fields={formFields}
          onSubmit={handleAddCourse}
          onClose={() => { setIsFormOpen(false); setEditingCourse(null); }}
          loading={loading}
          submitButtonText={editingCourse ? "Update Course" : "Add Course"}
          color="indigo"
        />
      </div>
    </div>
  );
};

export default CoursesManager;
