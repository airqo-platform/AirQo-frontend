'use client';

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Header Navigation Component
 * Simple header with title and subtitle for page content
 */
const HeaderNav = ({ title, subTitle }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      {subTitle && <p className="text-gray-600 text-base">{subTitle}</p>}
    </div>
  );
};

HeaderNav.propTypes = {
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.string,
};

export default HeaderNav;
