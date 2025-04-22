'use client';

import React, { memo } from 'react';
import { FaCog } from 'react-icons/fa';
import { useTheme } from '../hooks/useTheme';
import { ThemeSheet } from './ThemeSheet';
import { usePathname } from 'next/navigation';

export const ThemeCustomizer = memo(() => {
  const { openThemeSheet } = useTheme();
  const pathname = usePathname();

  // Hide on any /account* route
  if (pathname?.startsWith('/account')) {
    return null;
  }

  return (
    <>
      <button
        onClick={openThemeSheet}
        className="fixed right-0 top-1/2 transform -translate-y-1/2 
          bg-primary text-white p-3 
          shadow-md hover:bg-primary/70 
          transition-all duration-300 z-50 
          flex items-center justify-center rounded-l-lg"
        aria-label="Open Theme Settings"
        type="button"
        style={{ zIndex: 10000 }}
      >
        <FaCog size={16} />
      </button>
      <ThemeSheet />
    </>
  );
});

ThemeCustomizer.displayName = 'ThemeCustomizer';
