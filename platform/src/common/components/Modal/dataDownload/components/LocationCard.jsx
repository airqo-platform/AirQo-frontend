import React from 'react';
import LocationIcon from '@/icons/Analytics/LocationIcon';

// Helper function to handle truncation logic
const truncateName = (name, maxLength = 13) => {
  if (!name) return 'Unknown Location';
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
};

/**
 * LocationCard Component
 * Displays information about a location with a checkbox to toggle selection.
 */
const LocationCard = ({ site, onToggle, isSelected, isLoading }) => {
  // Display loading skeleton while loading
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-3 items-start bg-gray-100 rounded-xl animate-pulse w-full h-[68px]">
        <div className="flex justify-between w-full h-auto">
          <div className="w-2/3 h-4 bg-gray-300 rounded mb-1"></div>
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
        </div>
        <div className="w-2/3 h-3 bg-gray-300 rounded"></div>
      </div>
    );
  }

  // Destructure necessary properties from site
  const { name, search_name, country } = site;

  // Determine display name (search_name or fallback to name)
  const displayName = truncateName(name || search_name?.split(',')[0] || '');

  return (
    <div
      className={`flex justify-between items-center p-3 bg-[#F6F6F7] border ${
        isSelected ? 'border-blue-300 ring-2 ring-blue-500' : 'border-gray-200'
      } rounded-lg shadow-sm transition-all w-full`}
    >
      <div className="flex items-center gap-2">
        <LocationIcon
          width={20}
          height={20}
          fill={isSelected ? '#3B82F6' : '#9EA3AA'}
        />
        <div className="flex flex-col">
          <h3 className="text-sm font-medium text-gray-900">{displayName}</h3>
          <small className="text-xs text-gray-500">
            {country || 'Unknown Country'}
          </small>
        </div>
      </div>
      <div>
        <input
          type="checkbox"
          id={`checkbox-${site._id || 'unknown'}`}
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onToggle(site);
          }}
          className="w-4 h-4 text-blue-600 bg-white cursor-pointer border-blue-300 rounded focus:ring-blue-500"
          aria-label={`Select ${displayName}`}
        />
      </div>
    </div>
  );
};

export default LocationCard;
