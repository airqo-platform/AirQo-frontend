'use client';

import React from 'react';

/**
 * Logout overlay component that shows while user is being logged out
 */
const LogoutOverlay = ({ isVisible, message = 'Logging out...' }) => {
  if (!isVisible) return null;
  return (
    <div className="fixed inset-0 z-[99999] bg-black bg-opacity-50 flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-sm w-full mx-4 transform transition-all duration-300 ease-in-out">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="SecondaryMainloader" aria-label="Logging out"></div>
          <div className="space-y-2">
            <p className="text-gray-700 text-lg font-medium leading-relaxed">
              {message}
            </p>
            <p className="text-gray-500 text-sm">Please wait...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutOverlay;
