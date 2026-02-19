import React from 'react';

const LoadingSpinner = ({ size = 'large' }) => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex justify-center items-center py-8">
      <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizes[size]}`}></div>
    </div>
  );
};

export default LoadingSpinner;