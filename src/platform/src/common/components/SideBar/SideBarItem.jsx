import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import { useTheme } from '@/features/theme-customizer/hooks/useTheme';

export const SideBarDropdownItem = ({ itemLabel, itemPath }) => {
  const router = useRouter();
  const { theme, systemTheme, isSemiDarkEnabled } = useTheme();
  const [isMediumDevice, setIsMediumDevice] = useState(false);
  const currentRoute = router.pathname;
  const isCurrentRoute = currentRoute.includes(itemPath);

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
      : 'text-black';

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
      className={`block transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-md p-1`}
    >
      <div className="h-10 flex items-center">
        {(!isMediumDevice || itemLabel) && (
          <h3 className={`text-sm leading-5 ${textClass}`}>{itemLabel}</h3>
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
}) => {
  const router = useRouter();
  const { theme, systemTheme, isSemiDarkEnabled } = useTheme();
  const currentRoute = router.pathname;
  const isCurrentRoute =
    currentRoute === navPath || (navPath === '/Home' && currentRoute === '/');
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
      : 'text-black';

  const iconColor = isCurrentRoute
    ? 'text-primary'
    : isDarkMode
      ? 'text-white'
      : 'text-black';

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
    ${textClass}
    ${toggleState ? `${isDarkMode ? 'bg-gray-700' : 'bg-primary/10'} rounded-xl` : ''}
  `;

  const leftIndicatorClass = 'absolute -left-2 h-1/3 w-1 bg-primary rounded-xl';

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
          {Icon && <Icon className={`${iconColor}`} />}
        </div>

        {!iconOnly && (
          <div className="flex-grow">
            <h3 className={`font-medium ${textClass}`}>{label}</h3>
          </div>
        )}

        {hasDropdown && !iconOnly && (
          <ArrowDropDownIcon className={`${textClass}`} />
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
};

export default SidebarItem;
