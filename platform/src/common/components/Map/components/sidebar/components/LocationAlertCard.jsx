import React, { useState } from 'react';
import ChevronDownIcon from '@/icons/Common/chevron_down.svg';

const LocationAlertCard = ({ title, children, isCollapsed = true }) => {
  const [collapsed, setCollapsed] = useState(isCollapsed);

  return (
    <div className='p-3 bg-white rounded-lg shadow border border-secondary-neutral-dark-100 flex-col justify-center items-center'>
      <div
        className={`flex justify-between items-center ${collapsed && 'mb-2'} cursor-pointer`}
        onClick={() => setCollapsed(!collapsed)}>
        <div className='flex justify-start items-center gap-3'>
          <div className='w-10 h-10 rounded-full bg-secondary-neutral-dark-50 p-2 flex items-center justify-center text-xl font-bold'>
            🚨
          </div>
          <h3 className='text-lg font-medium leading-relaxed text-secondary-neutral-dark-950'>
            {title}
          </h3>
        </div>
        <div className='w-7 h-7 rounded-full flex items-center justify-center bg-white'>
          <ChevronDownIcon className='text-secondary-neutral-dark-950 w-4 h-4' />
        </div>
      </div>

      {collapsed && children}
    </div>
  );
};

export default LocationAlertCard;
