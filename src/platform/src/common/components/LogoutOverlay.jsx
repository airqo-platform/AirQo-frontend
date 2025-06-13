'use client';

import React from 'react';

/**
 * Logout overlay component that shows while user is being logged out
 */
const LogoutOverlay = ({ isVisible, message = 'Logging out...' }) => {
  if (!isVisible) return null;
  return (
    <div className="fixed inset-0 z-[99999] bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full mx-4">
        <div className="text-center">
          <div
            className="SecondaryMainloader mb-4"
            aria-label="Logging out"
          ></div>
          <p className="text-gray-700 text-lg font-medium">{message}</p>
          <p className="text-gray-500 text-sm mt-2">Please wait...</p>
        </div>
      </div>
    </div>
  );
};

export default LogoutOverlay;
