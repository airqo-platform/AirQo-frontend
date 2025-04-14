'use client';

import React, { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaSun,
  FaMoon,
  FaDesktop,
  FaBorderStyle,
} from 'react-icons/fa';
import { useTheme } from '../hooks/useTheme';
import { THEME_MODES, THEME_SKINS } from '../constants/themeConstants';

export const ThemeSheet = memo(() => {
  const {
    theme,
    toggleTheme,
    skin,
    toggleSkin,
    isThemeSheetOpen,
    closeThemeSheet,
  } = useTheme();

  // Callback to handle theme mode change
  const handleThemeChange = useCallback(
    (value) => {
      toggleTheme(value);
    },
    [toggleTheme],
  );

  // Callback to handle skin change
  const handleSkinChange = useCallback(
    (value) => {
      toggleSkin(value);
    },
    [toggleSkin],
  );

  // Theme mode options
  const themeOptions = [
    {
      value: THEME_MODES.LIGHT,
      icon: FaSun,
      label: 'Light',
    },
    {
      value: THEME_MODES.DARK,
      icon: FaMoon,
      label: 'Dark',
    },
    {
      value: THEME_MODES.SYSTEM,
      icon: FaDesktop,
      label: 'System',
    },
  ];

  // Skin options
  const skinOptions = [
    {
      value: THEME_SKINS.DEFAULT,
      label: 'Default',
      description: 'Clean, subtle shadows',
    },
    {
      value: THEME_SKINS.BORDERED,
      label: 'Bordered',
      description: 'Enhanced borders',
      icon: FaBorderStyle,
    },
  ];

  return (
    <AnimatePresence>
      {isThemeSheetOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={closeThemeSheet}
            aria-hidden="true"
          />

          {/* Slide-in Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 w-72 h-full bg-white dark:bg-[#1d1f20] z-[20000] shadow-lg overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="theme-sheet-title"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                <h2
                  id="theme-sheet-title"
                  className="text-lg font-bold dark:text-white"
                >
                  Theme Settings
                </h2>
                <button
                  onClick={closeThemeSheet}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close theme settings"
                  type="button"
                >
                  <FaTimes size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                {/* Theme Mode Section */}
                <div className="space-y-2">
                  <h3 className="text-base font-semibold dark:text-white">
                    Mode
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {themeOptions.map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        onClick={() => handleThemeChange(value)}
                        className={`flex flex-col items-center justify-center p-2 rounded-md transition-all ${
                          theme === value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                        aria-pressed={theme === value}
                        aria-label={`Set theme to ${label}`}
                        type="button"
                      >
                        <Icon size={18} />
                        <span className="text-xs mt-1">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skin Section */}
                <div className="space-y-2">
                  <h3 className="text-base font-semibold dark:text-white">
                    Skin
                  </h3>
                  <div className="space-y-2">
                    {skinOptions.map(
                      ({ value, label, description, icon: SkinIcon }) => (
                        <button
                          key={value}
                          onClick={() => handleSkinChange(value)}
                          className={`w-full text-left p-2 rounded-md transition-all ${
                            skin === value
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          aria-pressed={skin === value}
                          aria-label={`Set skin to ${label}`}
                          type="button"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{label}</div>
                              <div className="text-xs mt-0.5 opacity-80">
                                {description}
                              </div>
                            </div>
                            {SkinIcon && <SkinIcon size={16} />}
                          </div>
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

ThemeSheet.displayName = 'ThemeSheet';
