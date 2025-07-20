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

/**
 * Enhanced SidebarItem Component with Simplified Route Matching
 *
 * New simplified usage with matcher prop:
 *
 * Simple string matcher:
 * <SidebarItem label="Admin Panel" navPath="/admin/users" matcher="/admin/users" />
 *
 * Object matcher with options:
 * <SidebarItem
 *   label="Organization Dashboard"
 *   navPath="/org/{slug}/dashboard"
 *   matcher={{ pattern: "/org/{slug}/dashboard", orgSlug: "acme", exact: false }}
 * />
 *
 * Legacy usage (still supported):
 * <SidebarItem
 *   label="Dashboard"
 *   navPath="/user/dashboard"
 *   flow="user"
 *   subroutes={[...]}
 * />
 */

// Enhanced route matching utility
const createRouteMatcher = () => {
  const parseMatcherConfig = (config) => {
    if (typeof config === 'string') {
      // Simple string matcher
      return { type: 'simple', pattern: config };
    }

    if (typeof config === 'object' && config !== null) {
      // Object-based matcher with more options
      return {
        type: config.type || 'simple',
        pattern: config.pattern || config.path,
        exact: config.exact || false,
        includeSubroutes: config.includeSubroutes !== false,
        orgSlug: config.orgSlug,
        flow: config.flow,
      };
    }

    return null;
  };

  const resolvePathWithSlug = (path, orgSlug) => {
    if (!path || !orgSlug) return path;
    return path.replace(/\{slug\}/g, orgSlug);
  };

  return {
    isRouteActive: (
      currentRoute,
      navPath,
      matcherConfig,
      subroutes = [],
      hasChildren = false,
    ) => {
      if (!navPath) return false;

      const config = parseMatcherConfig(matcherConfig);

      // If no matcher config, use legacy logic
      if (!config) {
        return createLegacyMatcher().isRouteActive(
          currentRoute,
          navPath,
          subroutes,
          hasChildren,
        );
      }

      const resolvedNavPath = resolvePathWithSlug(navPath, config.orgSlug);
      const resolvedPattern = resolvePathWithSlug(
        config.pattern,
        config.orgSlug,
      );

      // Handle root route specially
      if (resolvedNavPath === '/' && currentRoute === '/') return true;

      // Handle user home route mapping
      if (
        resolvedNavPath === '/user/Home' &&
        (currentRoute === '/' || currentRoute === '/user/Home')
      ) {
        return true;
      }

      // Exact match
      if (currentRoute === resolvedNavPath || currentRoute === resolvedPattern)
        return true;

      // Non-exact matching
      if (!config.exact) {
        // Check if current route starts with nav path
        if (currentRoute.startsWith(resolvedNavPath)) return true;

        // Check if current route starts with pattern
        if (resolvedPattern && currentRoute.startsWith(resolvedPattern))
          return true;

        // Check subroutes if enabled
        if (config.includeSubroutes && subroutes.length > 0) {
          return subroutes.some((subroute) => {
            if (!subroute.path) return false;
            const resolvedSubroutePath = resolvePathWithSlug(
              subroute.path,
              config.orgSlug,
            );
            return (
              currentRoute === resolvedSubroutePath ||
              currentRoute.startsWith(resolvedSubroutePath + '/')
            );
          });
        }
      }

      // Legacy behavior for dropdown children
      if (hasChildren && currentRoute.startsWith(resolvedNavPath)) {
        return true;
      }

      return false;
    },

    getNavPath: (basePath, matcherConfig) => {
      const config = parseMatcherConfig(matcherConfig);
      if (!config || !config.orgSlug) return basePath;
      return resolvePathWithSlug(basePath, config.orgSlug);
    },
  };
};

// Legacy matcher for backwards compatibility
const createLegacyMatcher = () => {
  return {
    isRouteActive: (
      currentRoute,
      navPath,
      subroutes = [],
      hasChildren = false,
    ) => {
      if (!navPath) return false;

      // Handle root route specially
      if (navPath === '/' && currentRoute === '/') return true;

      // Handle user home route mapping
      if (
        navPath === '/user/Home' &&
        (currentRoute === '/' || currentRoute === '/user/Home')
      ) {
        return true;
      }

      // Exact match
      if (currentRoute === navPath) return true;

      // Generic matching - check if current route starts with nav path
      if (currentRoute.startsWith(navPath)) return true;

      // Check subroutes
      if (subroutes.length > 0) {
        return subroutes.some((subroute) => {
          if (!subroute.path) return false;
          return (
            currentRoute === subroute.path ||
            currentRoute.startsWith(subroute.path + '/')
          );
        });
      }

      // Legacy behavior for dropdown children
      if (hasChildren && currentRoute.startsWith(navPath)) {
        return true;
      }

      return false;
    },
  };
};

export const SideBarDropdownItem = ({
  itemLabel,
  itemPath,
  matcher,
  // Legacy props for backwards compatibility
  flow,
  orgSlug,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, systemTheme } = useTheme();
  const currentRoute = pathname;

  // Create matcher config from props
  const matcherConfig = useMemo(() => {
    if (matcher) return matcher;

    // Backwards compatibility: convert legacy props to matcher config
    if (flow || orgSlug) {
      return {
        type: 'legacy',
        pattern: itemPath,
        flow,
        orgSlug,
      };
    }

    return null;
  }, [matcher, flow, orgSlug, itemPath]);

  const routeMatcher = useMemo(() => createRouteMatcher(), []);

  const isCurrentRoute = useMemo(() => {
    return routeMatcher.isRouteActive(currentRoute, itemPath, matcherConfig);
  }, [currentRoute, itemPath, matcherConfig, routeMatcher]);

  const isDarkMode = useMemo(() => {
    if (theme === 'dark' || (theme === 'system' && systemTheme === 'dark'))
      return true;
    return false;
  }, [theme, systemTheme]);

  const handleClick = () => {
    const navPath = routeMatcher.getNavPath(itemPath, matcherConfig);
    router.push(navPath);
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
  matcher: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      pattern: PropTypes.string,
      exact: PropTypes.bool,
      includeSubroutes: PropTypes.bool,
      orgSlug: PropTypes.string,
      type: PropTypes.string,
    }),
  ]),
  // Legacy props (deprecated but supported)
  flow: PropTypes.oneOf(['user', 'organization', 'generic']),
  orgSlug: PropTypes.string,
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
  subroutes = [],
  onSubrouteClick,
  matcher, // New prop for simplified route matching
  // Legacy props for backwards compatibility
  flow,
  orgSlug,
}) => {
  const pathname = usePathname();
  const { theme, systemTheme, isSemiDarkEnabled } = useTheme();

  // Create matcher config from props
  const matcherConfig = useMemo(() => {
    if (matcher) return matcher;

    // Backwards compatibility: convert legacy props to matcher config
    if (flow || orgSlug) {
      return {
        type: 'legacy',
        pattern: navPath,
        flow,
        orgSlug,
      };
    }

    return null;
  }, [matcher, flow, orgSlug, navPath]);

  const routeMatcher = useMemo(() => createRouteMatcher(), []);

  // Simplified hover state management
  const [showPopup, setShowPopup] = useState(false);
  const itemRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const currentRoute = pathname;

  // Enhanced route matching with simplified matcher
  const isCurrentRoute = useMemo(() => {
    const hasChildren = !!children;
    return routeMatcher.isRouteActive(
      currentRoute,
      navPath,
      matcherConfig,
      subroutes,
      hasChildren,
    );
  }, [currentRoute, navPath, matcherConfig, subroutes, children, routeMatcher]);

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

  // Handle subroute clicks with matcher awareness
  const handleSubrouteClick = useCallback(
    (e, subroute) => {
      e.preventDefault();
      e.stopPropagation();

      // Hide popup immediately
      clearHoverTimeout();
      setShowPopup(false);

      // Navigate with matcher-aware path resolution
      if (subroute.path) {
        const processedPath = routeMatcher.getNavPath(
          subroute.path,
          matcherConfig,
        );

        if (
          processedPath.startsWith('http') ||
          processedPath.includes('/admin')
        ) {
          window.location.href = processedPath;
        } else {
          window.location.href = processedPath;
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
    [onSubrouteClick, onClick, clearHoverTimeout, routeMatcher, matcherConfig],
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

  // Get processed nav path for rendering
  const processedNavPath = routeMatcher.getNavPath(navPath, matcherConfig);

  // External link handling
  if (isExternal) {
    const handleExternalClick = () => {
      window.open(processedNavPath, '_blank', 'noopener,noreferrer');
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
          href={processedNavPath || '#'}
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
  matcher: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      pattern: PropTypes.string,
      exact: PropTypes.bool,
      includeSubroutes: PropTypes.bool,
      orgSlug: PropTypes.string,
      type: PropTypes.string,
    }),
  ]),
  // Legacy props (deprecated but supported)
  flow: PropTypes.oneOf(['user', 'organization', 'generic']),
  orgSlug: PropTypes.string,
};

export default SidebarItem;
