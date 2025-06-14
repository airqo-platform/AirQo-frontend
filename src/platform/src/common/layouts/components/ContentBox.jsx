'use client';

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Content Box Component
 * Wrapper component for content sections with consistent styling
 */
const ContentBox = ({ children, className = '', padding = 'p-6' }) => {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${padding} ${className}`}
    >
      {children}
    </div>
  );
};

ContentBox.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  padding: PropTypes.string,
};

export default ContentBox;
