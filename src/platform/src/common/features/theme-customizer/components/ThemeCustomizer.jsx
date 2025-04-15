'use client';

import React, { memo } from 'react';
import { FaCog } from 'react-icons/fa';
import { useTheme } from '../hooks/useTheme';
import { ThemeSheet } from './ThemeSheet';

export const ThemeCustomizer = memo(() => {
  const { openThemeSheet } = useTheme();

  return (
    <>
      {/* Theme Toggle Button */}
      <button
        onClick={openThemeSheet}
        className="fixed right-0 top-1/2 transform -translate-y-1/2 
          bg-blue-600 text-white p-3 
          shadow-md hover:bg-blue-700 
          transition-all duration-300 z-50 
          flex items-center justify-center rounded-l-lg"
        aria-label="Open Theme Settings"
        type="button"
        style={{
          zIndex: 10000,
        }}
      >
        <FaCog size={16} />
      </button>

      {/* Theme Sheet */}
      <ThemeSheet />
    </>
  );
});

// Add display name for better debugging
ThemeCustomizer.displayName = 'ThemeCustomizer';
