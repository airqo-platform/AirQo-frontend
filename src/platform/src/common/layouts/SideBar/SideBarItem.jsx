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
 * Subroute Popup Component with FIXED z-index and stable hover
 */
const SubroutePopup = ({
  referenceElement,
  subroutes,
  isVisible,
  isDarkMode,
  onSubrouteClick,
  onPopupHover,
}) => {
  const [popperElement, setPopperElement] = useState(null);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'right-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [8, 0], // 8px gap from sidebar
        },
      },
      {
        name: 'preventOverflow',
        options: {
          boundary: 'viewport',
          padding: 20,
        },
      },
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['right-end', 'left-start', 'left-end'],
        },
      },
    ],
    strategy: 'fixed',
  });

  const handleSubrouteSelect = useCallback(
    (e, subroute) => {
      e.preventDefault();
      e.stopPropagation();

      if (onSubrouteClick) {
        onSubrouteClick(e, subroute);
      }
    },
    [onSubrouteClick],
  );

  if (!isVisible || !subroutes?.length) return null;

  const popupContent = (
    <div
      ref={setPopperElement}
      style={{
        ...styles.popper,
        zIndex: 10000, // Higher than backdrop (9999)
        position: 'fixed',
      }}
      {...attributes.popper}
      onMouseEnter={() => onPopupHover?.(true)}
      onMouseLeave={() => onPopupHover?.(false)}
      className="pointer-events-auto"
    >
      {/* Hover bridge - invisible connection area */}
      <div
        className="absolute -left-2 top-0 w-2 h-full bg-transparent pointer-events-auto"
        onMouseEnter={() => onPopupHover?.(true)}
        onMouseLeave={() => onPopupHover?.(false)}
      />

      {/* Main popup */}
      <div
        className={`
          min-w-[280px] max-w-[360px] py-2 rounded-xl shadow-2xl border pointer-events-auto
          transform transition-all duration-200 ease-out
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          ${
            isDarkMode
              ? 'bg-gray-900 border-gray-700 shadow-black/80'
              : 'bg-white border-gray-200 shadow-gray-900/30'
          }
        `}
        style={{
          transformOrigin: 'left center',
          backdropFilter: 'blur(8px)',
        }}
        onMouseEnter={() => onPopupHover?.(true)}
        onMouseLeave={() => onPopupHover?.(false)}
      >
        {subroutes.map((subroute, index) => (
          <div
            key={subroute.path || `subroute-${index}`}
            onClick={(e) => handleSubrouteSelect(e, subroute)}
            className={`
              group cursor-pointer px-4 py-3 text-sm transition-all duration-150
              flex items-center gap-3 mx-1 rounded-lg
              ${
                isDarkMode
                  ? 'text-gray-200 hover:bg-gray-800 hover:text-white active:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
              }
            `}
          >
            {subroute.icon && (
              <subroute.icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isDarkMode
                    ? 'text-gray-400 group-hover:text-primary'
                    : 'text-gray-500 group-hover:text-primary'
                }`}
                size={16}
              />
            )}
            <span className="font-medium truncate text-left flex-1">
              {subroute.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

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
  onPopupHover: PropTypes.func,
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

  // Simplified hover state management
  const [showPopup, setShowPopup] = useState(false);
  const itemRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const currentRoute = pathname;
  const isCurrentRoute = useMemo(() => {
    if (!navPath) return false;
    if (navPath === '/' && currentRoute === '/') return true;
    if (
      navPath === '/user/Home' &&
      (currentRoute === '/' || currentRoute === '/user/Home')
    )
      return true;
    if (currentRoute === navPath) return true;
    if (children && currentRoute.startsWith(navPath)) return true;
    return false;
  }, [currentRoute, navPath, children]);

  const hasDropdown = !!children;
  const hasSubroutes = !!subroutes && subroutes.length > 0;

  const isDarkMode = useMemo(() => {
    if (theme === 'dark' || (theme === 'system' && systemTheme === 'dark'))
      return true;
    return isSemiDarkEnabled;
  }, [theme, systemTheme, isSemiDarkEnabled]);

  // Clear any pending timeouts
  const clearHoverTimeout = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  // Handle item hover
  const handleItemHover = useCallback(
    (isHovering) => {
      if (!hasSubroutes || iconOnly) return;

      clearHoverTimeout();

      if (isHovering) {
        // Show popup immediately
        setShowPopup(true);
      } else {
        // Hide popup after delay
        hoverTimeoutRef.current = setTimeout(() => {
          setShowPopup(false);
        }, 300);
      }
    },
    [hasSubroutes, iconOnly, clearHoverTimeout],
  );

  // Handle popup hover
  const handlePopupHover = useCallback(
    (isHovering) => {
      clearHoverTimeout();

      if (isHovering) {
        // Keep popup visible
        setShowPopup(true);
      } else {
        // Hide popup after shorter delay
        hoverTimeoutRef.current = setTimeout(() => {
          setShowPopup(false);
        }, 150);
      }
    },
    [clearHoverTimeout],
  );

  // Handle subroute clicks
  const handleSubrouteClick = useCallback(
    (e, subroute) => {
      e.preventDefault();
      e.stopPropagation();

      // Hide popup immediately
      clearHoverTimeout();
      setShowPopup(false);

      // Navigate
      if (subroute.path) {
        if (
          subroute.path.startsWith('http') ||
          subroute.path.includes('/admin')
        ) {
          window.location.href = subroute.path;
        } else {
          window.location.href = subroute.path;
        }
      }

      // Call parent handlers
      if (onSubrouteClick) {
        onSubrouteClick(e, subroute);
      }

      if (onClick) {
        setTimeout(() => onClick(), 50);
      }
    },
    [onSubrouteClick, onClick, clearHoverTimeout],
  );

  // Cleanup
  useEffect(() => {
    return () => {
      clearHoverTimeout();
    };
  }, [clearHoverTimeout]);

  // Styling
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

  // External link handling
  if (isExternal) {
    const handleExternalClick = () => {
      window.open(navPath, '_blank', 'noopener,noreferrer');
      if (onClick) onClick();
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
            ${iconOnly ? 'p-0 justify-center items-center w-12 h-12 mx-auto' : 'py-2.5 px-3 w-full'}
            ${bgClass} rounded-lg
          `}
        >
          {iconOnly ? (
            <div className="flex items-center justify-center w-full h-full">
              {Icon && <Icon className={`${iconColor} w-5 h-5`} size={20} />}
            </div>
          ) : (
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
      <div
        ref={itemRef}
        className={`${commonClasses} group`}
        role="button"
        tabIndex={0}
        onClick={handleItemClick}
        onMouseEnter={() => handleItemHover(true)}
        onMouseLeave={() => handleItemHover(false)}
      >
        <Link
          href={navPath || '#'}
          onClick={onClick}
          className={`
            relative flex items-center transition-all duration-200 ease-out
            ${iconOnly ? 'p-0 justify-center items-center w-12 h-12 mx-auto' : 'py-2.5 px-3 w-full'}
            ${bgClass} rounded-lg
          `}
        >
          {isCurrentRoute && !iconOnly && (
            <div className={leftIndicatorClass} />
          )}

          {iconOnly ? (
            <div className="flex items-center justify-center w-full h-full">
              {Icon && <Icon className={`${iconColor} w-5 h-5`} size={20} />}
            </div>
          ) : (
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
                  className={`${textClass} w-4 h-4 transition-transform duration-200 ${
                    showPopup ? 'translate-x-1' : 'group-hover:translate-x-0.5'
                  }`}
                />
              )}
            </>
          )}
        </Link>

        {toggleState && children && (
          <div className="ml-12 mt-2 space-y-2">{children}</div>
        )}
      </div>

      {/* Popup for subroutes */}
      {hasSubroutes && !iconOnly && (
        <SubroutePopup
          referenceElement={itemRef.current}
          subroutes={subroutes}
          isVisible={showPopup}
          isDarkMode={isDarkMode}
          onSubrouteClick={handleSubrouteClick}
          onPopupHover={handlePopupHover}
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
