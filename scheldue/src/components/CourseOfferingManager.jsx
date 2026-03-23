import React, { useState, useEffect } from 'react';
import { AwesomeFormDialog, DataCard, EmptyState } from './AwesomeFormComponents';
import { courseOfferingService } from '../services/courseOfferingService';
import courseService from '../services/courseService';
import teacherService from '../services/teacherService';
import classSectionAPI from '../services/classSectionAPI';
import { BookMarked, Plus, Search } from 'lucide-react';

const CourseOfferingManager = () => {
  const [offerings, setOfferings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingOffering, setEditingOffering] = useState(null);

  useEffect(() => {
    fetchLoadAllData();
  }, []);

  const fetchLoadAllData = async () => {
    try {
      setLoading(true);
      const [offeringsRes, coursesRes, teachersRes, sectionsRes] = await Promise.all([
        courseOfferingService.getAll(),
        courseService.getAll(),
        teacherService.getAll(),
        classSectionAPI.getAllSections(),
      ]);
      
      setOfferings(offeringsRes.data || []);
      setCourses(coursesRes.data || []);
      setTeachers(teachersRes.data || []);
      setSections(sectionsRes.data || []);
    } catch (err) {
      setErrorMessage('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOffering = async (formData) => {
    try {
      setLoading(true);
      const data = {
        course: parseInt(formData.course),
        teacher: parseInt(formData.teacher),
        class_section: parseInt(formData.class_section),
        is_core: formData.is_core === 'true',
      };

      if (editingOffering) {
        await courseOfferingService.update(editingOffering.id, data);
        setSuccessMessage('Offering updated successfully!');
      } else {
        await courseOfferingService.create(data);
        setSuccessMessage('Course offering added successfully!');
      }

      setIsFormOpen(false);
      setEditingOffering(null);
      fetchLoadAllData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to save offering');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffering = async (id) => {
    if (window.confirm('Delete this course offering?')) {
      try {
        await courseOfferingService.delete(id);
        setSuccessMessage('Offering deleted successfully!');
        fetchLoadAllData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setErrorMessage('Failed to delete offering');
      }
    }
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id == courseId);
    return course ? `${course.code} - ${course.name}` : 'Unknown Course';
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id == teacherId);
    return teacher ? teacher.teacher_name || `${teacher.first_name} ${teacher.last_name}` : 'Unknown Teacher';
  };

  const getSectionName = (sectionId) => {
    const section = sections.find(s => s.id == sectionId);
    return section ? section.name : 'Unknown Section';
  };

  const filteredOfferings = offerings.filter(o =>
    getCourseName(o.course).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getTeacherName(o.teacher).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formFields = [
    { name: 'course', label: 'Course', type: 'select', options: courses, required: true },
    { name: 'teacher', label: 'Teacher', type: 'select', options: teachers, required: true },
    { name: 'class_section', label: 'Class Section', type: 'select', options: sections, required: true },
    {
      name: 'is_core',
      label: 'Is Core Course',
      type: 'select',
      options: [
        { id: 'true', name: 'Yes' },
        { id: 'false', name: 'No' },
      ],
      required: true
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-600 rounded-lg">
              <BookMarked className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Course Offerings</h1>
              <p className="text-gray-600 mt-1">Link courses to teachers and sections</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingOffering(null); setIsFormOpen(true); }}
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Offering
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
              placeholder="Search by course or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {loading && offerings.length === 0 ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredOfferings.length === 0 ? (
          <EmptyState
            icon={BookMarked}
            title="No Course Offerings Yet"
            description="Create your first course offering"
            action={
              <button
                onClick={() => { setEditingOffering(null); setIsFormOpen(true); }}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg font-semibold"
              >
                Add Course Offering
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredOfferings.map(offering => (
              <DataCard
                key={offering.id}
                data={offering}
                color="green"
                title={getCourseName(offering.course)}
                subtitle={getTeacherName(offering.teacher)}
                fields={[
                  { key: 'class_section', label: 'Section', show: () => getSectionName(offering.class_section) },
                ]}
                onEdit={() => { setEditingOffering(offering); setIsFormOpen(true); }}
                onDelete={handleDeleteOffering}
              />
            ))}
          </div>
        )}

        <AwesomeFormDialog
          isOpen={isFormOpen}
          title={editingOffering ? "Edit Course Offering" : "Add New Course Offering"}
          description={editingOffering ? "Update offering details" : "Link a course to a teacher and section"}
          icon={BookMarked}
          fields={formFields}
          onSubmit={handleAddOffering}
          onClose={() => { setIsFormOpen(false); setEditingOffering(null); }}
          loading={loading}
          submitButtonText={editingOffering ? "Update Offering" : "Add Offering"}
          color="green"
        />
      </div>
    </div>
  );
};

export default CourseOfferingManager;
