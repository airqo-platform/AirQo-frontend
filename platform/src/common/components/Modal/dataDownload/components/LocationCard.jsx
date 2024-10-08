import React from 'react';

const LocationCard = ({ site, onToggle, isLoading }) => {
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

  return (
    <div
      className={`flex justify-between items-center p-3 bg-[#F6F6F7] cursor-pointer border ${
        site.selected
          ? 'border-blue-300 ring-2 ring-blue-500'
          : 'border-gray-200'
      } rounded-lg shadow-sm transition-all w-full`}
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-sm font-medium text-gray-900">
          {typeof site.location === 'string' && site.location.length > 15
            ? `${site.location.substring(0, 15)}...`
            : site.location}
        </h1>
        <small className="text-xs text-gray-500">{site.country}</small>
      </div>
      <div>
        <input
          type="checkbox"
          checked={true}
          onChange={() => onToggle(site)}
          className="w-4 h-4 text-blue-600 bg-white cursor-pointer border-blue-300 relative bottom-3 rounded focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

// Skeleton Loader for up to 4 cards
export const LocationCardSkeleton = () => (
  <div>
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="flex justify-between p-3 items-start bg-gray-100 rounded-xl animate-pulse w-full h-[68px] mb-2"
      >
        <div className="w-2/3 h-4 bg-gray-300 rounded mb-1"></div>
        <div className="w-4 h-4 bg-gray-300 rounded"></div>
        <div className="w-2/3 h-3 bg-gray-300 rounded"></div>
      </div>
    ))}
  </div>
);

export default LocationCard;
