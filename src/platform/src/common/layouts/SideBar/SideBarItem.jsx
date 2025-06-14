import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import PropTypes from 'prop-types';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';

export const SideBarDropdownItem = ({ itemLabel, itemPath }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, systemTheme, isSemiDarkEnabled } = useTheme();
  const [isMediumDevice, setIsMediumDevice] = useState(false);
  const currentRoute = pathname;
  const isCurrentRoute = useMemo(() => {
    if (!itemPath) return false;
    return currentRoute === itemPath || currentRoute.startsWith(itemPath + '/');
  }, [currentRoute, itemPath]);

  // Determine dark mode
  const isDarkMode = useMemo(() => {
    if (theme === 'dark' || (theme === 'system' && systemTheme === 'dark'))
      return true;
    return isSemiDarkEnabled;
  }, [theme, systemTheme, isSemiDarkEnabled]);

  // Dynamic text color
  const textClass = isCurrentRoute
    ? 'text-primary'
    : isDarkMode
      ? 'text-gray-200'
      : 'text-gray-600';

  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      router.push(itemPath);
    },
    [itemPath, router],
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const onChange = (e) => setIsMediumDevice(e.matches);
    setIsMediumDevice(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <Link
      href={itemPath}
      onClick={handleClick}
      className={`block transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg p-2 ml-2`}
    >
      <div className="h-8 flex items-center">
        {(!isMediumDevice || itemLabel) && (
          <h3 className={`text-sm font-normal leading-5 ${textClass}`}>
            {itemLabel}
          </h3>
        )}
      </div>
    </Link>
  );
};

SideBarDropdownItem.propTypes = {
  itemLabel: PropTypes.string.isRequired,
  itemPath: PropTypes.string.isRequired,
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
  isExternal = false,
}) => {
  const pathname = usePathname();
  const { theme, systemTheme, isSemiDarkEnabled } = useTheme();
  const currentRoute = pathname;
  const isCurrentRoute = useMemo(() => {
    if (!navPath) return false;
    // Exact match for root/home routes
    if (navPath === '/' && currentRoute === '/') return true;
    if (
      navPath === '/user/Home' &&
      (currentRoute === '/' || currentRoute === '/user/Home')
    )
      return true;

    // Exact match for other routes
    if (currentRoute === navPath) return true;

    // For dropdown items, check if current route starts with the navPath
    if (children && currentRoute.startsWith(navPath)) return true;

    return false;
  }, [currentRoute, navPath, children]);
  const hasDropdown = !!children;

  // Determine dark mode
  const isDarkMode = useMemo(() => {
    if (theme === 'dark' || (theme === 'system' && systemTheme === 'dark'))
      return true;
    return isSemiDarkEnabled;
  }, [theme, systemTheme, isSemiDarkEnabled]);

  // Text and icon color
  const textClass = isCurrentRoute
    ? 'text-primary'
    : isDarkMode
      ? 'text-gray-200'
      : 'text-gray-600';

  const iconColor = isCurrentRoute
    ? 'text-primary'
    : isDarkMode
      ? 'text-white'
      : 'text-gray-600';

  // Background classes
  const bgClass = isCurrentRoute
    ? isDarkMode
      ? 'bg-gray-700/30'
      : 'bg-primary/10'
    : isDarkMode
      ? 'hover:bg-gray-700/20'
      : 'hover:bg-gray-100';

  const commonClasses = `
    cursor-pointer transition-all duration-300 ease-in-out
    ${toggleState ? `${isDarkMode ? 'bg-gray-700' : 'bg-primary/10'} rounded-lg` : ''}
  `;

  const leftIndicatorClass = 'absolute -left-2 h-1/3 w-1 bg-primary rounded-lg';

  const handleItemClick = hasDropdown ? toggleMethod : onClick;
  // If it's an external link, handle it differently
  if (isExternal) {
    const handleExternalClick = () => {
      window.open(navPath, '_blank', 'noopener,noreferrer');
      if (onClick) onClick(); // Close sidebar or perform other actions
    };

    return (
      <div
        className={commonClasses}
        role="button"
        tabIndex={0}
        onClick={handleExternalClick}
      >
        <div
          className={`
            relative flex items-center cursor-pointer
            ${
              iconOnly
                ? 'p-0 justify-center items-center w-12 h-12 mx-auto'
                : 'py-2.5 px-3 w-full'
            }
            ${bgClass}
            rounded-lg
          `}
        >
          {iconOnly ? (
            // Collapsed state - centered icon
            <div className="flex items-center justify-center w-full h-full">
              {Icon && (
                <Icon
                  className={`${iconColor} w-5 h-5`}
                  width="20"
                  height="20"
                />
              )}
            </div>
          ) : (
            // Expanded state - normal layout
            <>
              <div className="flex items-center justify-center w-5 h-5 mr-3">
                {Icon && (
                  <Icon
                    className={`${iconColor} w-5 h-5`}
                    width="20"
                    height="20"
                  />
                )}
              </div>
              <div className="flex-grow">
                <h3 className={`font-normal text-sm ${textClass}`}>{label}</h3>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={commonClasses}
      role="button"
      tabIndex={0}
      onClick={handleItemClick}
    >
      <Link
        href={navPath || '#'}
        onClick={onClick}
        className={`
          relative flex items-center
          ${
            iconOnly
              ? 'p-0 justify-center items-center w-12 h-12 mx-auto'
              : 'py-2.5 px-3 w-full'
          }
          ${bgClass}
          rounded-lg
        `}
      >
        {isCurrentRoute && !iconOnly && <div className={leftIndicatorClass} />}

        {iconOnly ? (
          // Collapsed state - centered icon
          <div className="flex items-center justify-center w-full h-full">
            {Icon && (
              <Icon className={`${iconColor} w-5 h-5`} width="20" height="20" />
            )}
          </div>
        ) : (
          // Expanded state - normal layout
          <>
            <div className="flex items-center justify-center w-5 h-5 mr-3">
              {Icon && (
                <Icon
                  className={`${iconColor} w-5 h-5`}
                  width="20"
                  height="20"
                />
              )}
            </div>
            <div className="flex-grow">
              <h3 className={`font-normal text-sm ${textClass}`}>{label}</h3>
            </div>
            {hasDropdown && (
              <ArrowDropDownIcon className={`${textClass} w-4 h-4`} />
            )}
          </>
        )}
      </Link>

      {toggleState && children && (
        <div className="ml-12 mt-2 space-y-2">{children}</div>
      )}
    </div>
  );
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
  isExternal: PropTypes.bool,
};

export default SidebarItem;
