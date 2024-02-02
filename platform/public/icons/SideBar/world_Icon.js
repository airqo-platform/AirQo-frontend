import React from 'react';

const world_Icon = ({ width, height, fill }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || 24}
      height={height || 24}
      viewBox='0 0 24 24'
      fill='none'>
      <path
        d='M15 2.458A9.996 9.996 0 0012 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10c0-1.715-.432-3.33-1.193-4.74M17 5.75h.005M10.5 21.888v-2.203a.5.5 0 01.12-.325l2.486-2.9a.5.5 0 00-.131-.76l-2.857-1.632a.499.499 0 01-.186-.187L8.07 10.62a.5.5 0 00-.478-.25l-5.528.492M21 6c0 2.21-2 4-4 6-2-2-4-3.79-4-6a4 4 0 018 0zm-3.75-.25a.25.25 0 11-.5 0 .25.25 0 01.5 0z'
        stroke={fill || '#145FFF'}
        strokeWidth={1.5}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
};

export default world_Icon;
