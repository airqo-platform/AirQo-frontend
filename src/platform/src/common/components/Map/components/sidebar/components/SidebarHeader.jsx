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
    <div>
      <div className="w-full flex justify-between items-center">
        <label className="font-medium text-xl text-gray-900">
          Air Quality Map
        </label>
        {isFocused && (
          <button
            onClick={handleHeaderClick}
            className="focus:outline-none border rounded-xl hover:cursor-pointer p-2 hidden md:block"
          >
            <CloseIcon />
          </button>
        )}
      </div>
      <p className="text-gray-500 text-sm font-medium w-auto mt-2">
        Navigate air quality analytics with precision and actionable tips.
      </p>
      {!isAdmin && (
        <TabSelector defaultTab="locations" tabs={['locations', 'sites']} />
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
