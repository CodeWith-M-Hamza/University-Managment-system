import React, { useState, useEffect } from 'react';
import { scheduleExceptionService } from '../services/scheduleExceptionService';
import  scheduleService  from '../services/scheduleService';
import ExceptionCard from '../components/ExceptionCard';
import ExceptionForm from '../components/ExceptionForm';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const ScheduleExceptionList = () => {
  const [exceptions, setExceptions] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingException, setEditingException] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [exceptionsData, schedulesData] = await Promise.all([
        scheduleExceptionService.getAllExceptions(),
        scheduleService.getAll()
      ]);
      setExceptions(exceptionsData);
      setSchedules(schedulesData);
      setError('');
    } catch (err) {
      setError('Failed to load schedule exceptions');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (exceptionData) => {
    try {
      await scheduleExceptionService.createException(exceptionData);
      setSuccess('Schedule exception created successfully!');
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to create schedule exception');
    }
  };

  const handleUpdate = async (exceptionData) => {
    try {
      await scheduleExceptionService.updateException(editingException.id, exceptionData);
      setSuccess('Schedule exception updated successfully!');
      setEditingException(null);
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to update schedule exception');
    }
  };

  const handleDelete = async (exceptionId) => {
    if (window.confirm('Are you sure you want to delete this schedule exception?')) {
      try {
        await scheduleExceptionService.deleteException(exceptionId);
        setSuccess('Schedule exception deleted successfully!');
        loadData();
      } catch (err) {
        setError(err.message || 'Failed to delete schedule exception');
      }
    }
  };

  const handleEdit = (exception) => {
    setEditingException(exception);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingException(null);
  };

  const getExceptionTypeColor = (type) => {
    const colors = {
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'room_change': 'bg-blue-100 text-blue-800 border-blue-200',
      'time_change': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'substitute': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getExceptionTypeIcon = (type) => {
    const icons = {
      'cancelled': '❌',
      'room_change': '🏠',
      'time_change': '⏰',
      'substitute': '👨‍🏫'
    };
    return icons[type] || '⚠️';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Schedule Exceptions</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage class cancellations, room changes, substitute teachers, and other schedule modifications
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Exception
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                  <span className="text-2xl">❌</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Cancellations</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {exceptions.filter(e => e.exception_type === 'cancelled').length}
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
                  <span className="text-2xl">🏠</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Room Changes</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {exceptions.filter(e => e.exception_type === 'room_change').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <span className="text-2xl">⏰</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Time Changes</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {exceptions.filter(e => e.exception_type === 'time_change').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <span className="text-2xl">👨‍🏫</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Substitutes</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {exceptions.filter(e => e.exception_type === 'substitute').length}
                    </dd>
                  </dl>
                </div>
              </div>
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

        {/* Exception Form Modal */}
        {showForm && (
          <ExceptionForm
            exception={editingException}
            schedules={schedules}
            onSubmit={editingException ? handleUpdate : handleCreate}
            onCancel={handleCancel}
          />
        )}

        {/* Exceptions List */}
        {exceptions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No schedule exceptions</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new schedule exception.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exceptions.map((exception) => (
              <ExceptionCard
                key={exception.id}
                exception={exception}
                onEdit={handleEdit}
                onDelete={handleDelete}
                typeColor={getExceptionTypeColor(exception.exception_type)}
                typeIcon={getExceptionTypeIcon(exception.exception_type)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleExceptionList;