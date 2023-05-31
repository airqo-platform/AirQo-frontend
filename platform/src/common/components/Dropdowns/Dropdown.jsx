import React, { useEffect } from 'react';

// menu icon
import MoreHorizIcon from '@/icons/Common/more_horiz.svg';

// flowbite
import { initFlowbite } from 'flowbite';

const Dropdown = ({ onItemClick, menu }) => {
  // initializing flowbite js
  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <div className='Menu_dropdown'>
      <button
        id='dropdownMenuIconHorizontalButton'
        data-dropdown-toggle='dropdownDotsHorizontal'
        className='w-10 h-10 p-2 rounded-lg border border-grey-200 flex justify-center items-center hover:border-grey-300'
        type='button'>
        <MoreHorizIcon />
      </button>
      {/* Dropdown menu */}
      <div
        id='dropdownDotsHorizontal'
        className='z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600'>
        <ul
          className='py-2 text-sm text-gray-700 dark:text-gray-200'
          aria-labelledby='dropdownMenuIconHorizontalButton'>
          {menu.map((item) => (
            <li key={item.id} className='p-2'>
              <span
                onClick={() => onItemClick(item.id)}
                className='flex justify-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer rounded-md'>
                {item.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dropdown;
