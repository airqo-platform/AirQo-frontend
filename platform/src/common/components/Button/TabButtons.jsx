import React from 'react';
import ChevronDownIcon from '@/icons/Common/chevron_down.svg';

const TabButtons = ({ Icon, btnText, dropdown, onClick }) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className='border border-grey-750 w-15 h-10 rounded-lg flex items-center justify-between gap-2 p-[10px] cursor-pointer'>
      {Icon ? (
        <Icon />
      ) : (
        <span className='inline-block sm:hidden text-sm font-medium'>{btnText}</span>
      )}
      <span className='hidden sm:inline-block text-sm font-medium'>{btnText}</span>
      {dropdown && <ChevronDownIcon />}
    </button>
  );
};

export default TabButtons;
