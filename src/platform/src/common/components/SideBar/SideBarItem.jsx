import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '@/features/theme-customizer/hooks/useTheme';
import PropTypes from 'prop-types';

/**
 * SideBarDropdownItem Component - Renders a dropdown item in the sidebar
 */
export const SideBarDropdownItem = ({
  itemLabel,
  itemPath,
  textColor = '',
  hoverClass = '',
}) => {
  const router = useRouter();
  const { theme, isSemiDarkEnabled } = useTheme();
  const [isMediumDevice, setIsMediumDevice] = useState(false);

  // Get current route and check if it contains navPath
  const currentRoute = router.pathname;
  const isCurrentRoute = currentRoute.includes(itemPath);

  // Determine text color based on active state and theme
  const getTextColor = () => {
    if (isCurrentRoute) {
      return 'text-blue-500 dark:text-blue-400';
    }

    if (textColor) return textColor;

    return isSemiDarkEnabled || theme === 'dark'
      ? 'text-gray-200'
      : 'text-gray-800';
  };

  // Handle navigation
  const changePath = (e) => {
    e.preventDefault();
    router.push(itemPath);
  };

  // Check for medium device
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleMediaQueryChange = (e) => {
      setIsMediumDevice(e.matches);
    };

    setIsMediumDevice(mediaQuery.matches);

    // Use the appropriate event listener method based on browser support
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaQueryChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleMediaQueryChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaQueryChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleMediaQueryChange);
      }
    };
  }, []);

  // Determine hover background class
  const getHoverBgClass = () => {
    if (hoverClass) return hoverClass;

    return isSemiDarkEnabled || theme === 'dark'
      ? 'hover:bg-gray-700'
      : 'hover:bg-gray-100';
  };

  return (
    <a href={itemPath} onClick={changePath}>
      <div
        className={`
          py-2 px-3 rounded-lg flex items-center
          ${
            isCurrentRoute
              ? 'bg-blue-900/20 dark:bg-blue-950/50'
              : getHoverBgClass()
          }
        `}
      >
        {(!isMediumDevice || itemLabel) && (
          <h3
            className={`
              text-sm font-medium
              ${getTextColor()}
            `}
          >
            {itemLabel}
          </h3>
        )}
      </div>
    </a>
  );
};

/**
 * SidebarItem Component - Renders an item in the sidebar
 */
const SidebarItem = ({
  Icon,
  label,
  navPath = '#', // Default value to prevent undefined
  children,
  onClick,
  toggleMethod,
  toggleState,
  iconOnly = false,
  textColor = '',
  hoverClass = '',
  className = '',
  dropdown = false,
}) => {
  const router = useRouter();
  const { theme, isSemiDarkEnabled } = useTheme();

  // Get current route and check if matching
  const currentRoute = router.pathname;
  const isCurrentRoute =
    navPath !== '#' &&
    (currentRoute === navPath || (navPath === '/Home' && currentRoute === '/'));
  const hasDropdown = dropdown || !!children;

  // Determine text color based on active state and theme
  const getTextColor = () => {
    if (isCurrentRoute) {
      return 'text-blue-500 dark:text-blue-400';
    }

    if (textColor) return textColor;

    return isSemiDarkEnabled || theme === 'dark'
      ? 'text-gray-200'
      : 'text-gray-800';
  };

  // Determine hover background class
  const getHoverBgClass = () => {
    if (hoverClass) return hoverClass;

    return isSemiDarkEnabled || theme === 'dark'
      ? 'hover:bg-gray-700/50'
      : 'hover:bg-gray-100';
  };

  // Determine background for active items
  const getActiveBgClass = () => {
    return isSemiDarkEnabled || theme === 'dark'
      ? 'bg-blue-900/20 dark:bg-blue-950/40'
      : 'bg-blue-50';
  };

  // Determine the icon color based on active state and theme
  const getIconColor = () => {
    if (isCurrentRoute) {
      return isSemiDarkEnabled || theme === 'dark'
        ? '#60a5fa' // blue-400
        : '#3b82f6'; // blue-500
    }

    return isSemiDarkEnabled || theme === 'dark'
      ? '#f9fafb' // white/gray-50
      : '#1f2937'; // gray-800
  };

  // Handle the click event
  const handleClick = (e) => {
    if (hasDropdown) {
      e.preventDefault();
      if (toggleMethod) toggleMethod();
    } else if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  // Render the icon with appropriate color
  const renderIcon = () => (
    <div
      className={`
        flex items-center justify-center flex-shrink-0
        ${iconOnly ? 'w-12 h-12' : 'w-6 h-6 mr-3'}
        ${getTextColor()}
      `}
    >
      {Icon && <Icon fill={getIconColor()} />}
    </div>
  );

  // Render the content (label and dropdown arrow)
  const renderContent = () => (
    <>
      {!iconOnly && (
        <div className="flex-grow overflow-hidden">
          <span
            className={`
              font-medium text-sm truncate block
              ${getTextColor()}
            `}
          >
            {label}
          </span>
        </div>
      )}
      {hasDropdown && !iconOnly && (
        <div className={`ml-2 ${getTextColor()}`}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className={`transform transition-transform ${toggleState ? 'rotate-180' : 'rotate-0'}`}
          >
            <path
              d="M7 10l5 5 5-5"
              stroke={getIconColor()}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </>
  );

  // For items with dropdown or onClick handlers, don't use Link
  if (hasDropdown || onClick) {
    return (
      <div
        className={`
          relative rounded-xl overflow-hidden
          ${toggleState && hasDropdown ? 'mb-2' : ''}
        `}
        role="button"
        tabIndex={0}
      >
        <div
          className={`
            relative flex items-center w-full
            ${iconOnly ? 'justify-center p-2' : 'p-3'}
            ${isCurrentRoute ? getActiveBgClass() : getHoverBgClass()}
            rounded-xl transition-all duration-200
            ${className}
          `}
          onClick={handleClick}
        >
          {isCurrentRoute && (
            <div
              className={`
              absolute left-0 top-1/2 transform -translate-y-1/2 h-4/5 w-1 
              bg-blue-600 dark:bg-blue-400 rounded-r-md
            `}
            />
          )}
          {renderIcon()}
          {renderContent()}
        </div>

        {toggleState && children && (
          <div className="mt-1 space-y-1 pl-3">{children}</div>
        )}
      </div>
    );
  }

  // For regular navigation items, use Link
  return (
    <div
      className={`
        relative rounded-xl overflow-hidden
      `}
      role="button"
      tabIndex={0}
    >
      <Link href={navPath || '#'}>
        <div
          className={`
            relative flex items-center w-full
            ${iconOnly ? 'justify-center p-2' : 'p-3'}
            ${isCurrentRoute ? getActiveBgClass() : getHoverBgClass()}
            rounded-xl transition-all duration-200
            ${className}
          `}
        >
          {isCurrentRoute && (
            <div
              className={`
              absolute left-0 top-1/2 transform -translate-y-1/2 h-4/5 w-1 
              bg-blue-600 dark:bg-blue-400 rounded-r-md
            `}
            />
          )}
          {renderIcon()}
          {renderContent()}
        </div>
      </Link>
    </div>
  );
};

// PropTypes
SideBarDropdownItem.propTypes = {
  itemLabel: PropTypes.string.isRequired,
  itemPath: PropTypes.string.isRequired,
  textColor: PropTypes.string,
  hoverClass: PropTypes.string,
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
  textColor: PropTypes.string,
  hoverClass: PropTypes.string,
  className: PropTypes.string,
  dropdown: PropTypes.bool,
};

export default SidebarItem;
