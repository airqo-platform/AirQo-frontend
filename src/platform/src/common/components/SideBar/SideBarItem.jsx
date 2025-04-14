'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import { useTheme } from '@/features/theme-customizer/hooks/useTheme';

export const SideBarDropdownItem = ({ itemLabel, itemPath }) => {
  const router = useRouter();
  const { theme, systemTheme, isSemiDarkEnabled } = useTheme();
  const [isMediumDevice, setIsMediumDevice] = useState(false);
  const currentRoute = router.pathname;
  const isCurrentRoute = currentRoute.includes(itemPath);

  // Determine current theme mode (dark, light, or semi-dark)
  const isDarkMode = useMemo(() => {
    if (theme === 'dark' || (theme === 'system' && systemTheme === 'dark')) {
      return true;
    }
    return isSemiDarkEnabled;
  }, [theme, systemTheme, isSemiDarkEnabled]);

  // Use dynamic classes based on theme and active state
  const textClass = isCurrentRoute
    ? 'text-blue-600 dark:text-blue-400'
    : isDarkMode
      ? 'text-gray-200'
      : 'text-black';

  const handleClick = (e) => {
    e.preventDefault();
    router.push(itemPath);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleMediaQueryChange = (e) => setIsMediumDevice(e.matches);

    setIsMediumDevice(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleMediaQueryChange);

    return () =>
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
  }, []);

  return (
    <Link
      href={itemPath}
      onClick={handleClick}
      className={`block transition-colors duration-200 ${
        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
      }`}
    >
      <div className="h-10 flex items-center">
        {(!isMediumDevice || itemLabel) && (
          <h3 className={`text-sm leading-5 ${textClass}`}>{itemLabel}</h3>
        )}
      </div>
    </Link>
  );
};

const SidebarItem = ({
  Icon,
  label,
  navPath,
  children,
  onClick,
  toggleMethod,
  toggleState,
  iconOnly = false,
}) => {
  const router = useRouter();
  const { theme, systemTheme, isSemiDarkEnabled } = useTheme();
  const currentRoute = router.pathname;
  const isCurrentRoute =
    currentRoute === navPath || (navPath === '/Home' && currentRoute === '/');
  const hasDropdown = !!children;

  // Determine current theme mode (dark, light, or semi-dark)
  const isDarkMode = useMemo(() => {
    if (theme === 'dark' || (theme === 'system' && systemTheme === 'dark')) {
      return true;
    }
    return isSemiDarkEnabled;
  }, [theme, systemTheme, isSemiDarkEnabled]);

  // Dynamic classes and colors based on theme and active state
  const textClass = isCurrentRoute
    ? 'text-blue-600 dark:text-blue-600'
    : isDarkMode
      ? 'text-gray-200'
      : 'text-black';

  const iconColor = isCurrentRoute
    ? '#2563EB'
    : isDarkMode
      ? '#FFFFFF'
      : '#000000';

  const bgClass = isCurrentRoute
    ? `${isDarkMode ? 'bg-gray-700/30' : 'bg-blue-100'}`
    : `${isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'}`;

  const commonClasses = `
    cursor-pointer transition-all duration-300 ease-in-out
    ${textClass}
    ${toggleState ? `${isDarkMode ? 'bg-gray-700' : 'bg-sidebar-blue'} rounded-xl` : ''}
  `;

  const leftIndicatorClass =
    'absolute -left-2 h-1/3 w-1 bg-blue-600 rounded-xl';

  const handleItemClick = hasDropdown ? toggleMethod : onClick;

  return (
    <div
      className={commonClasses}
      role="button"
      tabIndex={0}
      onClick={handleItemClick}
    >
      <Link
        href={navPath || '#'}
        className={`
          relative flex items-center
          ${iconOnly ? 'p-0' : 'p-3 w-full'}
          ${bgClass}
          rounded-xl
        `}
      >
        {isCurrentRoute && <div className={leftIndicatorClass} />}

        <div
          className={`flex items-center justify-center ${iconOnly ? 'w-12 h-12' : 'w-8 h-8 mr-4'}`}
        >
          {Icon && <Icon fill={iconColor} />}
        </div>

        {!iconOnly && (
          <div className="flex-grow">
            <h3 className={`font-medium ${textClass}`}>{label}</h3>
          </div>
        )}

        {hasDropdown && !iconOnly && (
          <ArrowDropDownIcon fillColor={iconColor} />
        )}
      </Link>

      {toggleState && children && (
        <div className="ml-12 mt-2 space-y-2">{children}</div>
      )}
    </div>
  );
};

SideBarDropdownItem.propTypes = {
  itemLabel: PropTypes.string.isRequired,
  itemPath: PropTypes.string.isRequired,
};

SidebarItem.propTypes = {
  Icon: PropTypes.elementType,
  label: PropTypes.string.isRequired,
  navPath: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
  toggleMethod: PropTypes.func,
  toggleState: PropTypes.bool,
  iconOnly: PropTypes.bool,
};

export default SidebarItem;
