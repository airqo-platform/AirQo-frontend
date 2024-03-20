import React from 'react';

const LocationIcon = ({ width, height, fill, strokeWidth }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width || '20'}
      height={height || '20'}
      viewBox='0 0 20 20'
      fill='none'>
      <g clipPath='url(#clip0_9880_13588)'>
        <path
          d='M10.0026 10.8268C11.3833 10.8268 12.5026 9.70754 12.5026 8.32682C12.5026 6.94611 11.3833 5.82682 10.0026 5.82682C8.62189 5.82682 7.5026 6.94611 7.5026 8.32682C7.5026 9.70754 8.62189 10.8268 10.0026 10.8268Z'
          stroke={fill || '#536A87'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M10.0026 18.3268C13.3359 14.9935 16.6693 12.0087 16.6693 8.32682C16.6693 4.64492 13.6845 1.66016 10.0026 1.66016C6.32071 1.66016 3.33594 4.64492 3.33594 8.32682C3.33594 12.0087 6.66927 14.9935 10.0026 18.3268Z'
          stroke={fill || '#536A87'}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_9880_13588'>
          <rect
            width={width || '20'}
            height={height || '20'}
            fill='white'
            transform='translate(0 -0.0078125)'
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default LocationIcon;
