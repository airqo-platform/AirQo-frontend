// src/components/SkeletonLoader.jsx
import React from 'react';
import PropTypes from 'prop-types';

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

SkeletonLoader.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
};

export default React.memo(SkeletonLoader);
