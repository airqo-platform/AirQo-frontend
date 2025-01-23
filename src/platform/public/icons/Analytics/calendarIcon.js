import React from 'react';

const calendarIcon = ({ width, height, fill }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || 16}
      height={height || 17}
      viewBox="0 0 16 17"
      fill="none"
    >
      <path
        d="M14 7.167H2m8.667-5.333v2.667M5.333 1.834v2.667M5.2 15.167h5.6c1.12 0 1.68 0 2.108-.218a2 2 0 00.874-.874c.218-.427.218-.988.218-2.108v-5.6c0-1.12 0-1.68-.218-2.108a2 2 0 00-.874-.874c-.428-.218-.988-.218-2.108-.218H5.2c-1.12 0-1.68 0-2.108.218a2 2 0 00-.874.874C2 4.687 2 5.247 2 6.367v5.6c0 1.12 0 1.68.218 2.108a2 2 0 00.874.874c.428.218.988.218 2.108.218z"
        stroke={fill || '#1C1D20'}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default calendarIcon;
