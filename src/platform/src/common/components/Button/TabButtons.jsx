import React from 'react';
import ChevronDownIcon from '@/icons/Common/chevron_downIcon';
import PropTypes from 'prop-types';
import Spinner from '../Spinner';
import Card from '../CardWrapper';

/**
 * TabButtons Component
 *
 * A versatile button component that can display icons, text, and handle dropdowns.
 * It also supports loading and disabled states. Optionally, it can wrap its content
 * in a Card component to use the consistent card styling.
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
  useCard = false,
  cardProps = {},
}) => {
  // Define the core content of the button
  const content = (
    <>
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
    </>
  );
  // If useCard is true, wrap the button in a Card component
  if (useCard) {
    return (
      <Card
        onClick={onClick}
        className={`cursor-pointer transition transform active:scale-95 border rounded-xl shadow-sm ${
          disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
        } ${btnStyle}`}
        {...cardProps}
      >
        {/* Render a semantic button inside the Card for proper accessibility */}
        <button
          ref={tabRef}
          id={id}
          type={type}
          onClick={onClick}
          disabled={disabled || isLoading}
          aria-disabled={disabled || isLoading}
          className="w-full h-full flex items-center justify-between focus:outline-none"
        >
          {content}
        </button>
      </Card>
    );
  }

  // Fallback to original behavior without Card
  return (
    <button
      ref={tabRef}
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      className={`transition transform active:scale-95 border rounded-xl shadow-sm flex items-center justify-between cursor-pointer ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
      } ${btnStyle}`}
    >
      {content}
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
  // New props for optional Card usage
  useCard: PropTypes.bool,
  cardProps: PropTypes.object,
};

export default TabButtons;
