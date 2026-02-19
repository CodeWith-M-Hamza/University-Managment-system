import React, { useState, useEffect } from 'react';
import { programService } from '../services/programService';
import ProgramCard from '../components/ProgramCard';
import ProgramForm from '../components/ProgramForm';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const ProgramList = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const data = await programService.getAllPrograms();
      setPrograms(data);
      setError('');
    } catch (err) {
      setError('Failed to load programs');
      console.error('Error loading programs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (programData) => {
    try {
      await programService.createProgram(programData);
      setSuccess('Program created successfully!');
      setShowForm(false);
      loadPrograms();
    } catch (err) {
      setError(err.message || 'Failed to create program');
    }
  };

  const handleUpdate = async (programData) => {
    try {
      await programService.updateProgram(editingProgram.id, programData);
      setSuccess('Program updated successfully!');
      setEditingProgram(null);
      setShowForm(false);
      loadPrograms();
    } catch (err) {
      setError(err.message || 'Failed to update program');
    }
  };

  const handleDelete = async (programId) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await programService.deleteProgram(programId);
        setSuccess('Program deleted successfully!');
        loadPrograms();
      } catch (err) {
        setError(err.message || 'Failed to delete program');
      }
    }
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProgram(null);
  };

  const getDegreeTypeColor = (degreeType) => {
    const colors = {
      'bs': 'bg-blue-100 text-blue-800',
      'ba': 'bg-green-100 text-green-800',
      'ms': 'bg-purple-100 text-purple-800',
      'phd': 'bg-red-100 text-red-800'
    };
    return colors[degreeType] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Academic Programs</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage all degree programs and their details
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Program
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}
        {success && (
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        )}

        {/* Program Form Modal */}
        {showForm && (
          <ProgramForm
            program={editingProgram}
            onSubmit={editingProgram ? handleUpdate : handleCreate}
            onCancel={handleCancel}
          />
        )}

        {/* Programs Grid */}
        {programs.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No programs</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new program.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onEdit={handleEdit}
                onDelete={handleDelete}
                degreeTypeColor={getDegreeTypeColor(program.degree_type)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramList;