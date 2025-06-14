'use client';

import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import Button from '@/common/components/Button';

const DarkModeToggle = ({ size = 'sm', className = '' }) => {
  const { theme, toggleTheme, systemTheme } = useTheme();

  // Determine current theme state
  const isDarkMode =
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const handleToggle = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    toggleTheme(newTheme);
  };

  const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : 18;

  return (
    <Button
      variant="text"
      onClick={handleToggle}
      className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <FaSun size={iconSize} className="text-yellow-500" />
      ) : (
        <FaMoon size={iconSize} className="text-gray-600 dark:text-gray-300" />
      )}
    </Button>
  );
};

export default DarkModeToggle;
