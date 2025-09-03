import React from 'react';
import { AqMenu01 } from '@airqo/icons-react';

/**
 * Header component for the Download Data modal.
 */
export const DownloadDataHeader = () => (
  <h3
    className="flex text-lg leading-6 font-medium dark:text-white"
    id="modal-title"
  >
    Download air quality data
  </h3>
);

/**
 * Mobile menu button component
 */
export const MobileMenuButton = ({ onClick }) => (
  <div className="lg:hidden px-4 md:px-6 pt-2 flex-shrink-0">
    <button
      onClick={onClick}
      aria-label="Open settings menu"
      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    >
      <AqMenu01 size={24} className="mr-1" />
      <span>Settings</span>
    </button>
  </div>
);
