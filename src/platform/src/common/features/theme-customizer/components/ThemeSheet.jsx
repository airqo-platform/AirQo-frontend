'use client';

import React, { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaSun,
  FaMoon,
  FaDesktop,
  FaBorderStyle,
  FaToggleOn,
  FaToggleOff,
} from 'react-icons/fa';
import { useTheme } from '../hooks/useTheme';
import { THEME_MODES, THEME_SKINS } from '../constants/themeConstants';

export const ThemeSheet = memo(() => {
  const {
    theme,
    toggleTheme,
    skin,
    toggleSkin,
    toggleSemiDarkMode,
    isThemeSheetOpen,
    closeThemeSheet,
    isSemiDarkEnabled,
  } = useTheme();

  // Prevent unnecessary re-renders
  const handleThemeChange = useCallback(
    (value) => {
      toggleTheme(value);
    },
    [toggleTheme],
  );

  // Handle skin change
  const handleSkinChange = useCallback(
    (value) => {
      toggleSkin(value);
    },
    [toggleSkin],
  );

  // Handle semi-dark mode toggle
  const handleSemiDarkToggle = useCallback(() => {
    toggleSemiDarkMode(!isSemiDarkEnabled);
  }, [toggleSemiDarkMode, isSemiDarkEnabled]);

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

  const skinOptions = [
    {
      value: THEME_SKINS.DEFAULT,
      label: 'Default',
      description: 'Clean with subtle shadows',
    },
    {
      value: THEME_SKINS.BORDERED,
      label: 'Bordered',
      description: 'Emphasized with borders',
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
            className="fixed top-0 right-0 w-80 h-full bg-white dark:bg-gray-800 z-50 shadow-lg overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="theme-sheet-title"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
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

              {/* Content */}
              <div className="flex-1 p-6 space-y-8 overflow-y-auto">
                {/* Theme Mode */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold dark:text-white">
                    Theme Mode
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

                {/* Skin */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold dark:text-white">
                    Skin
                  </h3>
                  <div className="space-y-3">
                    {skinOptions.map(
                      ({ value, label, description, icon: SkinIcon }) => (
                        <button
                          key={value}
                          onClick={() => handleSkinChange(value)}
                          className={`
                          w-full text-left p-3 rounded-lg transition-all 
                          ${
                            skin === value
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }
                        `}
                          aria-pressed={skin === value}
                          aria-label={`Set skin to ${label}`}
                          type="button"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{label}</div>
                              <div className="text-xs mt-1 opacity-80">
                                {description}
                              </div>
                            </div>
                            {SkinIcon && <SkinIcon size={18} />}
                          </div>
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Semi Dark Mode */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold dark:text-white">
                    Semi Dark Mode
                  </h3>
                  <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        Semi Dark Sidebar
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Dark sidebar with light content
                      </div>
                    </div>
                    <button
                      onClick={handleSemiDarkToggle}
                      className={`
                        p-2 rounded-full transition-colors
                        ${
                          isSemiDarkEnabled
                            ? 'text-blue-500'
                            : 'text-gray-400 dark:text-gray-500'
                        }
                      `}
                      aria-pressed={isSemiDarkEnabled}
                      aria-label="Toggle semi dark mode"
                      type="button"
                    >
                      {isSemiDarkEnabled ? (
                        <FaToggleOn size={24} />
                      ) : (
                        <FaToggleOff size={24} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t dark:border-gray-700">
                <button
                  onClick={closeThemeSheet}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium p-3 rounded-lg transition-colors"
                  type="button"
                >
                  Apply Settings
                </button>
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
