import React from 'react';

const VeryUnhealthy = ({ width, height, fill }) => {
  return (
    <svg
      width={width || '800px'}
      height={height || '800px'}
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>{`.cls-1{fill:${fill || '#2e2f42'}}`}</style>
      </defs>
      <g data-name="Layer 2" id="Layer_2">
        <g id="Export">
          <path
            className="cls-1"
            d="M64 3A61 61 0 113 64 61.06 61.06 0 0164 3m0-3a64 64 0 1064 64A64 64 0 0064 0z"
          />
          <path
            className="cls-1"
            d="M48.78 54.3l-4.53-7.84A1.5 1.5 0 0041.66 48L45 53.8h-6.6a1.5 1.5 0 100 3h9a1.5 1.5 0 001.6-1.5v-.11a1.49 1.49 0 00-.22-.89zM90.61 53.8H84l3.39-5.8a1.5 1.5 0 00-2.6-1.5l-4.52 7.8a1.43 1.43 0 00-.19.9.34.34 0 000 .1 1.5 1.5 0 001.5 1.5h9a1.5 1.5 0 000-3zM86.26 94.81a1.47 1.47 0 01-.85-.26 37.94 37.94 0 00-24.09-6.7 37.48 37.48 0 00-18.72 6.69 1.5 1.5 0 11-1.72-2.46 40.5 40.5 0 0120.23-7.22 41 41 0 0126 7.22 1.5 1.5 0 01-.85 2.73z"
          />
        </g>
      </g>
    </svg>
  );
};

export default VeryUnhealthy;
