import React, { useState, useEffect } from 'react';
import  teacherService  from '../services/teacherService';
import roomService  from '../services/roomService';

const ExceptionForm = ({ exception, schedules, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    schedule: '',
    exception_type: 'cancelled',
    exception_date: new Date().toISOString().split('T')[0],
    reason: '',
    substitute_teacher: '',
    alternate_room: ''
  });
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadAdditionalData();
    if (exception) {
      setFormData({
        schedule: exception.schedule?.id || exception.schedule,
        exception_type: exception.exception_type,
        exception_date: exception.exception_date,
        reason: exception.reason || '',
        substitute_teacher: exception.substitute_teacher?.id || exception.substitute_teacher || '',
        alternate_room: exception.alternate_room?.id || exception.alternate_room || ''
      });
    }
  }, [exception]);

  const loadAdditionalData = async () => {
    try {
      const [teachersData, roomsData] = await Promise.all([
        teacherService.getAllTeachers(),
        roomService.getAllRooms()
      ]);
      setTeachers(teachersData);
      setRooms(roomsData);
    } catch (err) {
      console.error('Error loading additional data:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Prepare data for API
    const submitData = {
      ...formData,
      substitute_teacher: formData.substitute_teacher || null,
      alternate_room: formData.alternate_room || null
    };

    try {
      await onSubmit(submitData);
    } catch (err) {
      if (err.detail) {
        setErrors({ general: err.detail });
      } else if (typeof err === 'object') {
        setErrors(err);
      } else {
        setErrors({ general: 'An error occurred' });
      }
    } finally {
      setLoading(false);
    }
  };

  const exceptionTypes = [
    { value: 'cancelled', label: 'Class Cancelled', description: 'Cancel the class entirely' },
    { value: 'room_change', label: 'Room Changed', description: 'Move class to different room' },
    { value: 'time_change', label: 'Time Changed', description: 'Change class timing' },
    { value: 'substitute', label: 'Substitute Teacher', description: 'Replace with different teacher' }
  ];

  const showSubstituteField = formData.exception_type === 'substitute';
  const showRoomField = formData.exception_type === 'room_change';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center pb-3 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              {exception ? 'Edit Schedule Exception' : 'Create Schedule Exception'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {errors.general}
              </div>
            )}

            <div>
              <label htmlFor="schedule" className="block text-sm font-medium text-gray-700">
                Schedule *
              </label>
              <select
                id="schedule"
                name="schedule"
                required
                value={formData.schedule}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              >
                <option value="">Select Schedule</option>
                {schedules.map(schedule => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.course?.code} - {schedule.course?.name} | 
                    {schedule.teacher?.user?.first_name} {schedule.teacher?.user?.last_name} | 
                    {schedule.class_section?.name} | 
                    {schedule.time_slot?.day} {schedule.time_slot?.slot_name}
                  </option>
                ))}
              </select>
              {errors.schedule && <p className="mt-1 text-sm text-red-600">{errors.schedule}</p>}
            </div>

            <div>
              <label htmlFor="exception_type" className="block text-sm font-medium text-gray-700">
                Exception Type *
              </label>
              <select
                id="exception_type"
                name="exception_type"
                required
                value={formData.exception_type}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              >
                {exceptionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {exceptionTypes.find(t => t.value === formData.exception_type)?.description}
              </p>
            </div>

            <div>
              <label htmlFor="exception_date" className="block text-sm font-medium text-gray-700">
                Exception Date *
              </label>
              <input
                type="date"
                id="exception_date"
                name="exception_date"
                required
                value={formData.exception_date}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              />
              {errors.exception_date && <p className="mt-1 text-sm text-red-600">{errors.exception_date}</p>}
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                Reason
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={3}
                value={formData.reason}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                placeholder="Explain why this exception is needed..."
              />
              {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
            </div>

            {/* Conditional Fields */}
            {showSubstituteField && (
              <div>
                <label htmlFor="substitute_teacher" className="block text-sm font-medium text-gray-700">
                  Substitute Teacher
                </label>
                <select
                  id="substitute_teacher"
                  name="substitute_teacher"
                  value={formData.substitute_teacher}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                >
                  <option value="">Select Substitute Teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.user?.first_name} {teacher.user?.last_name} ({teacher.employee_id})
                    </option>
                  ))}
                </select>
                {errors.substitute_teacher && <p className="mt-1 text-sm text-red-600">{errors.substitute_teacher}</p>}
              </div>
            )}

            {showRoomField && (
              <div>
                <label htmlFor="alternate_room" className="block text-sm font-medium text-gray-700">
                  Alternate Room
                </label>
                <select
                  id="alternate_room"
                  name="alternate_room"
                  value={formData.alternate_room}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                >
                  <option value="">Select Alternate Room</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.room_number} ({room.room_type}) - Capacity: {room.capacity}
                    </option>
                  ))}
                </select>
                {errors.alternate_room && <p className="mt-1 text-sm text-red-600">{errors.alternate_room}</p>}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (exception ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExceptionForm;