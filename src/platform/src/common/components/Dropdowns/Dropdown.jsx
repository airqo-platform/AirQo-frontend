import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

// menu icon
import { MdMoreHoriz } from 'react-icons/md';

const Dropdown = ({ onItemClick, menu }) => {
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

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
      <button
        id="dropdownMenuIconHorizontalButton"
        onClick={toggleDropdown}
        className="w-10 h-10 p-2 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-center items-center hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-[#1d1f20]"
        type="button"
      >
        <MdMoreHoriz className="w-6 h-6 text-gray-600 dark:text-gray-300" />
      </button>
      {isOpen &&
        dropdownRef.current &&
        createPortal(
          (() => {
            const rect = dropdownRef.current.getBoundingClientRect();
            const menuWidth = 176; // w-44 = 11rem = 176px
            return (
              <div
                id="dropdownDotsHorizontal"
                className="dropdown-z-fix bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-[#1d1f20] dark:divide-gray-800 mt-1"
                style={{
                  zIndex: 99999,
                  position: 'fixed',
                  minWidth: '11rem',
                  top: rect.bottom + window.scrollY,
                  left: rect.right + window.scrollX - menuWidth,
                }}
              >
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                  {menu.map((item) => (
                    <li key={item.id} className="px-2">
                      <button
                        type="button"
                        role="menuitem"
                        disabled={!!item.disabled}
                        aria-disabled={!!item.disabled}
                        onClick={
                          item.disabled
                            ? undefined
                            : () => {
                                onItemClick(item.id);
                                setIsOpen(false);
                                // return focus to the toggle button for keyboard users
                                dropdownRef.current
                                  ?.querySelector('button')
                                  ?.focus();
                              }
                        }
                        className={`flex w-full justify-start px-3 py-2 rounded-md text-left ${
                          item.disabled
                            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                        }`}
                      >
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })(),
          document.body,
        )}
      <style>{`
        .Menu_dropdown {
          position: relative;
        }
        .dropdown-z-fix {
          z-index: 99999 !important;
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
