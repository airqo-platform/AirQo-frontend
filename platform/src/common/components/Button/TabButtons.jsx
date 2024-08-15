import React from 'react';
import ChevronDownIcon from '@/icons/Common/chevron_down.svg';

const TabButtons = ({ type, Icon, btnText, btnStyle, dropdown, onClick, id }) => {
  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      className={`${
        btnStyle ? btnStyle : 'border-grey-750 px-4 py-2 rounded-xl'
      } border flex items-center justify-between gap-2 cursor-pointer`}>
      {Icon ? (
        Icon
      ) : (
        <span className='inline-block sm:hidden text-sm font-medium capitalize'>{btnText}</span>
      )}
      {btnText && (
        <span className='hidden sm:inline-block text-sm font-medium capitalize'>{btnText}</span>
      )}
      {dropdown && <ChevronDownIcon />}
    </button>
  );
};

export default TabButtons;
