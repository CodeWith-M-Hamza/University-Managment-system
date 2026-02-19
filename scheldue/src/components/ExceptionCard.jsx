import React from 'react';

const ExceptionCard = ({ exception, onEdit, onDelete, typeColor, typeIcon }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getExceptionTypeLabel = (type) => {
    const labels = {
      'cancelled': 'Class Cancelled',
      'room_change': 'Room Changed',
      'time_change': 'Time Changed',
      'substitute': 'Substitute Teacher'
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-white shadow rounded-lg border-l-4 border-gray-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">{typeIcon}</span>
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColor}`}>
                  {getExceptionTypeLabel(exception.exception_type)}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  {formatDate(exception.exception_date)}
                </span>
              </div>
            </div>

            {/* Schedule Info */}
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {exception.schedule?.course?.code || 'Course'} - {exception.schedule?.course?.name || 'Unknown Course'}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Teacher:</span>{' '}
                  {exception.schedule?.teacher?.user?.first_name || 'Unknown'} {exception.schedule?.teacher?.user?.last_name || 'Teacher'}
                </div>
                <div>
                  <span className="font-medium">Section:</span>{' '}
                  {exception.schedule?.class_section?.name || 'Unknown Section'}
                </div>
                <div>
                  <span className="font-medium">Room:</span>{' '}
                  {exception.schedule?.room?.room_number || 'Unknown Room'}
                </div>
                <div>
                  <span className="font-medium">Time:</span>{' '}
                  {exception.schedule?.time_slot?.slot_name || 'Unknown Time'}
                </div>
              </div>
            </div>

            {/* Exception Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Exception Details:</h4>
              
              {exception.reason && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Reason:</span> {exception.reason}
                </p>
              )}

              {exception.substitute_teacher && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Substitute:</span>{' '}
                  {exception.substitute_teacher.user?.first_name} {exception.substitute_teacher.user?.last_name}
                </p>
              )}

              {exception.alternate_room && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Alternate Room:</span> {exception.alternate_room.room_number}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-2 ml-4">
            <button
              onClick={() => onEdit(exception)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => onDelete(exception.id)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExceptionCard;