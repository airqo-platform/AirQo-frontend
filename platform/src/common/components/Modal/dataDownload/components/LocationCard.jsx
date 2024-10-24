import React from 'react';

// Helper function to handle truncation logic
const truncateName = (name, maxLength = 25) => {
  if (!name) return 'Unknown Location';
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
};

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

  // Determine display name (search_name or fallback to location_name)
  const displayName = truncateName(
    site?.name || site?.search_name?.split(',')[0],
  );

  return (
    <div
      onClick={() => onToggle(site)}
      className={`flex justify-between items-center p-3 bg-[#F6F6F7] cursor-pointer border ${
        isSelected ? 'border-blue-300 ring-2 ring-blue-500' : 'border-gray-200'
      } rounded-lg shadow-sm transition-all w-full`}
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-sm font-medium text-gray-900">{displayName}</h1>
        <small className="text-xs text-gray-500">
          {site.country || 'Unknown Country'}
        </small>
      </div>
      <div>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onToggle(site);
          }}
          className="w-4 h-4 text-blue-600 bg-white cursor-pointer border-blue-300 rounded focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default LocationCard;
