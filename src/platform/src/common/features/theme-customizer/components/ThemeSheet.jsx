'use client';

import React, { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaSun,
  FaMoon,
  FaDesktop,
  FaBorderStyle,
  FaPalette,
} from 'react-icons/fa';
import { useTheme } from '../hooks/useTheme';
import { THEME_MODES, THEME_SKINS } from '../constants/themeConstants';

const PRESET_COLORS = [
  '#145FFF', // original deep blue
  '#B8860B', // KCCA Uganda: dark goldenrod
  '#006400', // NEMA Uganda: dark green
  '#2F4F4F', // NEMA Kenya: dark slate gray (instead of black)
  '#005757', // LASEPA Nigeria: dark teal
];

export const ThemeSheet = memo(() => {
  const {
    theme,
    toggleTheme,
    skin,
    toggleSkin,
    primaryColor,
    setPrimaryColor,
    isThemeSheetOpen,
    closeThemeSheet,
  } = useTheme();

  const themeOptions = [
    { value: THEME_MODES.LIGHT, icon: FaSun, label: 'Light' },
    { value: THEME_MODES.DARK, icon: FaMoon, label: 'Dark' },
    { value: THEME_MODES.SYSTEM, icon: FaDesktop, label: 'System' },
  ];

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

  const onPrimaryPick = useCallback(
    (e) => {
      setPrimaryColor(e.target.value);
    },
    [setPrimaryColor],
  );

  return (
    <AnimatePresence>
      {isThemeSheetOpen && (
        <div
          className="fixed inset-0"
          style={{
            zIndex: 10000,
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/80"
            onClick={closeThemeSheet}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 w-80 h-full bg-white dark:bg-[#1d1f20] shadow-lg overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="theme-sheet-title"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <header className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                <h2
                  id="theme-sheet-title"
                  className="text-lg font-bold dark:text-white"
                >
                  Theme Settings
                </h2>
                <button
                  onClick={closeThemeSheet}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close theme settings"
                >
                  <FaTimes
                    className="text-gray-600 dark:text-gray-300"
                    size={18}
                  />
                </button>
              </header>

              <div className="flex-1 p-4 space-y-6">
                {/* Primary Color (now at top) */}
                <section className="space-y-2">
                  <h3 className="text-base font-semibold dark:text-white">
                    Primary Color
                  </h3>
                  <div className="flex items-center space-x-2">
                    {PRESET_COLORS.map((col) => (
                      <button
                        key={col}
                        onClick={() => setPrimaryColor(col)}
                        className={`
                          w-8 h-8 flex items-center justify-center
                          bg-white dark:bg-gray-800
                          rounded-md shadow-sm
                          transition
                          ${
                            primaryColor === col
                              ? 'ring-2 ring-primary'
                              : 'ring-1 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600'
                          }`}
                        aria-label={`Select color ${col}`}
                        type="button"
                      >
                        <span
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: col }}
                        />
                      </button>
                    ))}

                    {/* custom picker */}
                    <div className="relative">
                      <label
                        htmlFor="primary-color-picker"
                        className={`
                          w-8 h-8 flex items-center justify-center
                          bg-white dark:bg-gray-800
                          rounded-md shadow-sm
                          transition
                          ${
                            !PRESET_COLORS.includes(primaryColor)
                              ? 'ring-2 ring-primary'
                              : 'ring-1 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600'
                          }`}
                        aria-label="Custom color picker"
                      >
                        <FaPalette
                          size={16}
                          className="text-gray-600 dark:text-gray-300"
                        />
                      </label>
                      <input
                        id="primary-color-picker"
                        type="color"
                        value={primaryColor}
                        onChange={onPrimaryPick}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Pick a custom primary color"
                      />
                    </div>
                  </div>
                </section>

                {/* Mode */}
                <section className="space-y-2">
                  <h3 className="text-base font-semibold dark:text-white">
                    Mode
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {themeOptions.map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        onClick={() => toggleTheme(value)}
                        className={`
                          flex flex-col items-center p-2 rounded-md transition-all
                          ${
                            theme === value
                              ? 'bg-primary text-white'
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
                </section>

                {/* Skin */}
                <section className="space-y-2">
                  <h3 className="text-base font-semibold dark:text-white">
                    Skin
                  </h3>
                  <div className="space-y-2">
                    {skinOptions.map(
                      ({ value, label, description, icon: SkinIcon }) => (
                        <button
                          key={value}
                          onClick={() => toggleSkin(value)}
                          className={`
                          w-full text-left p-2 rounded-md transition-all
                          ${
                            skin === value
                              ? 'bg-primary text-white'
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
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

ThemeSheet.displayName = 'ThemeSheet';
