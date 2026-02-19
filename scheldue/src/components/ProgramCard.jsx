import React from 'react';

const ProgramCard = ({ program, onEdit, onDelete, degreeTypeColor }) => {
  const getDegreeTypeLabel = (degreeType) => {
    const labels = {
      'bs': 'Bachelor of Science',
      'ba': 'Bachelor of Arts',
      'ms': 'Master of Science',
      'phd': 'PhD'
    };
    return labels[degreeType] || degreeType;
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="px-4 py-5 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {program.code}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {program.department?.name || program.department}
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${degreeTypeColor}`}>
            {getDegreeTypeLabel(program.degree_type)}
          </span>
        </div>

        {/* Program Name */}
        <p className="text-sm text-gray-800 mb-4 line-clamp-2">
          {program.name}
        </p>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Duration:</span>
            <p className="font-medium text-gray-900">{program.duration_years} years</p>
          </div>
          <div>
            <span className="text-gray-500">Credits:</span>
            <p className="font-medium text-gray-900">{program.total_credits}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => onEdit(program)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => onDelete(program.id)}
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
  );
};

export default ProgramCard;