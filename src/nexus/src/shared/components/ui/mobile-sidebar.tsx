'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { useAppSelector, useAppDispatch } from '@/shared/hooks/redux';
import { toggleSidebar } from '@/shared/store/uiSlice';
import { Sidebar } from '@/shared/components/sidebar';

export const MobileSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const sidebarCollapsed = useAppSelector(state => state.ui.sidebarCollapsed);
  const asideRef = React.useRef<HTMLElement>(null);

  // Avoid SSR/hydration flicker: defer rendering until after client mount
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isVisible = mounted && isMobile && !sidebarCollapsed;

  // Escape key handler
  React.useEffect(() => {
    if (!isVisible) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch(toggleSidebar());
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, dispatch]);

  // Focus trap
  React.useEffect(() => {
    if (!isVisible || !asideRef.current) return;

    const aside = asideRef.current;
    const previousActive = document.activeElement;

    // Focus the sidebar on open
    aside.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = aside.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    aside.addEventListener('keydown', handleKeyDown);

    return () => {
      aside.removeEventListener('keydown', handleKeyDown);
      if (previousActive instanceof HTMLElement) {
        previousActive.focus();
      }
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Overlay backdrop */}
      <motion.div
        className="fixed inset-0 z-[200] bg-black/50 md:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => dispatch(toggleSidebar())}
      />

      {/* Mobile Sidebar */}
      <motion.aside
        ref={asideRef}
        className="fixed top-0 left-0 z-[210] h-full bg-background md:hidden"
        initial={{ x: -256 }}
        animate={{ x: 0 }}
        exit={{ x: -256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ width: 256 }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation sidebar"
        tabIndex={-1}
      >
        <div className="h-full overflow-y-auto border-r">
          <Sidebar />
        </div>
      </motion.aside>
    </>
  );
};
