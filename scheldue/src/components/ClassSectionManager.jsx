import React, { useState, useEffect } from 'react';
import { AwesomeFormDialog, DataCard, EmptyState } from './AwesomeFormComponents';
import classSectionAPI from '../services/classSectionAPI';
import { Users2, Plus, Search } from 'lucide-react';

const ClassSectionManager = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingSection, setEditingSection] = useState(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await classSectionAPI.getAllSections();
      setSections(response || []);
    } catch (err) {
      setErrorMessage('Failed to load sections');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async (formData) => {
    try {
      setLoading(true);
      const data = {
        name: formData.name,
        section_code: formData.section_code,
        total_students: parseInt(formData.total_students),
      };

      if (editingSection) {
        await classSectionAPI.updateSection(editingSection.id, data);
        setSuccessMessage('Section updated successfully!');
      } else {
        await classSectionAPI.createSection(data);
        setSuccessMessage('Section added successfully!');
      }

      setIsFormOpen(false);
      setEditingSection(null);
      fetchSections();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to save section');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (id) => {
    if (window.confirm('Delete this section?')) {
      try {
        await classSectionAPI.deleteSection(id);
        setSuccessMessage('Section deleted successfully!');
        fetchSections();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setErrorMessage('Failed to delete section');
      }
    }
  };

  const filteredSections = sections.filter(s =>
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.section_code || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formFields = [
    { name: 'name', label: 'Section Name', type: 'text', placeholder: 'e.g., Section A', required: true },
    { name: 'section_code', label: 'Section Code', type: 'text', placeholder: 'e.g., SEC-A', required: true },
    { name: 'total_students', label: 'Total Students', type: 'number', placeholder: '30', min: '1', max: '100', required: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-600 rounded-lg">
              <Users2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Class Section Management</h1>
              <p className="text-gray-600 mt-1">Create and manage class sections/groups</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingSection(null); setIsFormOpen(true); }}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Section
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
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {loading && sections.length === 0 ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredSections.length === 0 ? (
          <EmptyState
            icon={Users2}
            title="No Sections Yet"
            description="Create your first class section"
            action={
              <button
                onClick={() => { setEditingSection(null); setIsFormOpen(true); }}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg font-semibold"
              >
                Add Section
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSections.map(section => (
              <DataCard
                key={section.id}
                data={section}
                color="orange"
                title={section.name}
                subtitle={section.section_code}
                fields={[
                  { key: 'total_students', label: 'Students' },
                ]}
                onEdit={() => { setEditingSection(section); setIsFormOpen(true); }}
                onDelete={handleDeleteSection}
              />
            ))}
          </div>
        )}

        <AwesomeFormDialog
          isOpen={isFormOpen}
          title={editingSection ? "Edit Section" : "Add New Section"}
          description={editingSection ? "Update section details" : "Create a new class section"}
          icon={Users2}
          fields={formFields}
          onSubmit={handleAddSection}
          onClose={() => { setIsFormOpen(false); setEditingSection(null); }}
          loading={loading}
          submitButtonText={editingSection ? "Update Section" : "Add Section"}
          color="orange"
        />
      </div>
    </div>
  );
};

export default ClassSectionManager;
