'use client';

import React, { useCallback } from 'react';
import { FaUndo } from 'react-icons/fa';
import { Tooltip } from 'flowbite-react';
import { useOrganizationTheme } from '@/core/hooks/useOrganizationTheme';
import useUserTheme from '@/core/hooks/useUserTheme';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import logger from '@/lib/logger';

/**
 * Reusable Theme Reset Button Component
 * Can be used in different parts of the application to reset user theme to organization defaults
 */
const ThemeResetButton = ({
  variant = 'icon', // 'icon', 'button', 'link'
  size = 'medium', // 'small', 'medium', 'large'
  showTooltip = true,
  onResetComplete = () => {},
  className = '',
  children,
  iconSize, // Custom icon size
}) => {
  const {
    organizationThemeHasData: hasOrganizationTheme,
    getOrganizationThemeWithDefaults,
  } = useOrganizationTheme();

  const { updateUserTheme } = useUserTheme();

  const {
    theme,
    skin,
    primaryColor,
    layout,
    toggleTheme,
    toggleSkin,
    setPrimaryColor,
    setLayout,
  } = useTheme();

  // Check if current theme differs from organization theme
  const hasChangesFromOrgTheme = useCallback(() => {
    if (!hasOrganizationTheme) return false;

    const orgTheme = getOrganizationThemeWithDefaults();
    return (
      primaryColor !== orgTheme.primaryColor ||
      theme !== orgTheme.mode ||
      skin !== orgTheme.interfaceStyle ||
      layout !== orgTheme.contentLayout
    );
  }, [
    hasOrganizationTheme,
    primaryColor,
    theme,
    skin,
    layout,
    getOrganizationThemeWithDefaults,
  ]);

  // Reset to organization theme handler
  const handleResetToOrganizationTheme = useCallback(async () => {
    if (!hasOrganizationTheme) return;

    try {
      const orgTheme = getOrganizationThemeWithDefaults();

      // Update local theme context immediately if available
      if (toggleTheme) toggleTheme(orgTheme.mode);
      if (toggleSkin) toggleSkin(orgTheme.interfaceStyle);
      if (setPrimaryColor) setPrimaryColor(orgTheme.primaryColor);
      if (setLayout) setLayout(orgTheme.contentLayout);

      // Update via API
      await updateUserTheme(orgTheme, {
        successMessage: 'Theme reset to organization defaults successfully',
        showToast: true,
      });

      // Call completion callback
      onResetComplete(orgTheme);
    } catch (error) {
      logger.error('Failed to reset to organization theme:', error);
    }
  }, [
    hasOrganizationTheme,
    getOrganizationThemeWithDefaults,
    toggleTheme,
    toggleSkin,
    setPrimaryColor,
    setLayout,
    updateUserTheme,
    onResetComplete,
  ]);

  // Don't render if no organization theme or no changes
  if (!hasOrganizationTheme || !hasChangesFromOrgTheme()) {
    return null;
  }

  // Size classes
  const sizeClasses = {
    small: 'p-1.5 text-xs',
    medium: 'p-2 text-sm',
    large: 'p-3 text-base',
  };

  // Icon sizes
  const iconSizes = {
    small: 12,
    medium: 16,
    large: 20,
  };

  // Variant styles
  const getVariantClasses = () => {
    switch (variant) {
      case 'icon':
        return `${sizeClasses[size]} rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300`;
      case 'button':
        return `${sizeClasses[size]} px-4 rounded-md bg-orange-500 text-white transition-all hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 flex items-center gap-2`;
      case 'link':
        return `${sizeClasses[size]} text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline transition-colors flex items-center gap-2`;
      default:
        return sizeClasses[size];
    }
  };
  const button = (
    <button
      onClick={handleResetToOrganizationTheme}
      className={`${getVariantClasses()} ${className}`}
      aria-label="Reset to organization theme defaults"
    >
      <FaUndo size={iconSize || iconSizes[size]} />
      {(variant === 'button' || variant === 'link') && (
        <span>{children || 'Reset to Organization Defaults'}</span>
      )}
    </button>
  ); // Add tooltip if requested and variant is icon
  if (showTooltip && variant === 'icon') {
    return (
      <Tooltip
        content="Reset to organization defaults"
        placement="bottom"
        arrow={true}
        animation="duration-300"
        style="dark"
      >
        {button}
      </Tooltip>
    );
  }

  return button;
};

export default ThemeResetButton;
