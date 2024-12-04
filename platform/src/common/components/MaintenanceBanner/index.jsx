import React from 'react';
import { IoWarningOutline } from 'react-icons/io5';
import { format } from 'date-fns';

const MaintenanceBanner = ({ maintenance }) => {
  if (!maintenance?.isActive) return null;

  const startTime = format(new Date(maintenance.startDate), 'HH:mm');
  const endTime = format(new Date(maintenance.endDate), 'HH:mm');

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <span className="flex">
              <IoWarningOutline
                className="h-6 w-6 text-yellow-600"
                aria-hidden="true"
              />
            </span>
            <p className="ml-3 font-medium text-yellow-700">
              {maintenance.message}
              <span className="ml-2 text-yellow-600">
                ({startTime} - {endTime})
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceBanner;
