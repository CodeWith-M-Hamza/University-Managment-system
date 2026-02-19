import React from 'react';

const Alert = ({ type, message, onClose }) => {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <div className={`rounded-md border p-4 mb-4 ${styles[type]}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-sm font-medium">{message}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 inline-flex text-gray-400 hover:text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;