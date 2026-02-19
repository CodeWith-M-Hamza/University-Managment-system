import React, { useState, useEffect } from 'react';
import { courseOfferingService } from '../services/courseOfferingService';
import courseService from '../services/courseService';
import classSectionAPI from '../services/classSectionAPI';
import { academicSessionAPI } from '../services/academicSessionAPI';
import teacherService from '../services/teacherService';
import OfferingCard from '../components/OfferingCard';
// import OfferingForm from '../components/OfferingForm';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const CourseOfferingList = () => {
  const [offerings, setOfferings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingOffering, setEditingOffering] = useState(null);
  const [filters, setFilters] = useState({
    academic_session: '',
    class_section: '',
    course: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [offeringsData, coursesData, sectionsData, sessionsData, teachersData] = await Promise.all([
        courseOfferingService.getAllOfferings(),
        courseService.getAll(),
        classSectionAPI.getAllSections(),
        academicSessionAPI.getAll(),
        teacherService.getAll()
      ]);
      
      console.log('Loaded data:', {
        offerings: offeringsData,
        courses: coursesData,
        sections: sectionsData,
        sessions: sessionsData,
        teachers: teachersData
      });

      // Ensure all data is arrays, default to empty array if not
      setOfferings(Array.isArray(offeringsData) ? offeringsData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setSections(Array.isArray(sectionsData) ? sectionsData : []);
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      setError('');
    } catch (err) {
      setError('Failed to load course offerings');
      console.error('Error loading data:', err);
      
      // Set empty arrays on error to prevent mapping issues
      setOfferings([]);
      setCourses([]);
      setSections([]);
      setSessions([]);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (offeringData) => {
    try {
      await courseOfferingService.createOffering(offeringData);
      setSuccess('Course offering created successfully!');
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to create course offering');
    }
  };

  const handleUpdate = async (offeringData) => {
    try {
      await courseOfferingService.updateOffering(editingOffering.id, offeringData);
      setSuccess('Course offering updated successfully!');
      setEditingOffering(null);
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to update course offering');
    }
  };

  const handleDelete = async (offeringId) => {
    if (window.confirm('Are you sure you want to delete this course offering?')) {
      try {
        await courseOfferingService.deleteOffering(offeringId);
        setSuccess('Course offering deleted successfully!');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to delete course offering');
      }
    }
  };

  const handleEdit = (offering) => {
    setEditingOffering(offering);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingOffering(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Safe array accessor helper
  const safeArray = (array) => Array.isArray(array) ? array : [];

  // Filter offerings based on selected filters
  const filteredOfferings = safeArray(offerings).filter(offering => {
    return (
      (!filters.academic_session || offering.academic_session?.id == filters.academic_session) &&
      (!filters.class_section || offering.class_section?.id == filters.class_section) &&
      (!filters.course || offering.course?.id == filters.course)
    );
  });

  // Group offerings by section for better organization
  const groupedOfferings = filteredOfferings.reduce((groups, offering) => {
    const sectionName = offering.class_section?.name || 'Unknown Section';
    if (!groups[sectionName]) {
      groups[sectionName] = [];
    }
    groups[sectionName].push(offering);
    return groups;
  }, {});

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Course Offerings</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage which courses are offered to which class sections in each academic session
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Offering
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Offerings</dt>
                    <dd className="text-lg font-medium text-gray-900">{safeArray(offerings).length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Core Courses</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {safeArray(offerings).filter(o => o.is_core).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Sections with Offerings</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {new Set(safeArray(offerings).map(o => o.class_section?.id)).size}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="academic_session" className="block text-sm font-medium text-gray-700">
                Academic Session
              </label>
              <select
                id="academic_session"
                name="academic_session"
                value={filters.academic_session}
                onChange={handleFilterChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              >
                <option value="">All Sessions</option>
                {safeArray(sessions).map(session => (
                  <option key={session.id} value={session.id}>
                    {session.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="class_section" className="block text-sm font-medium text-gray-700">
                Class Section
              </label>
              <select
                id="class_section"
                name="class_section"
                value={filters.class_section}
                onChange={handleFilterChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              >
                <option value="">All Sections</option>
                {safeArray(sections).map(section => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                Course
              </label>
              <select
                id="course"
                name="course"
                value={filters.course}
                onChange={handleFilterChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              >
                <option value="">All Courses</option>
                {safeArray(courses).map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}
        {success && (
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        )}

        {/* Offering Form Modal */}
        {showForm && (
          <OfferingForm
            offering={editingOffering}
            courses={courses}
            sections={sections}
            sessions={sessions}
            teachers={teachers}
            onSubmit={editingOffering ? handleUpdate : handleCreate}
            onCancel={handleCancel}
          />
        )}

        {/* Offerings List */}
        {filteredOfferings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No course offerings</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new course offering.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedOfferings).map(([sectionName, sectionOfferings]) => (
              <div key={sectionName} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900">
                    {sectionName}
                    <span className="ml-2 text-sm text-gray-500 font-normal">
                      ({sectionOfferings[0]?.class_section?.department?.name})
                    </span>
                  </h3>
                  <p className="text-sm text-gray-600">
                    Academic Session: {sectionOfferings[0]?.academic_session?.name}
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {safeArray(sectionOfferings).map((offering) => (
                      <OfferingCard
                        key={offering.id}
                        offering={offering}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseOfferingList;