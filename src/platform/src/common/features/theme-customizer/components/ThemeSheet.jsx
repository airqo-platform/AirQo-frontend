'use client';

import { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon02,
  DotsGrid,
  Grid01,
  Monitor01,
  LayoutGrid01,
  LayoutGrid02,
  XClose,
  Palette,
  RefreshCcw02,
} from '@airqo/icons-react';
import { Tooltip } from 'flowbite-react';
import { useTheme } from '../hooks/useTheme';
import useUserTheme from '@/core/hooks/useUserTheme';
import useOrganizationTheme from '@/core/hooks/useOrganizationTheme';
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
    theme: userTheme,
  } = useUserTheme();

  // Get organization theme
  // Fix: useOrganizationTheme is a default export, not named
  const { themeData: orgTheme } = useOrganizationTheme();

  // Compare user and org theme for sync status
  const isThemeInSync =
    orgTheme && userTheme
      ? orgTheme.primaryColor === userTheme.primaryColor &&
        orgTheme.mode === userTheme.mode &&
        orgTheme.interfaceStyle === userTheme.interfaceStyle &&
        orgTheme.contentLayout === userTheme.contentLayout
      : true;

  // Reset handler
  const handleResetToOrgTheme = useCallback(() => {
    if (!orgTheme) return;
    updateUserTheme(orgTheme, {
      successMessage: 'Theme reset to organization defaults',
    });
    // Update UI immediately
    setPrimaryColor(orgTheme.primaryColor);
    toggleTheme(orgTheme.mode);
    toggleSkin(orgTheme.interfaceStyle);
    setLayout(orgTheme.contentLayout);
  }, [
    orgTheme,
    updateUserTheme,
    setPrimaryColor,
    toggleTheme,
    toggleSkin,
    setLayout,
  ]);

  const themeOptions = [
    { value: THEME_MODES.LIGHT, icon: Sun, label: 'Light' },
    { value: THEME_MODES.DARK, icon: Moon02, label: 'Dark' },
    { value: THEME_MODES.SYSTEM, icon: Monitor01, label: 'System' },
  ];

  const skinOptions = [
    {
      value: THEME_SKINS.DEFAULT,
      label: 'Default',
      description: 'Clean, minimal design',
      icon: LayoutGrid02,
    },
    {
      value: THEME_SKINS.BORDERED,
      label: 'Bordered',
      description: 'Enhanced borders',
      icon: LayoutGrid01,
    },
  ];

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
          key="theme-sheet-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/40 dark:bg-black/80"
          onClick={closeThemeSheet}
        />

        <motion.div
          key="theme-sheet-content"
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
          <header className="flex items-center justify-between p-4 border-b dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <h2
                id="theme-sheet-title"
                className="text-lg font-bold dark:text-white"
              >
                Theme Settings
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip
                content={
                  isThemeInSync
                    ? 'Theme matches organization settings'
                    : 'Reset to organization theme'
                }
              >
                <div className="relative">
                  <button
                    onClick={handleResetToOrgTheme}
                    disabled={isThemeInSync}
                    style={
                      !isThemeInSync && orgTheme && orgTheme.primaryColor
                        ? { color: orgTheme.primaryColor }
                        : {}
                    }
                    className={`p-1.5 rounded-full transition-colors ${
                      isThemeInSync
                        ? 'text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                    aria-label="Reset to organization theme"
                  >
                    <RefreshCcw02 size={16} />
                    {/* Out-of-sync notification dot in top-right corner */}
                    {!isThemeInSync && (
                      <span
                        className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 border border-white dark:border-neutral-900 rounded-full animate-pulse z-10"
                        title="Your theme differs from the organization default"
                      />
                    )}
                  </button>
                </div>
              </Tooltip>
              <button
                onClick={closeThemeSheet}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Close theme settings"
              >
                <XClose
                  className="text-neutral-600 dark:text-neutral-300"
                  size={16}
                />
              </button>
            </div>
          </header>

          <div className="flex-1 p-4 space-y-6">
            {/* Primary Color */}
            <section className="space-y-3">
              <h3 className="text-base font-semibold dark:text-white">
                Primary Color
              </h3>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={`preset-${color}`}
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
                    <Palette
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
                {/* Render a button for the custom color if it's not in presets */}
                {!PRESET_COLORS.includes(primaryColor) && primaryColor && (
                  <button
                    key={`custom-${primaryColor}`}
                    className={`
                      w-8 h-8 rounded-md flex items-center justify-center
                      ring-2 ring-offset-1 dark:ring-offset-neutral-900 ring-[var(--org-primary,var(--color-primary,#145fff))]
                    `}
                    aria-label={`Custom color ${primaryColor}`}
                    style={{ pointerEvents: 'none' }}
                  >
                    <span
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </button>
                )}
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
                  <DotsGrid size={18} />
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
                  <Grid01 size={18} />
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
