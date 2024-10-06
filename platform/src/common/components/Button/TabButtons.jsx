import React from 'react';
import ChevronDownIcon from '@/icons/Common/chevron_downIcon';
import PropTypes from 'prop-types';

const TabButtons = ({
  type = 'button',
  Icon,
  btnText,
  btnStyle = 'border-grey-750 px-4 py-2 bg-white',
  dropdown = false,
  onClick,
  id,
  tabRef,
}) => {
  return (
    <button
      ref={tabRef}
      id={id}
      type={type}
      onClick={onClick}
      className={` transition transform active:scale-95 border rounded-xl shadow-sm flex items-center justify-between cursor-pointer ${btnStyle}`}
    >
      {Icon && (
        <span className="p-[2px] md:p-0">
          {typeof Icon === 'function' ? <Icon /> : Icon}
        </span>
      )}
      {btnText && (
        <span
          className={`text-sm text-start w-full px-2 font-medium capitalize ${Icon ? 'hidden md:inline-block' : ''}`}
        >
          {btnText}
        </span>
      )}
      {dropdown && <ChevronDownIcon />}
    </button>
  );
};

TabButtons.propTypes = {
  type: PropTypes.string,
  Icon: PropTypes.func,
  btnText: PropTypes.string,
  btnStyle: PropTypes.string,
  dropdown: PropTypes.bool,
  onClick: PropTypes.func,
  id: PropTypes.string,
  tabRef: PropTypes.object,
};

export default TabButtons;
