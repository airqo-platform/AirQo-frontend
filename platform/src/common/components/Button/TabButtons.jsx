import React from 'react';
import ChevronDownIcon from '@/icons/Common/chevron_down.svg';

const TabButtons = ({ Icon, btnText, dropdown, onClick, id }) => {
  return (
    <button
      id={id}
      type='button'
      onClick={onClick}
      className='border border-grey-750 rounded flex items-center justify-between gap-2 px-4 py-3 cursor-pointer'>
      {Icon ? (
        <Icon />
      ) : (
        <span className='inline-block sm:hidden text-sm font-medium capitalize'>{btnText}</span>
      )}
      <span className='hidden sm:inline-block text-sm font-medium capitalize'>{btnText}</span>
      {dropdown && <ChevronDownIcon />}
    </button>
  );
};

export default TabButtons;
