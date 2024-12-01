import React from 'react';
import ChevronDownIcon from '@/icons/Common/chevron_downIcon';
import PropTypes from 'prop-types';
import Spinner from '../Spinner';

/**
 * TabButtons Component
 *
 * A versatile button component that can display icons, text, and handle dropdowns.
 * It also supports loading and disabled states.
 *
 * @param {object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const TabButtons = ({
  type = 'button',
  Icon,
  btnText,
  btnStyle = 'border-grey-750 px-4 py-2 bg-white',
  dropdown = false,
  onClick,
  id,
  tabRef,
  isField = true,
  isLoading = false,
  disabled = false,
}) => {
  return (
    <button
      ref={tabRef}
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      className={`transition transform active:scale-95 border rounded-xl shadow-sm flex items-center justify-between cursor-pointer ${
        disabled || isLoading
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:scale-105'
      } ${btnStyle}`}
    >
      {/* Loading Spinner */}
      {isLoading ? (
        <Spinner width={20} height={20} />
      ) : (
        Icon && (
          <span className="p-[2px] md:p-0">
            {typeof Icon === 'function' ? <Icon /> : Icon}
          </span>
        )
      )}

      {/* Button Text */}
      {btnText && (
        <span
          className={`text-sm text-start w-full px-2 font-medium capitalize ${
            Icon && isField ? 'hidden md:inline-block' : ''
          }`}
        >
          {btnText}
        </span>
      )}

      {/* Dropdown Icon */}
      {dropdown && <ChevronDownIcon />}
    </button>
  );
};

TabButtons.propTypes = {
  type: PropTypes.string,
  Icon: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),
  btnText: PropTypes.string,
  isField: PropTypes.bool,
  btnStyle: PropTypes.string,
  dropdown: PropTypes.bool,
  onClick: PropTypes.func,
  id: PropTypes.string,
  tabRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default TabButtons;
