import * as React from 'react';

const trendUpIcon = ({ width, height, fill }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || 14}
      height={height || 14}
      viewBox="0 0 14 14"
      fill="none"
    >
      <g clipPath="url(#clip0_11800_41805)">
        <path
          d="M12.833 4.083l-4.59 4.59c-.23.231-.346.347-.48.39a.583.583 0 01-.36 0c-.133-.043-.249-.159-.48-.39L5.327 7.076c-.231-.23-.347-.346-.48-.39a.583.583 0 00-.36 0c-.134.044-.25.16-.48.39l-2.84 2.84m11.666-5.833H8.75m4.083 0v4.083"
          stroke={fill || '#F04438'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_11800_41805">
          <path fill="#fff" d="M0 0H14V14H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default trendUpIcon;
