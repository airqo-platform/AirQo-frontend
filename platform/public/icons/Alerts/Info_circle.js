import React from 'react';

const Info_circle = ({ width, height, fill, strokeWidth }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '16'}
      height={height || '16'}
      viewBox='0 0 16 16'
      fill='none'>
      <g clip-path='url(#clip0_9880_7424)'>
        <path
          d='M8.0026 10.6576V7.99089M8.0026 5.32422H8.00927M14.6693 7.99089C14.6693 11.6728 11.6845 14.6576 8.0026 14.6576C4.32071 14.6576 1.33594 11.6728 1.33594 7.99089C1.33594 4.30899 4.32071 1.32422 8.0026 1.32422C11.6845 1.32422 14.6693 4.30899 14.6693 7.99089Z'
          stroke={fill || '#6F87A1'}
          stroke-width={strokeWidth || '1.2'}
          stroke-linecap='round'
          stroke-linejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_9880_7424'>
          <rect width='16' height='16' fill='white' transform='translate(0 -0.0078125)' />
        </clipPath>
      </defs>
    </svg>
  );
};

export default Info_circle;
