'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSun, FaMoon, FaDesktop } from 'react-icons/fa';
import { useTheme } from '../hooks/useTheme';
import { THEME_MODES } from '../constants/themeConstants';

export const ThemeSheet = () => {
  const { theme, toggleTheme, isThemeSheetOpen, closeThemeSheet } = useTheme();

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
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeThemeSheet}
          />

          {/* Slide-in Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 w-80 h-full bg-white dark:bg-gray-800 z-50 shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white">
                Theme Settings
              </h2>
              <button
                onClick={closeThemeSheet}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-semibold dark:text-white">
                Choose Theme
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => toggleTheme(value)}
                    className={`
                      flex flex-col items-center justify-center 
                      p-3 rounded-lg transition-all 
                      ${
                        theme === value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }
                    `}
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
};
