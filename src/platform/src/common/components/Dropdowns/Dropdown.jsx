import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

// menu icon
import { MdMoreHoriz } from 'react-icons/md';

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
    <div className="Menu_dropdown" ref={dropdownRef}>
      {/* this is the button */}
      <button
        id="dropdownMenuIconHorizontalButton"
        onClick={toggleDropdown}
        className="w-10 h-10 p-2 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-center items-center hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-[#1d1f20]"
        type="button"
      >
        <MdMoreHoriz className="w-6 h-6 text-gray-600 dark:text-gray-300" />
      </button>
      {/* Dropdown menu list */}
      <div
        id="dropdownDotsHorizontal"
        className={`z-10 ${
          isOpen ? 'block' : 'hidden'
        } bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-[#1d1f20] dark:divide-gray-800 mt-1`}
      >
        <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
          {menu.map((item) => (
            <li key={item.id} className="px-2">
              <span
                onClick={() => onItemClick(item.id)}
                className="flex justify-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md"
              >
                {item.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {/* this is custom css for the dropdown */}
      <style>{`
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

Dropdown.propTypes = {
  onItemClick: PropTypes.func.isRequired,
  menu: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    }),
  ).isRequired,
  length: PropTypes.string,
};

export default Dropdown;
