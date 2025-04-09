'use client';

import React from 'react';

// Card variants: 'sidebar', 'content', 'panel'
export const Card = ({
  children,
  variant = 'content',
  className = '',
  noPadding = false,
  onClick,
  ...props
}) => {
  const baseClasses = 'transition-colors duration-200 rounded-lg';

  const variantClasses = {
    // Sidebar - darkest in dark mode
    sidebar: 'bg-gray-100 dark:bg-gray-900',

    // Content cards - medium darkness in dark mode
    content: 'bg-white dark:bg-gray-800 shadow-sm',

    // Panel cards - lightest of the dark elements
    panel:
      'bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700',
  };

  const paddingClasses = noPadding ? '' : 'p-4';

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};
