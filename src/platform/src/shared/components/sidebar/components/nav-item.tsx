'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { NavItemProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { AqChevronRight } from '@airqo/icons-react';

export const NavItem = React.memo<NavItemProps>(
  ({
    item,
    isCollapsed = false,
    onClick,
    className,
    enableSubroutes = false,
  }) => {
    const pathname = usePathname();
    const [showSubroutes, setShowSubroutes] = React.useState(false);
    const [hoverTimeout, setHoverTimeout] =
      React.useState<NodeJS.Timeout | null>(null);
    const navItemRef = React.useRef<HTMLDivElement>(null);

    const isActive =
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`) ||
      (item.subroutes &&
        item.subroutes.some(
          subroute =>
            pathname === subroute.href ||
            pathname.startsWith(`${subroute.href}/`)
        ));
    const Icon = item.icon;
    const hasSubroutes = item.subroutes && item.subroutes.length > 0;

    const baseStyles = cn(
      'relative flex items-center transition-all duration-300 ease-in-out',
      'focus-visible:outline-none'
    );

    const textClass = isActive ? 'text-primary' : 'text-foreground';
    const iconColor = isActive ? 'text-primary' : 'text-foreground';
    const bgClass = isActive
      ? 'bg-primary/10'
      : 'hover:bg-muted dark:hover:text-foreground';

    // Handle disabled state
    const isDisabled = item.disabled;
    const disabledStyles = isDisabled
      ? 'opacity-50 cursor-not-allowed pointer-events-none'
      : '';

    // Check if we're in a mobile/narrow context or touch device
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
      const checkMobile = () => {
        // Check for mobile conditions: small screen OR touch-only device
        const isSmallScreen = window.innerWidth <= 768;
        const isTouchDevice =
          'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isLikelyMobile =
          isSmallScreen || (isTouchDevice && window.innerWidth <= 1024);
        setIsMobile(isLikelyMobile);
      };

      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Only show subroutes if explicitly enabled and not on mobile
    const shouldShowSubroutes = hasSubroutes && !isMobile && enableSubroutes;

    // Handle hover for subroutes (desktop only)
    const handleMouseEnter = () => {
      if (shouldShowSubroutes && !isCollapsed) {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          setHoverTimeout(null);
        }
        setShowSubroutes(true);
      }
    };

    const handleMouseLeave = () => {
      if (shouldShowSubroutes && !isCollapsed) {
        const timeout = setTimeout(() => {
          setShowSubroutes(false);
        }, 150); // Small delay to allow moving to submenu
        setHoverTimeout(timeout);
      }
    };

    const handleSubrouteMouseEnter = () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        setHoverTimeout(null);
      }
    };

    const handleSubrouteMouseLeave = () => {
      if (shouldShowSubroutes) {
        const timeout = setTimeout(() => {
          setShowSubroutes(false);
        }, 150);
        setHoverTimeout(timeout);
      }
    };

    // On mobile, always navigate to the main link directly and close sidebar
    const handleClick = (e: React.MouseEvent) => {
      // On mobile, navigate to the main link and ensure onClick is called to close sidebar
      if (isMobile) {
        // Don't prevent default - let navigation happen
        // onClick callback will close the sidebar
        onClick?.();
        return;
      }

      // Desktop behavior for items with subroutes
      if (shouldShowSubroutes) {
        e.preventDefault();
        setShowSubroutes(!showSubroutes);
      } else {
        // Desktop items without subroutes should also close sidebar if needed
        onClick?.();
      }
    }; // Cleanup timeout on unmount
    React.useEffect(() => {
      return () => {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }
      };
    }, [hoverTimeout]);

    // Calculate popup position (desktop only)
    const getPopupPosition = () => {
      if (!navItemRef.current) return {};

      const rect = navItemRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const popupWidth = 320; // w-80 = 320px

      // Check if there's enough space on the right
      const spaceOnRight = viewportWidth - rect.right;

      return {
        left: spaceOnRight >= popupWidth ? 'left-full ml-2' : 'right-full mr-2',
      };
    };

    const popupPositionClass = getPopupPosition().left || 'left-full ml-2';

    if (isCollapsed) {
      return (
        <div className="relative flex items-center justify-center">
          <Link
            href={item.href}
            onClick={onClick}
            className={cn(
              baseStyles,
              'w-10 h-10 rounded-lg justify-center',
              bgClass,
              disabledStyles,
              className
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className={cn('flex-shrink-0 w-5 h-5', iconColor)} />
            <span className="sr-only">{item.label}</span>
          </Link>
        </div>
      );
    }

    return (
      <div className="relative" ref={navItemRef}>
        {/* Active indicator - positioned outside the link container */}
        {isActive && (
          <div className="absolute top-0 bottom-0 flex items-center -left-2">
            <span
              className="w-1 bg-primary rounded-md h-1/2"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Navigation Link */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Link
            href={item.href}
            onClick={e => {
              handleClick(e);
              // The handleClick function manages whether to call onClick based on context
            }}
            className={cn(
              baseStyles,
              'w-full gap-3 py-2.5 px-3 rounded-lg',
              bgClass,
              disabledStyles,
              className
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {/* Icon */}
            <div className="flex items-center justify-center flex-shrink-0 w-5 h-5">
              <Icon className={cn('w-5 h-5', iconColor)} />
            </div>

            {/* Label */}
            <div className="flex-1 min-w-0">
              <h3
                className={cn('font-normal text-sm truncate', textClass)}
                title={item.label}
              >
                {item.label}
              </h3>
            </div>

            {/* Chevron for subroutes - only show on desktop */}
            {shouldShowSubroutes && (
              <AqChevronRight
                className={cn(
                  'w-4 h-4 transition-transform flex-shrink-0',
                  showSubroutes && 'rotate-90',
                  textClass
                )}
              />
            )}

            {/* Badge */}
            {item.badge && (
              <span
                className="flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs text-white bg-red-500 rounded-full flex-shrink-0"
                aria-label={`${item.badge} notifications`}
              >
                {item.badge}
              </span>
            )}
          </Link>

          {/* Subroutes Popup - Desktop only */}
          <AnimatePresence>
            {shouldShowSubroutes && showSubroutes && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'absolute z-[10002] w-80 bg-white border border-gray-200 rounded-lg shadow-lg',
                  `${popupPositionClass} top-0`
                )}
                style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                }}
                onMouseEnter={handleSubrouteMouseEnter}
                onMouseLeave={handleSubrouteMouseLeave}
              >
                <div className="p-3">
                  <div className="text-xs font-medium text-muted-foreground px-3 py-2 uppercase tracking-wide border-b border-border mb-2">
                    {item.label}
                  </div>
                  <div className="space-y-1">
                    {item.subroutes!.map(subroute => {
                      const subrouteIsActive =
                        pathname === subroute.href ||
                        pathname.startsWith(`${subroute.href}/`);
                      return (
                        <Link
                          key={subroute.id}
                          href={subroute.href}
                          onClick={() => {
                            setShowSubroutes(false);
                            onClick?.(); // Close sidebar
                          }}
                          className={cn(
                            'flex flex-col gap-1 p-3 rounded-md transition-colors',
                            subrouteIsActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-foreground hover:bg-muted',
                            subroute.disabled &&
                              'opacity-50 cursor-not-allowed pointer-events-none'
                          )}
                        >
                          <span className="font-medium text-sm">
                            {subroute.label}
                          </span>
                          {subroute.description && (
                            <span className="text-xs text-muted-foreground leading-relaxed">
                              {subroute.description}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }
);

NavItem.displayName = 'NavItem';
