import React, { useEffect, useState } from 'react';

// menu icon
import Menu from '@/icons/Actions/menuIcon.svg';

// flowbite
import { initFlowbite } from 'flowbite';

const Dropdown = ({ device }) => {
  // initializing flowbite js
  useEffect(() => {
    initFlowbite();
  }, []);

  // dropdown menu list
  const [menu, setMenu] = useState([
    {
      id: 1,
      name: 'View Reports',
      link: '#',
    },
    {
      id: 2,
      name: 'Edit device',
      link: '#',
    },
    {
      id: 3,
      name: 'Delete batch',
      link: '#',
    },
  ]);

  return (
    <div className='Menu_dropdown'>
      <button
        id='dropdownMenuIconHorizontalButton'
        data-dropdown-toggle='dropdownDotsHorizontal'
        className='inline-flex items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-600'
        type='button'>
        <Menu className='w-5 h-5' />
      </button>
      {/* Dropdown menu */}
      <div
        id='dropdownDotsHorizontal'
        className='z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600'>
        <ul
          className='py-2 text-sm text-gray-700 dark:text-gray-200'
          aria-labelledby='dropdownMenuIconHorizontalButton'>
          {menu.map((item) => (
            <li key={item.id}>
              <a
                href={(item.link, { device })}
                className='flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600'>
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dropdown;
