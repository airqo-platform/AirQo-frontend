'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/shared/store';
import { toggleGlobalSidebar } from '@/shared/store/uiSlice';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { AqXClose } from '@airqo/icons-react';
import { useMediaQuery } from 'react-responsive';

export const GlobalSidebar: React.FC = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.ui.globalSidebarOpen);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const sidebarRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  const handleClose = useCallback(() => {
    dispatch(toggleGlobalSidebar());
  }, [dispatch]);

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

  const sidebarWidth = isMobile ? 'w-full' : 'w-80';

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
                <h2 className="text-lg font-semibold">Global Sidebar</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  aria-label="Close sidebar"
                >
                  <AqXClose />
                </Button>
              </div>
              <div className="space-y-4">
                {/* Add sidebar content here */}
                <p>Sidebar content goes here.</p>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
