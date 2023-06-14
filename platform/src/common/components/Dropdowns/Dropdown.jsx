import React, { useEffect, useRef, useState } from 'react';

// menu icon
import MoreHorizIcon from '@/icons/Common/more_horiz.svg';

const Dropdown = ({ onItemClick, menu, length }) => {
  // creating a ref for the dropdown menu
  const dropdownRef = useRef(null);

  // creating a state variable for the dropdown visibility
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', closeDropdown);
    return () => {
      document.removeEventListener('click', closeDropdown);
    };
  }, []);

  return (
    <div className='Menu_dropdown' ref={dropdownRef}>
      {/* this is the button */}
      <button
        id='dropdownMenuIconHorizontalButton'
        onClick={toggleDropdown}
        className='w-10 h-10 p-2 rounded-lg border border-grey-200 flex justify-center items-center hover:border-grey-300'
        type='button'>
        <MoreHorizIcon />
      </button>
      {/* Dropdown menu list */}
      <div
        id='dropdownDotsHorizontal'
        className={`z-10 ${
          isOpen ? 'block' : 'hidden'
        } bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600 mt-1`}>
        <ul className='py-2 text-sm text-gray-700 dark:text-gray-200'>
          {menu.map((item) => (
            <li key={item.id} className='px-2'>
              <span
                onClick={() => onItemClick(item.id)}
                className='flex justify-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer rounded-md'>
                {item.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {/* this is custom css for the dropdown */}
      <style jsx>{`
        .Menu_dropdown {
          position: relative;
        }
        .Menu_dropdown #dropdownDotsHorizontal {
          position: absolute;
          right: 0;
          ${length === 'last' ? 'bottom: calc(100% + 0.25rem);' : 'top: 100%;'}
        }
      `}</style>
    </div>
  );
};

export default Dropdown;
