import React, { useState, useEffect } from 'react';
import { AwesomeFormDialog, DataCard, EmptyState } from './AwesomeFormComponents';
import { academicSessionAPI } from '../services/academicSessionAPI';
import { Calendar, Plus, Search } from 'lucide-react';

const AcademicSessionManager = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingSession, setEditingSession] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await academicSessionAPI.getAll();
      setSessions(response.data || []);
    } catch (err) {
      setErrorMessage('Failed to load sessions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSession = async (formData) => {
    try {
      setLoading(true);
      const data = {
        name: formData.name,
        session_type: formData.session_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active === 'true',
      };

      if (editingSession) {
        await academicSessionAPI.update(editingSession.id, data);
        setSuccessMessage('Session updated successfully!');
      } else {
        await academicSessionAPI.create(data);
        setSuccessMessage('Session added successfully!');
      }

      setIsFormOpen(false);
      setEditingSession(null);
      fetchSessions();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to save session');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (id) => {
    if (window.confirm('Delete this session?')) {
      try {
        await academicSessionAPI.delete(id);
        setSuccessMessage('Session deleted successfully!');
        fetchSessions();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setErrorMessage('Failed to delete session');
      }
    }
  };

  const filteredSessions = sessions.filter(s =>
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formFields = [
    { name: 'name', label: 'Session Name', type: 'text', placeholder: 'e.g., Fall 2024', required: true },
    {
      name: 'session_type',
      label: 'Session Type',
      type: 'select',
      options: [
        { id: 'morning', name: 'Morning Session' },
        { id: 'evening', name: 'Evening Session' },
      ],
      required: true
    },
    { name: 'start_date', label: 'Start Date', type: 'date', required: true },
    { name: 'end_date', label: 'End Date', type: 'date', required: true },
    {
      name: 'is_active',
      label: 'Active',
      type: 'select',
      options: [
        { id: 'true', name: 'Yes' },
        { id: 'false', name: 'No' },
      ],
      required: true
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600 rounded-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Academic Sessions</h1>
              <p className="text-gray-600 mt-1">Create and manage academic terms</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingSession(null); setIsFormOpen(true); }}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Session
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
              placeholder="Search by session name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>

        {loading && sessions.length === 0 ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredSessions.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Sessions Yet"
            description="Create your first academic session"
            action={
              <button
                onClick={() => { setEditingSession(null); setIsFormOpen(true); }}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold"
              >
                Add Session
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map(session => (
              <DataCard
                key={session.id}
                data={session}
                color="purple"
                title={session.name}
                subtitle={session.session_type || 'Session'}
                fields={[
                  { key: 'start_date', label: 'Start Date' },
                  { key: 'end_date', label: 'End Date' },
                  { key: 'is_active', label: 'Status' },
                ]}
                onEdit={() => { setEditingSession(session); setIsFormOpen(true); }}
                onDelete={handleDeleteSession}
              />
            ))}
          </div>
        )}

        <AwesomeFormDialog
          isOpen={isFormOpen}
          title={editingSession ? "Edit Session" : "Add New Session"}
          description={editingSession ? "Update session details" : "Create a new academic session"}
          icon={Calendar}
          fields={formFields}
          onSubmit={handleAddSession}
          onClose={() => { setIsFormOpen(false); setEditingSession(null); }}
          loading={loading}
          submitButtonText={editingSession ? "Update Session" : "Add Session"}
          color="red"
        />
      </div>
    </div>
  );
};

export default AcademicSessionManager;
