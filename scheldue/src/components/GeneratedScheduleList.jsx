import React, { useState, useEffect } from 'react';
import { generatedScheduleService } from '../services/generatedScheduleService';
import departmentService from '../services/departmentService';
import { academicSessionAPI } from '../services/academicSessionAPI';
import ScheduleCard from '../components/ScheduleCard';
import ScheduleForm from '../components/ScheduleForm';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const GeneratedScheduleList = ({ user }) => {
  const [schedules, setSchedules] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [filters, setFilters] = useState({
    department: '',
    academic_session: '',
    is_active: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schedulesData, departmentsData, sessionsData] = await Promise.all([
        generatedScheduleService.getAllSchedules().catch(err => {
          console.warn('Schedules not available:', err);
          return [];
        }),
        departmentService.getAll().catch(err => {
          console.warn('Departments not available:', err);
          return [];
        }),
        academicSessionAPI.getAll().catch(err => {
          console.warn('Sessions not available:', err);
          return [];
        })
      ]);

      console.log('Raw data:', {
        schedules: schedulesData,
        departments: departmentsData,
        sessions: sessionsData
      });

      // Handle different response structures
      const safeArray = (data) => {
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        if (data && Array.isArray(data.results)) return data.results;
        return [];
      };

      setSchedules(safeArray(schedulesData));
      setDepartments(safeArray(departmentsData));
      setSessions(safeArray(sessionsData));
      setError('');
    } catch (err) {
      setError('Failed to load generated schedules');
      console.error('Error loading data:', err);
      // Ensure arrays are set to empty arrays to prevent mapping errors
      setSchedules([]);
      setDepartments([]);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (scheduleData) => {
    try {
      await generatedScheduleService.createSchedule(scheduleData);
      setSuccess('Schedule generated successfully!');
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to generate schedule');
    }
  };

  const handleUpdate = async (scheduleData) => {
    try {
      await generatedScheduleService.updateSchedule(editingSchedule.id, scheduleData);
      setSuccess('Schedule updated successfully!');
      setEditingSchedule(null);
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to update schedule');
    }
  };

  const handleDelete = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this generated schedule?')) {
      try {
        await generatedScheduleService.deleteSchedule(scheduleId);
        setSuccess('Schedule deleted successfully!');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to delete schedule');
      }
    }
  };

  const handleActivate = async (scheduleId) => {
    if (window.confirm('Are you sure you want to activate this schedule? This will deactivate other schedules for the same department.')) {
      try {
        await generatedScheduleService.activateSchedule(scheduleId);
        setSuccess('Schedule activated successfully!');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to activate schedule');
      }
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSchedule(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Safe array accessor
  const safeArray = (array) => Array.isArray(array) ? array : [];

  // Filter schedules based on selected filters
  const filteredSchedules = safeArray(schedules).filter(schedule => {
    return (
      (!filters.department || schedule.department?.id == filters.department) &&
      (!filters.academic_session || schedule.academic_session?.id == filters.academic_session) &&
      (filters.is_active === '' || schedule.is_active === (filters.is_active === 'true'))
    );
  });

  // Group schedules by department for better organization
  const groupedSchedules = filteredSchedules.reduce((groups, schedule) => {
    const deptName = schedule.department?.name || 'Unknown Department';
    if (!groups[deptName]) {
      groups[deptName] = [];
    }
    groups[deptName].push(schedule);
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
              <h1 className="text-3xl font-bold text-gray-900">Generated Schedules</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage and activate generated timetables for different departments and academic sessions
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Generate Schedule
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Schedules</dt>
                    <dd className="text-lg font-medium text-gray-900">{safeArray(schedules).length}</dd>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Schedules</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {safeArray(schedules).filter(s => s.is_active).length}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Departments</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {new Set(safeArray(schedules).map(s => s.department?.id)).size}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Sessions</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {new Set(safeArray(schedules).map(s => s.academic_session?.id)).size}
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
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                id="department"
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              >
                <option value="">All Departments</option>
                {safeArray(departments).map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

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
              <label htmlFor="is_active" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="is_active"
                name="is_active"
                value={filters.is_active}
                onChange={handleFilterChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
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

        {/* Schedule Form Modal */}
        {showForm && (
          <ScheduleForm
            schedule={editingSchedule}
            departments={departments}
            sessions={sessions}
            onSubmit={editingSchedule ? handleUpdate : handleCreate}
            onCancel={handleCancel}
            user={user} // Pass the user prop here
          />
        )}

        {/* Schedules List */}
        {filteredSchedules.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No generated schedules</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by generating a new schedule.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSchedules).map(([deptName, deptSchedules]) => (
              <div key={deptName} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      {deptName}
                    </h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {deptSchedules.length} schedule{deptSchedules.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-6">
                    {safeArray(deptSchedules).map((schedule) => (
                      <ScheduleCard
                        key={schedule.id}
                        schedule={schedule}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onActivate={handleActivate}
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

export default GeneratedScheduleList;