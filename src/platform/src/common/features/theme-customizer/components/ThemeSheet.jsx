'use client';

import React, { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSun, FaMoon, FaDesktop } from 'react-icons/fa';
import { useTheme } from '../hooks/useTheme';
import { THEME_MODES } from '../constants/themeConstants';

export const ThemeSheet = memo(() => {
  const { theme, toggleTheme, isThemeSheetOpen, closeThemeSheet } = useTheme();

  // Prevent unnecessary re-renders
  const handleThemeChange = useCallback(
    (value) => {
      toggleTheme(value);
      // Auto close after changing theme
      setTimeout(closeThemeSheet, 300);
    },
    [toggleTheme, closeThemeSheet],
  );

  const themeOptions = [
    {
      value: THEME_MODES.LIGHT,
      icon: FaSun,
      label: 'Light Mode',
    },
    {
      value: THEME_MODES.DARK,
      icon: FaMoon,
      label: 'Dark Mode',
    },
    {
      value: THEME_MODES.SYSTEM,
      icon: FaDesktop,
      label: 'System Mode',
    },
  ];

  return (
    <AnimatePresence>
      {isThemeSheetOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeThemeSheet}
            aria-hidden="true"
          />

          {/* Slide-in Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 w-80 h-full bg-white dark:bg-gray-800 z-50 shadow-lg p-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="theme-sheet-title"
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                id="theme-sheet-title"
                className="text-xl font-bold dark:text-white"
              >
                Theme Settings
              </h2>
              <button
                onClick={closeThemeSheet}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close theme settings"
                type="button"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-semibold dark:text-white">
                Choose Theme
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => handleThemeChange(value)}
                    className={`
                      flex flex-col items-center justify-center 
                      p-3 rounded-lg transition-all 
                      ${
                        theme === value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }
                    `}
                    aria-pressed={theme === value}
                    aria-label={`Set theme to ${label}`}
                    type="button"
                  >
                    <Icon size={20} />
                    <span className="text-xs mt-1">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

// Add display name for better debugging
ThemeSheet.displayName = 'ThemeSheet';
