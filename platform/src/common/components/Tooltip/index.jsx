import React from 'react';

const CustomTooltip = ({ children, tooltipsText, position }) => {
  return (
    <div className='group relative inline-block'>
      <div>{children}</div>
      <div
        className={`min-w-[10rem] max-w-[12rem] ${
          (position === 'right' &&
            `absolute left-full top-1/2 z-20 ml-3 -translate-y-1/2 rounded bg-secondary-neutral-light-900 px-3 py-3 text-sm font-semibold text-white text-center opacity-0 group-hover:opacity-100`) ||
          (position === 'top' &&
            `absolute bottom-full left-1/2 z-20 mb-3 -translate-x-1/2 rounded bg-secondary-neutral-light-900 px-3 py-3 text-sm font-semibold text-white text-center opacity-0 group-hover:opacity-100`) ||
          (position === 'left' &&
            `absolute right-full top-1/2 z-20 mr-3 -translate-y-1/2 rounded bg-secondary-neutral-light-900 px-3 py-3 text-sm font-semibold text-white text-center opacity-0 group-hover:opacity-100`) ||
          (position === 'bottom' &&
            `absolute left-1/2 top-full z-20 mt-3 -translate-x-1/2 rounded bg-secondary-neutral-light-900 px-3 py-3 text-sm font-semibold text-white text-center opacity-0 group-hover:opacity-100`)
        }`}
      >
        <span
          className={`${
            (position === 'right' &&
              `absolute left-[-3px] top-1/2 -z-10 h-2 w-2 -translate-y-1/2 rotate-45 rounded-sm bg-secondary-neutral-light-900`) ||
            (position === 'top' &&
              `absolute bottom-[-3px] left-1/2 -z-10 h-2 w-2 -translate-x-1/2 rotate-45 rounded-sm bg-secondary-neutral-light-900`) ||
            (position === 'left' &&
              `absolute right-[-3px] top-1/2 -z-10 h-2 w-2 -translate-y-1/2 rotate-45 rounded-sm bg-secondary-neutral-light-900`) ||
            (position === 'bottom' &&
              `absolute left-1/2 top-[-3px] -z-10 h-2 w-2 -translate-x-1/2 rotate-45 rounded-sm bg-secondary-neutral-light-900`)
          } `}
        ></span>
        {tooltipsText}
      </div>
    </div>
  );
};

export default CustomTooltip;
