'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaSun,
  FaMoon,
  FaDesktop,
  FaTable,
  FaBorderAll,
  FaPalette,
  FaGripHorizontal,
  FaColumns,
  FaUndo,
} from 'react-icons/fa';
import { useTheme } from '../hooks/useTheme';
import useUserTheme from '@/core/hooks/useUserTheme';
import useOrganizationThemeData from '@/core/hooks/useOrganizationThemeData';
import ThemeResetButton from '@/common/components/ThemeResetButton';
import {
  THEME_MODES,
  THEME_SKINS,
  THEME_LAYOUT,
} from '../constants/themeConstants';

const PRESET_COLORS = [
  '#145FFF', // original deep blue
  '#B8860B', // KCCA Uganda: dark goldenrod
  '#006400', // NEMA Uganda: dark green
  '#2F4F4F', // NEMA Kenya: dark slate gray
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
    layout,
    setLayout,
    isThemeSheetOpen,
    closeThemeSheet,
  } = useTheme();

  // User theme hook for API integration
  const {
    updatePrimaryColor,
    updateThemeMode,
    updateInterfaceStyle,
    updateContentLayout,
    updateUserTheme,
  } = useUserTheme();

  // Organization theme data hook
  const {
    organizationTheme,
    hasData,
    getOrganizationThemeWithDefaults,
    getOrganizationPrimaryColor,
  } = useOrganizationThemeData();

  // Use the boolean value for hasOrganizationTheme
  const hasOrganizationTheme = hasData;

  const themeOptions = [
    { value: THEME_MODES.LIGHT, icon: FaSun, label: 'Light' },
    { value: THEME_MODES.DARK, icon: FaMoon, label: 'Dark' },
    { value: THEME_MODES.SYSTEM, icon: FaDesktop, label: 'System' },
  ];

  const skinOptions = [
    {
      value: THEME_SKINS.DEFAULT,
      label: 'Default',
      description: 'Clean, minimal design',
      icon: FaTable,
    },
    {
      value: THEME_SKINS.BORDERED,
      label: 'Bordered',
      description: 'Enhanced borders',
      icon: FaBorderAll,
    },
  ];

  // Check if current theme differs from organization theme (for info panel)
  const hasChangesFromOrgTheme = useMemo(() => {
    if (!hasOrganizationTheme) return false;

    const orgTheme = getOrganizationThemeWithDefaults();
    const hasChanges =
      primaryColor !== orgTheme.primaryColor ||
      theme !== orgTheme.mode ||
      skin !== orgTheme.interfaceStyle ||
      layout !== orgTheme.contentLayout;

    return hasChanges;
  }, [
    hasOrganizationTheme,
    primaryColor,
    theme,
    skin,
    layout,
    getOrganizationThemeWithDefaults,
  ]);

  // Enhanced handlers that sync with API
  const handleColorChange = useCallback(
    (e) => {
      const newColor = e.target.value;
      setPrimaryColor(newColor);
      // Update via API in the background
      updatePrimaryColor(newColor);
    },
    [setPrimaryColor, updatePrimaryColor],
  );

  const handlePresetColorClick = useCallback(
    (color) => {
      setPrimaryColor(color);
      // Update via API in the background
      updatePrimaryColor(color);
    },
    [setPrimaryColor, updatePrimaryColor],
  );

  const handleThemeToggle = useCallback(
    (newTheme) => {
      toggleTheme(newTheme);
      // Update via API in the background
      updateThemeMode(newTheme);
    },
    [toggleTheme, updateThemeMode],
  );

  const handleSkinToggle = useCallback(
    (newSkin) => {
      toggleSkin(newSkin);
      // Update via API in the background
      updateInterfaceStyle(newSkin);
    },
    [toggleSkin, updateInterfaceStyle],
  );
  const handleLayoutChange = useCallback(
    (newLayout) => {
      setLayout(newLayout);
      // Update via API in the background
      updateContentLayout(newLayout);
    },
    [setLayout, updateContentLayout],
  );

  if (!isThemeSheetOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000]">
      <AnimatePresence>
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
          className="fixed top-0 right-0 w-80 h-full bg-white dark:bg-neutral-900 shadow-lg overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="theme-sheet-title"
        >
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b dark:border-neutral-800 min-h-[60px]">
            <h2
              id="theme-sheet-title"
              className="text-lg font-bold dark:text-white flex-1"
            >
              Theme Settings
            </h2>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Reset to Organization Theme Button */}
              <ThemeResetButton
                variant="icon"
                size="small"
                showTooltip={true}
                className="!p-1"
                iconSize={18}
              />
              <button
                onClick={closeThemeSheet}
                className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Close theme settings"
              >
                <FaTimes
                  className="text-neutral-600 dark:text-neutral-300"
                  size={18}
                />
              </button>
            </div>
          </header>

          {/* Organization Theme Information */}
          {hasOrganizationTheme && (
            <div className="mx-4 mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getOrganizationPrimaryColor() }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Organization Theme Available
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    {hasChangesFromOrgTheme
                      ? 'Your current settings differ from organization defaults. Click the reset button to restore organization theme.'
                      : "You are using your organization's default theme settings."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 p-4 space-y-6">
            {/* Primary Color */}
            <section className="space-y-3">
              <h3 className="text-base font-semibold dark:text-white">
                Primary Color
              </h3>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handlePresetColorClick(color)}
                    className={`
                      w-8 h-8 rounded-md flex items-center justify-center                      ${
                        primaryColor === color
                          ? 'ring-2 ring-offset-1 dark:ring-offset-neutral-900 ring-[var(--org-primary,var(--color-primary,#145fff))]'
                          : 'hover:ring-1 hover:ring-neutral-300 dark:hover:ring-neutral-700'
                      }
                    `}
                    aria-label={`Select color ${color}`}
                  >
                    <span
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </button>
                ))}

                {/* Custom color picker */}
                <div className="relative">
                  <label
                    htmlFor="primary-color-picker"
                    className={`
                      w-8 h-8 rounded-md flex items-center justify-center bg-white dark:bg-neutral-800
                      ${
                        !PRESET_COLORS.includes(primaryColor)
                          ? 'ring-2 ring-offset-1 dark:ring-offset-neutral-900 ring-[var(--org-primary,var(--color-primary,#145fff))]'
                          : 'hover:ring-1 hover:ring-neutral-300 dark:hover:ring-neutral-700'
                      }
                    `}
                  >
                    <FaPalette
                      size={16}
                      className="text-neutral-600 dark:text-neutral-300"
                    />
                  </label>
                  <input
                    id="primary-color-picker"
                    type="color"
                    value={primaryColor}
                    onChange={handleColorChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Pick a custom primary color"
                  />
                </div>
              </div>
            </section>

            {/* Mode */}
            <section className="space-y-3">
              <h3 className="text-base font-semibold dark:text-white">Mode</h3>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => handleThemeToggle(value)}
                    className={`
                      flex flex-col items-center p-2 rounded-md transition-all                      ${
                        theme === value
                          ? 'bg-[var(--org-primary,var(--color-primary,#145fff))] text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }
                    `}
                    aria-pressed={theme === value}
                    aria-label={`Set theme to ${label}`}
                  >
                    <Icon size={18} />
                    <span className="text-xs mt-1">{label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Skin */}
            <section className="space-y-3">
              <h3 className="text-base font-semibold dark:text-white">
                Interface Style
              </h3>
              <div className="space-y-2">
                {skinOptions.map(
                  ({ value, label, description, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => handleSkinToggle(value)}
                      className={`
                      w-full text-left p-3 rounded-md transition-all
                      ${
                        skin === value
                          ? 'bg-primary text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }
                    `}
                      aria-pressed={skin === value}
                      aria-label={`Set interface style to ${label}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{label}</div>
                          <div className="text-xs mt-0.5 opacity-90">
                            {description}
                          </div>
                        </div>
                        {Icon && <Icon size={16} />}
                      </div>
                    </button>
                  ),
                )}
              </div>
            </section>

            {/* Layout */}
            <section className="space-y-3">
              <h3 className="text-base font-semibold dark:text-white">
                Content Layout
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleLayoutChange(THEME_LAYOUT.COMPACT)}
                  className={`
                    flex flex-col items-center p-2 rounded-md transition-all
                    ${
                      layout === THEME_LAYOUT.COMPACT
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }
                  `}
                  aria-pressed={layout === THEME_LAYOUT.COMPACT}
                >
                  <FaGripHorizontal size={18} />
                  <span className="text-xs mt-1">Compact</span>
                </button>

                <button
                  onClick={() => handleLayoutChange(THEME_LAYOUT.WIDE)}
                  className={`
                    flex flex-col items-center p-2 rounded-md transition-all
                    ${
                      layout === THEME_LAYOUT.WIDE
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }
                  `}
                  aria-pressed={layout === THEME_LAYOUT.WIDE}
                >
                  <FaColumns size={18} />
                  <span className="text-xs mt-1">Wide</span>
                </button>
              </div>
            </section>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

ThemeSheet.displayName = 'ThemeSheet';
