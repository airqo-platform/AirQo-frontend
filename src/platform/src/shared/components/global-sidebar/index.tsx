'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/shared/store';
import { toggleGlobalSidebar } from '@/shared/store/uiSlice';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { AqXClose } from '@airqo/icons-react';
import { useMediaQuery } from 'react-responsive';
import { NavItem } from '@/shared/components/sidebar/components/nav-item';
import { useUserActions } from '@/shared/hooks';
import { getSidebarConfig } from '@/shared/components/sidebar/config';
import { useRBAC } from '@/shared/hooks';

export const GlobalSidebar: React.FC = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.ui.globalSidebarOpen);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const sidebarRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);
  const { activeGroup } = useUserActions();
  const { hasRole, hasPermission } = useRBAC();
  const [imageError, setImageError] = React.useState(false);

  // Helper function to determine if current group is AirQo
  const isAirQoGroup = React.useMemo(() => {
    if (!activeGroup) return true;
    return (
      // Check if title matches AIRQO (case insensitive)
      activeGroup.title?.toLowerCase() === 'airqo' ||
      // Check if organization slug is airqo
      activeGroup.organizationSlug?.toLowerCase() === 'airqo' ||
      // Check if no organization slug (default user flow)
      !activeGroup.organizationSlug ||
      // Fallback: check if title contains airqo
      activeGroup.title?.toLowerCase().includes('airqo')
    );
  }, [activeGroup]);

  const handleClose = useCallback(() => {
    dispatch(toggleGlobalSidebar());
  }, [dispatch]);

  // Determine logo display based on active group
  const { logoSrc, logoAlt, showFallback } = React.useMemo(() => {
    if (!activeGroup) {
      return {
        logoSrc: '/images/airqo_logo.svg',
        logoAlt: 'AirQo Logo',
        showFallback: false,
      };
    }

    if (isAirQoGroup) {
      return {
        logoSrc: '/images/airqo_logo.svg',
        logoAlt: 'AirQo Logo',
        showFallback: false,
      };
    } else {
      const hasValidProfilePicture =
        activeGroup.profilePicture && activeGroup.profilePicture.trim() !== '';
      return {
        logoSrc: hasValidProfilePicture
          ? activeGroup.profilePicture
          : '/images/airqo_logo.svg',
        logoAlt: `${activeGroup.title} Logo`,
        showFallback: !hasValidProfilePicture,
      };
    }
  }, [activeGroup, isAirQoGroup]);

  const handleImageError = () => {
    setImageError(true);
  };

  const shouldShowFallback = showFallback || imageError;

  // Determine flow type and org slug
  const { flow, orgSlug } = React.useMemo(() => {
    if (!activeGroup) {
      return { flow: 'user' as const, orgSlug: undefined };
    }

    return {
      flow: isAirQoGroup ? ('user' as const) : ('organization' as const),
      orgSlug: activeGroup.organizationSlug || undefined,
    };
  }, [activeGroup, isAirQoGroup]);

  // Get global navigation items (global config)
  const globalNavItems = React.useMemo(() => {
    const config = getSidebarConfig('global');
    let basePath = '/user';
    let targetPath = '/favorites';
    if (flow === 'organization' && orgSlug) {
      basePath = `/org/${orgSlug}`;
      targetPath = '/dashboard';
    }
    return config.flatMap(group =>
      group.items
        .filter(item => {
          // Only show admin-panel if user has GROUP_MANAGEMENT permission
          if (item.id === 'admin-panel') {
            return hasPermission('GROUP_MANAGEMENT');
          }
          return true;
        })
        .map(item => {
          let href = item.href;
          // Change Administrative Panel href based on permissions
          if (item.id === 'admin-panel') {
            href = hasRole('AIRQO_SUPER_ADMIN')
              ? '/admin/org-requests'
              : '/admin/members';
          } else {
            href = href.replace('/data-access', `${basePath}${targetPath}`);
          }
          return {
            ...item,
            href,
          };
        })
    );
  }, [flow, orgSlug, hasRole, hasPermission]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      setTimeout(() => {
        sidebarRef.current?.focus();
      }, 0);
    } else {
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  // Escape key handler and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClose]);

  const sidebarWidth = isMobile ? 'w-full' : 'w-64';

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[10000] bg-black/40 dark:bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            onClick={handleClose}
            aria-label="Close sidebar"
          />
          {/* Sidebar */}
          <motion.div
            className={`fixed left-0 top-0 h-full ${sidebarWidth} bg-background z-[10001] shadow-lg`}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <Card
              ref={sidebarRef}
              className="h-full p-4"
              role="dialog"
              aria-modal="true"
              aria-label="Global sidebar"
              tabIndex={-1}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {shouldShowFallback ? (
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      {activeGroup?.title?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                  ) : (
                    <Image
                      src={logoSrc}
                      alt={logoAlt}
                      width={120}
                      height={32}
                      className="w-auto h-6"
                      onError={handleImageError}
                    />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  aria-label="Close sidebar"
                >
                  <AqXClose />
                </Button>
              </div>
              <div className="space-y-1">
                {globalNavItems.map(item => (
                  <NavItem key={item.id} item={item} onClick={handleClose} />
                ))}
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
