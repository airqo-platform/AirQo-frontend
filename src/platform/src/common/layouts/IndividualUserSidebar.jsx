'use client';

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import AuthenticatedSideBar from '@/common/components/SideBar/AuthenticatedSidebar';
import UserSidebarContent from '@/common/components/SideBar/UserSidebarContent';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';

/**
 * Individual User Sidebar Layout
 * Removes organization dropdown and shows only AirQo branding
 */
export default function IndividualUserSidebar() {
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const { theme, systemTheme } = useTheme();

  // Determine if dark mode should be applied
  const isDarkMode = useMemo(() => {
    return theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  }, [theme, systemTheme]);

  // Generate styles for UserSidebarContent - same pattern as AuthenticatedSidebar
  const styles = useMemo(
    () => ({
      collapseButton: isDarkMode
        ? 'bg-gray-800 border-gray-700 text-white'
        : 'bg-white border-gray-200 text-gray-800',
      background: isDarkMode ? 'bg-[#1d1f20]' : 'bg-white',
      border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
      scrollbar: isDarkMode
        ? 'scrollbar-thumb-gray-600 scrollbar-track-gray-800'
        : 'scrollbar-thumb-gray-300 scrollbar-track-gray-100',
      divider: isDarkMode ? 'border-gray-700' : 'border-gray-200',
      text: isDarkMode ? 'text-white' : 'text-gray-800',
      mutedText: isDarkMode ? 'text-gray-400' : 'text-gray-500',
      dropdownHover: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
      dropdownText: isDarkMode ? 'text-white' : 'text-gray-800',
      dropdownBackground: isDarkMode ? 'bg-[#1d1f20]' : 'bg-white',
      iconFill: isDarkMode ? 'ffffff' : undefined,
      stroke: isDarkMode ? 'white' : '#1f2937',
    }),
    [isDarkMode],
  );

  // Default AirQo logo component
  const logoComponent = (
    <img
      src="/icons/airqo_logo.svg"
      alt="AirQo logo"
      className="w-[46.56px] h-8 object-contain"
      onError={(e) => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'block';
      }}
    />
  );

  return (
    <AuthenticatedSideBar
      showOrganizationDropdown={false}
      logoComponent={logoComponent}
      homeNavPath="/user/Home"
      showCollapseButton={true}
    >
      <UserSidebarContent isCollapsed={isCollapsed} styles={styles} />
    </AuthenticatedSideBar>
  );
}
