import React from 'react';

const Unhealthy = ({ width, height, fill }) => {
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
            d="M86.26 94.81a1.47 1.47 0 01-.85-.26 38 38 0 00-24.09-6.7 37.48 37.48 0 00-18.72 6.69 1.5 1.5 0 11-1.72-2.46 40.5 40.5 0 0120.23-7.22 41 41 0 0126 7.22 1.5 1.5 0 01-.85 2.73zM39.65 66.2A11.24 11.24 0 1150.89 55a11.26 11.26 0 01-11.24 11.2zm0-19.48A8.24 8.24 0 1047.89 55a8.25 8.25 0 00-8.24-8.28zM88.35 66.2A11.24 11.24 0 1199.59 55a11.26 11.26 0 01-11.24 11.2zm0-19.48A8.24 8.24 0 1096.59 55a8.24 8.24 0 00-8.24-8.28z"
          />
        </g>
      </g>
    </svg>
  );
};

export default Unhealthy;
