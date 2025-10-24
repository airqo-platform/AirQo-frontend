'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import clsx from 'clsx';
import { AqXClose, AqMenu02 } from '@airqo/icons-react';

type Severity = 'info' | 'success' | 'error' | 'warning' | null;

interface FooterAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'filled' | 'outlined' | 'text' | 'ghost' | 'disabled';
}

interface WideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // Header (left area is dynamic)
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode; // optional right-side header content

  // Sidebar
  sidebar?: React.ReactNode;
  // Main content
  children: React.ReactNode;

  // Footer
  message?: string;
  messageSeverity?: Severity;
  onClear?: () => void;
  onCancel?: () => void;
  primary?: FooterAction | null;
  // Footer button visibility
  showClear?: boolean;
  showCancel?: boolean;

  // Component visibility controls
  showHeader?: boolean;
  showFooter?: boolean;
  showSidebar?: boolean;

  // sizing
  maxWidth?: string; // e.g. 'max-w-6xl'
  preventBackdropClose?: boolean;
}

const severityClass = (s: Severity) => {
  switch (s) {
    case 'success':
      return 'text-green-700 bg-green-50 dark:bg-green-950/20';
    case 'error':
      return 'text-red-700 bg-red-50 dark:bg-red-950/20';
    case 'warning':
      return 'text-amber-700 bg-amber-50 dark:bg-amber-950/20';
    case 'info':
      return 'text-blue-700 bg-blue-50 dark:bg-blue-950/20';
    default:
      return '';
  }
};

const WideDialog: React.FC<WideDialogProps> = ({
  isOpen,
  onClose,
  headerLeft,
  headerRight,
  sidebar,
  children,
  message,
  messageSeverity = null,
  onClear,
  onCancel,
  primary,
  showClear = true,
  showCancel = true,
  showHeader = true,
  showFooter = true,
  showSidebar = true,
  maxWidth = 'max-w-4xl',
  preventBackdropClose = false,
}) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // close on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (preventBackdropClose) return;
    if (e.target === e.currentTarget) onClose();
  };

  // compose footer
  const Footer = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
      <div className="flex items-center gap-3">
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={clsx(
                'px-3 py-1 rounded-md text-sm flex items-center',
                severityClass(messageSeverity)
              )}
              role={messageSeverity ? 'status' : undefined}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
        {showClear && (
          <Button variant="text" onClick={() => onClear?.()}>
            Clear
          </Button>
        )}
        {showCancel && (
          <Button variant="outlined" onClick={() => onCancel?.() || onClose()}>
            Cancel
          </Button>
        )}
        {primary && (
          <Button
            onClick={primary.onClick}
            disabled={primary.disabled}
            loading={primary.loading}
            variant={primary.variant || 'filled'}
            className="text-sm"
          >
            {primary.label}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="fixed inset-0 z-[10000] bg-black/40 dark:bg-black/80"
                  onClick={handleBackdropClick}
                />

                <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={clsx(
                      'w-full mx-auto bg-transparent max-h-[90vh]',
                      maxWidth
                    )}
                    style={{ height: '80vh' }}
                  >
                    <div
                      ref={dialogRef}
                      className="bg-white dark:bg-[#141516] rounded-lg shadow-lg overflow-hidden flex flex-col h-full"
                      role="dialog"
                      aria-modal="true"
                    >
                      {/* Header */}
                      {showHeader && (
                        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-2 sm:py-3 border-b border-border bg-muted/50">
                          <div className="flex items-center gap-3">
                            {/* hamburger - visible on small screens */}
                            <button
                              type="button"
                              className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-muted"
                              onClick={() => setSidebarOpen(s => !s)}
                              aria-label="Toggle sidebar"
                            >
                              <AqMenu02 className="w-5 h-5" />
                            </button>

                            <div>{headerLeft}</div>
                          </div>

                          <div className="flex items-center gap-3">
                            {headerRight}
                            {/* default close button on header end-right */}
                            <button
                              type="button"
                              aria-label="Close dialog"
                              className="p-2 rounded-md text-muted-foreground hover:bg-muted"
                              onClick={() => onClose()}
                            >
                              <AqXClose className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Body */}
                      <div className="flex flex-1 min-h-0">
                        {/* Sidebar (hidden on small) */}
                        {showSidebar && (
                          <aside className="hidden md:block w-48 md:w-64 border-r border-border bg-muted/50 p-3 sm:p-4 overflow-auto h-full">
                            {sidebar}
                          </aside>
                        )}

                        {/* Mobile sliding sidebar */}
                        <AnimatePresence>
                          {sidebarOpen && showSidebar && (
                            <motion.aside
                              initial={{ x: -280, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              exit={{ x: -280, opacity: 0 }}
                              transition={{ type: 'tween', duration: 0.18 }}
                              className="md:hidden fixed left-4 top-20 bottom-20 z-[10002] w-64 bg-card rounded-lg shadow-lg p-3 sm:p-4 overflow-auto border border-border"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="text-sm font-semibold">
                                  Menu
                                </div>
                                <button
                                  type="button"
                                  className="p-1 rounded-md text-muted-foreground hover:bg-muted"
                                  onClick={() => setSidebarOpen(false)}
                                  aria-label="Close sidebar"
                                >
                                  <AqXClose className="w-4 h-4" />
                                </button>
                              </div>
                              {sidebar}
                            </motion.aside>
                          )}
                        </AnimatePresence>

                        {/* Main content and footer */}
                        <div className="flex flex-col flex-1 min-h-0">
                          <main className="flex-1 p-4 sm:p-6 overflow-auto min-h-0">
                            {children}
                          </main>

                          {/* Footer */}
                          {showFooter && (
                            <div className="px-4 sm:px-6 py-2 sm:py-3 border-t border-border bg-muted/50">
                              {Footer}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};

export default WideDialog;
