import React from 'react';

const SkeletonLoader = ({
  width = '100%',
  height = '300px',
  className = '',
}) => (
  <div
    className={`animate-pulse bg-gray-200 rounded-md ${className}`}
    style={{ width, height }}
  />
);

export default React.memo(SkeletonLoader);
