import React from 'react';

const refreshIcon = ({ width, height, fill }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '24'}
      height={height || '24'}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M20.452 12.8927C20.1742 15.5026 18.6954 17.9483 16.2484 19.3611C12.1829 21.7083 6.98442 20.3153 4.63721 16.2499L4.38721 15.8168M3.54515 11.1066C3.82295 8.49674 5.30174 6.05102 7.74873 4.63825C11.8142 2.29104 17.0127 3.68398 19.3599 7.74947L19.6099 8.18248M3.49219 18.0657L4.22424 15.3336L6.95629 16.0657M17.0414 7.93364L19.7735 8.66569L20.5055 5.93364"
        stroke={fill || '#536A87'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default refreshIcon;
