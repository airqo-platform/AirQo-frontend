'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { bottomNavItems } from '@/shared/components/sidebar/config';
import { useUserActions } from '@/shared/hooks';

interface BottomNavigationProps {
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  className,
}) => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const { activeGroup } = useUserActions();

  // Determine current flow
  const flow = React.useMemo(() => {
    if (!activeGroup) return 'user';

    const isAirQoGroup =
      // Check if title matches AIRQO (case insensitive)
      activeGroup.title?.toLowerCase() === 'airqo' ||
      // Check if organization slug is airqo
      activeGroup.organizationSlug?.toLowerCase() === 'airqo' ||
      // Check if no organization slug (default user flow)
      !activeGroup.organizationSlug ||
      // Fallback: check if title contains airqo
      activeGroup.title?.toLowerCase().includes('airqo');

    return isAirQoGroup ? 'user' : 'organization';
  }, [activeGroup]);

  // Get navigation items for current flow
  const navItems = React.useMemo(() => {
    const items = bottomNavItems[flow];

    // If org flow and orgSlug provided, replace placeholders with actual slug
    if (flow === 'organization' && activeGroup?.organizationSlug) {
      return items.map(item => ({
        ...item,
        href: item.href.replace(
          '/org/',
          `/org/${activeGroup.organizationSlug}/`
        ),
      }));
    }

    return items;
  }, [flow, activeGroup?.organizationSlug]);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navigation when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Hide navigation when scrolling down (after 100px from top)
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden',
            className
          )}
        >
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex flex-col items-center justify-center rounded-lg px-3 py-2 text-xs transition-colors hover:bg-accent"
                >
                  <motion.div
                    className="relative mb-1"
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 transition-colors',
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    />
                    {isActive && (
                      <motion.div
                        layoutId="bottomNavIndicator"
                        className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"
                        initial={false}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.div>
                  <span
                    className={cn(
                      'font-medium transition-colors',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};
