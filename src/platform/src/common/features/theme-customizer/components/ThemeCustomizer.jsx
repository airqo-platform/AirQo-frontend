'use client';

import React, { memo } from 'react';
import { FaCog } from 'react-icons/fa';
import { useTheme } from '../hooks/useTheme';
import { ThemeSheet } from './ThemeSheet';
import { usePathname } from 'next/navigation';

export const ThemeCustomizer = memo(() => {
  const { openThemeSheet } = useTheme();
  const pathname = usePathname();

  // Hide only on auth routes (login, register) but allow on dashboard and organization routes
  if (
    pathname?.startsWith('/account') ||
    pathname?.includes('/login') ||
    pathname?.includes('/register')
  ) {
    return null;
  }

  return (
    <>
      <button
        onClick={openThemeSheet}
        className="fixed right-0 top-1/4 transform -translate-y-1/2 
          text-white p-3 
          shadow-md hover:opacity-70 
          transition-all duration-300 z-50 
          flex items-center justify-center rounded-l-lg"
        aria-label="Open Theme Settings"
        type="button"
        style={{
          zIndex: 10000,
          backgroundColor: 'var(--color-primary)',
        }}
      >
        <FaCog size={16} />
      </button>
      <ThemeSheet />
    </>
  );
});

ThemeCustomizer.displayName = 'ThemeCustomizer';
