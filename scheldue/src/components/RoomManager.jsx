import React, { useState, useEffect } from 'react';
import { AwesomeFormDialog, DataCard, EmptyState } from './AwesomeFormComponents';
import roomService from '../services/roomService';
import { Home, Plus, Search } from 'lucide-react';

const RoomManager = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingRoom, setEditingRoom] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomService.getAll();
      setRooms(response.data || []);
    } catch (err) {
      setErrorMessage('Failed to load rooms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async (formData) => {
    try {
      setLoading(true);
      const data = {
        room_number: formData.room_number,
        capacity: parseInt(formData.capacity),
        room_type: formData.room_type,
      };

      if (editingRoom) {
        await roomService.update(editingRoom.id, data);
        setSuccessMessage('Room updated successfully!');
      } else {
        await roomService.create(data);
        setSuccessMessage('Room added successfully!');
      }

      setIsFormOpen(false);
      setEditingRoom(null);
      fetchRooms();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to save room');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (window.confirm('Delete this room?')) {
      try {
        await roomService.delete(id);
        setSuccessMessage('Room deleted successfully!');
        fetchRooms();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setErrorMessage('Failed to delete room');
      }
    }
  };

  const filteredRooms = rooms.filter(r =>
    (r.room_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formFields = [
    { name: 'room_number', label: 'Room Number', type: 'text', placeholder: 'A101', required: true },
    { name: 'capacity', label: 'Capacity', type: 'number', placeholder: '50', min: '1', max: '300', required: true },
    {
      name: 'room_type',
      label: 'Room Type',
      type: 'select',
      options: [
        { id: 'lecture', name: 'Lecture Hall' },
        { id: 'lab', name: 'Lab' },
        { id: 'seminar', name: 'Seminar Room' },
      ],
      required: true
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-600 rounded-lg">
              <Home className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Room Management</h1>
              <p className="text-gray-600 mt-1">Manage classrooms and labs</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingRoom(null); setIsFormOpen(true); }}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Room
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
              placeholder="Search by room number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
            />
          </div>
        </div>

        {loading && rooms.length === 0 ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredRooms.length === 0 ? (
          <EmptyState
            icon={Home}
            title="No Rooms Yet"
            description="Add your first room"
            action={
              <button
                onClick={() => { setEditingRoom(null); setIsFormOpen(true); }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold"
              >
                Add Room
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map(room => (
              <DataCard
                key={room.id}
                data={room}
                color="green"
                title={room.room_number}
                subtitle={room.room_type || 'Classroom'}
                fields={[
                  { key: 'capacity', label: 'Capacity' },
                ]}
                onEdit={() => { setEditingRoom(room); setIsFormOpen(true); }}
                onDelete={handleDeleteRoom}
              />
            ))}
          </div>
        )}

        <AwesomeFormDialog
          isOpen={isFormOpen}
          title={editingRoom ? "Edit Room" : "Add New Room"}
          description={editingRoom ? "Update room details" : "Add a new classroom or lab"}
          icon={Home}
          fields={formFields}
          onSubmit={handleAddRoom}
          onClose={() => { setIsFormOpen(false); setEditingRoom(null); }}
          loading={loading}
          submitButtonText={editingRoom ? "Update Room" : "Add Room"}
          color="green"
        />
      </div>
    </div>
  );
};

export default RoomManager;
