'use client';

import React from 'react';

/**
 * Footer Component
 * Professional footer for AirQo Platform with copyright information
 * Supports dark mode and has no background
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div className="text-center space-y-1">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              © {currentYear} AirQo. All rights reserved.
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              Air Quality Analytics Platform
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
