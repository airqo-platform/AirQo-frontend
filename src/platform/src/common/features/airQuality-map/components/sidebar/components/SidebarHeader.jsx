import React from 'react';
import PropTypes from 'prop-types';
import CloseIcon from '@/icons/close_icon';
import TabSelector from './TabSelector';

const SidebarHeader = ({
  isAdmin,
  isFocused,
  handleHeaderClick = () => {},
}) => {
  return (
    <div className="p-4">
      <div className="w-full flex justify-between items-center">
        <label className="font-medium text-xl text-gray-900 dark:text-gray-100">
          Air Quality Map
        </label>
        {isFocused && (
          <button
            onClick={handleHeaderClick}
            className="focus:outline-none border border-gray-300 dark:border-gray-600 rounded-xl hover:cursor-pointer p-2 hidden md:block bg-white dark:bg-gray-800"
          >
            <CloseIcon className="text-gray-900 dark:text-gray-100" />
          </button>
        )}
      </div>
      <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        Navigate air quality analytics with precision and actionable tips.
      </p>
      {!isAdmin && (
        <div className="mt-4">
          <TabSelector defaultTab="locations" tabs={['locations', 'sites']} />
        </div>
      )}
    </div>
  );
};

SidebarHeader.propTypes = {
  isAdmin: PropTypes.bool,
  isFocused: PropTypes.bool,
  handleHeaderClick: PropTypes.func,
};

export default SidebarHeader;
