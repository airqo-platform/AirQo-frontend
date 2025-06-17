import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import PropTypes from 'prop-types';
import { usePopper } from 'react-popper';
import { MdKeyboardArrowRight } from 'react-icons/md';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';

export const SideBarDropdownItem = ({ itemLabel, itemPath }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, systemTheme } = useTheme();
  const currentRoute = pathname;
  const isCurrentRoute = useMemo(() => {
    if (!itemPath) return false;
    return currentRoute === itemPath || currentRoute.startsWith(itemPath + '/');
  }, [currentRoute, itemPath]);
  // Determine dark mode
  const isDarkMode = useMemo(() => {
    if (theme === 'dark' || (theme === 'system' && systemTheme === 'dark'))
      return true;
    return false;
  }, [theme, systemTheme]);

  const handleClick = () => {
    router.push(itemPath);
  };

  return (
    <div
      className={`cursor-pointer py-2.5 px-3 w-full rounded-lg transition-all duration-300 ${
        isCurrentRoute
          ? isDarkMode
            ? 'bg-gray-700/30 text-primary'
            : 'bg-primary/10 text-primary'
          : isDarkMode
            ? 'text-gray-200 hover:bg-gray-700/20'
            : 'text-gray-600 hover:bg-gray-100'
      }`}
      onClick={handleClick}
    >
      <h3 className="font-normal text-sm">{itemLabel}</h3>
    </div>
  );
};

SideBarDropdownItem.propTypes = {
  itemLabel: PropTypes.string.isRequired,
  itemPath: PropTypes.string.isRequired,
};

/**
 * Subroute Popup Component
 * Displays a hover popup with subroute navigation items
 */
const SubroutePopup = ({
  referenceElement,
  subroutes,
  isVisible,
  isDarkMode,
  onSubrouteClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [popperElement, setPopperElement] = useState(null);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'right-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [24, -18], // Move popup 24px right (further past arrow) and 18px up
        },
      },
      {
        name: 'preventOverflow',
        options: {
          boundary: 'clippingParents',
          padding: 16,
          altBoundary: true,
        },
      },
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['right-end', 'left-start', 'left-end'],
        },
      },
    ],
    strategy: 'fixed', // Use fixed positioning to escape container constraints
  });

  if (!isVisible || !subroutes?.length) return null;

  // Debug logging for development
  if (isVisible && process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('🎯 Popup rendering:', {
      isVisible,
      subroutesCount: subroutes?.length,
      hasReference: !!referenceElement,
      strategy: 'portal to document.body',
    });
  }

  const popupContent = (
    <div
      ref={setPopperElement}
      style={{
        ...styles.popper,
        zIndex: 2147483647, // Maximum z-index value
        position: 'fixed',
      }}
      {...attributes.popper}
      className="pointer-events-auto"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-popup="subroute-popup"
    >
      {/* Extended invisible bridge to prevent popup from closing */}
      <div className="absolute -left-10 top-0 w-10 h-full bg-transparent pointer-events-auto" />

      <div
        className={`
          min-w-[260px] py-2 rounded-lg shadow-2xl border backdrop-blur-sm pointer-events-auto
          ${
            isDarkMode
              ? 'bg-gray-800/95 border-gray-600 shadow-black/60'
              : 'bg-white/95 border-gray-200 shadow-gray-900/20'
          }
          transform transition-all duration-200 ease-out
          hover:shadow-2xl
        `}
        style={{
          transform: 'translateZ(0)', // Force hardware acceleration
          willChange: 'transform', // Optimize for animations
        }}
      >
        {subroutes.map((subroute, index) => (
          <div
            key={subroute.path || index}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onSubrouteClick) {
                onSubrouteClick(e, subroute);
              }
            }}
            className={`
              cursor-pointer px-4 py-3 text-sm transition-all duration-150 ease-out
              first:rounded-t-lg last:rounded-b-lg
              ${
                isDarkMode
                  ? 'text-gray-200 hover:bg-gray-700/70 hover:text-white'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-800'
              }
            `}
          >
            <div className="flex items-center">
              {subroute.icon && (
                <subroute.icon
                  className={`w-4 h-4 mr-3 flex-shrink-0 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  size={16}
                />
              )}
              <span className="font-medium truncate">{subroute.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render popup in a portal to escape sidebar container constraints
  return createPortal(popupContent, document.body);
};

SubroutePopup.propTypes = {
  referenceElement: PropTypes.object,
  subroutes: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string,
      icon: PropTypes.elementType,
    }),
  ),
  isVisible: PropTypes.bool.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  onSubrouteClick: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
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
  subroutes = null,
  onSubrouteClick,
}) => {
  const pathname = usePathname();
  const { theme, systemTheme, isSemiDarkEnabled } = useTheme();
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const itemRef = useRef(null);
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
  const hasSubroutes = !!subroutes && subroutes.length > 0;

  // Enhanced hover system for seamless popup interaction
  const handleMouseEnter = useCallback(() => {
    if (!hasSubroutes || iconOnly) return;

    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }

    // Show popup immediately for responsive feel
    setIsHovering(true);
  }, [hasSubroutes, iconOnly, hoverTimeout]);

  const handleMouseLeave = useCallback(() => {
    if (!hasSubroutes || iconOnly) return;

    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }

    // Add generous delay to allow smooth mouse movement to popup
    const timeout = setTimeout(() => {
      setIsHovering(false);
    }, 500); // Increased delay for smooth transition

    setHoverTimeout(timeout);
  }, [hasSubroutes, iconOnly, hoverTimeout]);

  // Handle popup mouse events - these override the main item handlers
  const handlePopupMouseEnter = useCallback(() => {
    // Cancel any pending hide timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    // Ensure popup stays visible
    setIsHovering(true);
  }, [hoverTimeout]);

  const handlePopupMouseLeave = useCallback(() => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }

    // Hide popup quickly after leaving popup area
    const timeout = setTimeout(() => {
      setIsHovering(false);
    }, 150);

    setHoverTimeout(timeout);
  }, [hoverTimeout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

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
              {Icon && <Icon className={`${iconColor} w-5 h-5`} size={20} />}
            </div>
          ) : (
            // Expanded state - normal layout
            <>
              <div className="flex items-center justify-center w-5 h-5 mr-3">
                {Icon && <Icon className={`${iconColor} w-5 h-5`} size={20} />}
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
    <div className="relative">
      {/* Main sidebar item */}
      <div
        ref={itemRef}
        className={`${commonClasses} group`}
        role="button"
        tabIndex={0}
        onClick={handleItemClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link
          href={navPath || '#'}
          onClick={onClick}
          className={`
            relative flex items-center transition-all duration-200 ease-out
            ${
              iconOnly
                ? 'p-0 justify-center items-center w-12 h-12 mx-auto'
                : 'py-2.5 px-3 w-full'
            }
            ${bgClass}
            rounded-lg
            ${hasSubroutes && !iconOnly ? 'pr-2' : ''}
          `}
        >
          {isCurrentRoute && !iconOnly && (
            <div className={leftIndicatorClass} />
          )}

          {iconOnly ? (
            // Collapsed state - centered icon
            <div className="flex items-center justify-center w-full h-full">
              {Icon && <Icon className={`${iconColor} w-5 h-5`} size={20} />}
            </div>
          ) : (
            // Expanded state - normal layout
            <>
              <div className="flex items-center justify-center w-5 h-5 mr-3">
                {Icon && <Icon className={`${iconColor} w-5 h-5`} size={20} />}
              </div>
              <div className="flex-grow">
                <h3 className={`font-normal text-sm ${textClass}`}>{label}</h3>
              </div>
              {hasDropdown && (
                <ArrowDropDownIcon className={`${textClass} w-4 h-4`} />
              )}
              {hasSubroutes && !hasDropdown && (
                <MdKeyboardArrowRight
                  className={`${textClass} w-4 h-4 transition-transform duration-200 group-hover:translate-x-1`}
                />
              )}
            </>
          )}
        </Link>

        {toggleState && children && (
          <div className="ml-12 mt-2 space-y-2">{children}</div>
        )}
      </div>

      {/* Hover Popup for Subroutes - Enhanced for debugging */}
      {hasSubroutes && !iconOnly && (
        <SubroutePopup
          referenceElement={itemRef.current}
          subroutes={subroutes}
          isVisible={isHovering}
          isDarkMode={isDarkMode}
          onSubrouteClick={onSubrouteClick}
          onMouseEnter={handlePopupMouseEnter}
          onMouseLeave={handlePopupMouseLeave}
        />
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
  subroutes: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string,
      icon: PropTypes.elementType,
    }),
  ),
  onSubrouteClick: PropTypes.func,
};

export default SidebarItem;
