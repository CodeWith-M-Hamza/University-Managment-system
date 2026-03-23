import React, { useState, useEffect } from 'react';
import { AwesomeFormDialog, DataCard, EmptyState } from './AwesomeFormComponents';
import timeslotService from '../services/timeslotService';
import { Clock, Plus, Search } from 'lucide-react';

const TimeSlotManager = () => {
  const [timeslots, setTimeslots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingSlot, setEditingSlot] = useState(null);

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      const response = await timeslotService.getAll();
      setTimeslots(response.data || []);
    } catch (err) {
      setErrorMessage('Failed to load time slots');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (formData) => {
    try {
      setLoading(true);
      const data = {
        day: formData.day,
        start_time: formData.start_time,
        end_time: formData.end_time,
      };

      if (editingSlot) {
        await timeslotService.update(editingSlot.id, data);
        setSuccessMessage('Time slot updated!');
      } else {
        await timeslotService.create(data);
        setSuccessMessage('Time slot added!');
      }

      setIsFormOpen(false);
      setEditingSlot(null);
      fetchTimeSlots();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to save time slot');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (window.confirm('Delete this time slot?')) {
      try {
        await timeslotService.delete(id);
        setSuccessMessage('Time slot deleted!');
        fetchTimeSlots();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setErrorMessage('Failed to delete time slot');
      }
    }
  };

  const days = [
    { id: 'Monday', name: 'Monday' },
    { id: 'Tuesday', name: 'Tuesday' },
    { id: 'Wednesday', name: 'Wednesday' },
    { id: 'Thursday', name: 'Thursday' },
    { id: 'Friday', name: 'Friday' },
    { id: 'Saturday', name: 'Saturday' },
  ];

  const filteredSlots = timeslots.filter(s =>
    (s.day || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formFields = [
    { name: 'day', label: 'Day', type: 'select', options: days, required: true },
    { name: 'start_time', label: 'Start Time', type: 'time', required: true },
    { name: 'end_time', label: 'End Time', type: 'time', required: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Time Slot Management</h1>
              <p className="text-gray-600 mt-1">Create weekly time slots for classes</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingSlot(null); setIsFormOpen(true); }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Time Slot
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
              placeholder="Search by day..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {loading && timeslots.length === 0 ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredSlots.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No Time Slots Yet"
            description="Create weekly time slots for your classes"
            action={
              <button
                onClick={() => { setEditingSlot(null); setIsFormOpen(true); }}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold"
              >
                Add Time Slot
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSlots.map(slot => (
              <DataCard
                key={slot.id}
                data={slot}
                color="purple"
                title={slot.day}
                subtitle={`${slot.start_time} - ${slot.end_time}`}
                fields={[]}
                onEdit={() => { setEditingSlot(slot); setIsFormOpen(true); }}
                onDelete={handleDeleteSlot}
              />
            ))}
          </div>
        )}

        <AwesomeFormDialog
          isOpen={isFormOpen}
          title={editingSlot ? "Edit Time Slot" : "Add New Time Slot"}
          description={editingSlot ? "Update slot timing" : "Create a new class time slot"}
          icon={Clock}
          fields={formFields}
          onSubmit={handleAddSlot}
          onClose={() => { setIsFormOpen(false); setEditingSlot(null); }}
          loading={loading}
          submitButtonText={editingSlot ? "Update Slot" : "Add Slot"}
          color="purple"
        />
      </div>
    </div>
  );
};

export default TimeSlotManager;
