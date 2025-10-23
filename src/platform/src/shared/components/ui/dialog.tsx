'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { AqXClose } from '@airqo/icons-react';

interface ActionButton {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  padding?: string;
  variant?: 'filled' | 'outlined' | 'text' | 'ghost' | 'disabled';
}

interface CardProps {
  className?: string;
  contentClassName?: string;
  bordered?: boolean;
  borderColor?: string;
  rounded?: boolean;
  radius?: string;
  background?: string;
  shadow?: string;
  padding?: string;
  header?: React.ReactNode;
  headerProps?: { className?: string };
  footer?: React.ReactNode;
  footerProps?: { className?: string };
  role?: string;
  'aria-modal'?: boolean | 'true';
  'aria-label'?: string;
  'aria-describedby'?: string;
  tabIndex?: number;
  children?: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className = '',
      contentClassName = '',
      bordered,
      borderColor,
      rounded,
      radius,
      background,
      shadow,
      padding = 'p-4',
      header,
      headerProps,
      footer,
      footerProps,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'bg-white dark:bg-[#1d1f20]',
      rounded ? radius || 'rounded-lg' : '',
      shadow || 'shadow-md',
      bordered
        ? `border ${borderColor || 'border-gray-200 dark:border-gray-700'}`
        : '',
      background || '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={baseClasses} {...props}>
        {header && (
          <div
            className={
              headerProps?.className ||
              'p-4 border-b border-gray-200 dark:border-gray-700'
            }
          >
            {header}
          </div>
        )}
        <div className={`${padding} ${contentClassName}`}>{children}</div>
        {footer && (
          <div
            className={
              footerProps?.className ||
              'p-4 border-t border-gray-200 dark:border-gray-700'
            }
          >
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface ActionButton {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  padding?: string;
  variant?: 'filled' | 'outlined' | 'text' | 'ghost' | 'disabled';
}

interface ReusableDialogProps {
  // Core props
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;

  // Header props
  title?: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBgColor?: string;
  showCloseButton?: boolean;
  customHeader?: React.ReactNode;

  // Content props
  maxHeight?: string;
  contentClassName?: string;
  contentAreaClassName?: string;

  // Footer props
  showFooter?: boolean;
  primaryAction?: ActionButton;
  secondaryAction?: ActionButton;
  customFooter?: React.ReactNode;

  // Modal props
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  preventBackdropClose?: boolean;
  className?: string;

  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const ReusableDialog: React.FC<ReusableDialogProps> = ({
  // Core props
  isOpen,
  onClose,
  children,

  // Header props
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10 dark:bg-primary/20',
  showCloseButton = true,
  customHeader,

  // Content props
  maxHeight = 'max-h-96',
  contentClassName = '',

  // Footer props
  showFooter = true,
  primaryAction,
  secondaryAction,
  customFooter,

  // Modal props
  size = 'lg',
  preventBackdropClose = false,
  className = '',
  contentAreaClassName = '',

  // Accessibility
  ariaLabel,
  ariaDescribedBy,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      // Use timeout to ensure dialog is rendered before focusing
      setTimeout(() => {
        dialogRef.current?.focus();
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
      if (e.key === 'Escape' && isOpen && !preventBackdropClose) {
        onClose();
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
  }, [isOpen, onClose, preventBackdropClose]);

  // Size mapping for dialog widths
  const sizeMap: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  const dialogSizeClass = sizeMap[size] || 'max-w-lg';

  // Create header content using CardWrapper's built-in header system
  const createHeaderContent = () => {
    if (customHeader) {
      return customHeader;
    }

    if (!title && !Icon && !showCloseButton) {
      return null;
    }

    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBgColor}`}
            >
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
          )}
          {(title || subtitle) && (
            <div>
              {title && (
                <h2 className="text-lg font-semibold  dark:text-white">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 p-2 text-gray-400 transition-colors duration-200 rounded-lg hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close dialog"
          >
            <AqXClose className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  // Create footer content using CardWrapper's built-in footer system
  const createFooterContent = () => {
    if (customFooter) {
      return customFooter;
    }

    if (!showFooter || (!primaryAction && !secondaryAction)) {
      return null;
    }

    return (
      <div className="flex items-center justify-end w-full gap-3">
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant={secondaryAction.variant || 'outlined'}
            disabled={secondaryAction.disabled}
            className={secondaryAction.className || 'text-sm'}
            paddingStyles={secondaryAction.padding || 'px-4 py-2'}
          >
            {secondaryAction.label}
          </Button>
        )}
        {primaryAction && (
          <Button
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            loading={primaryAction.loading}
            className={
              primaryAction.className ||
              'text-sm bg-primary hover:bg-primary/90 focus:ring-primary text-white disabled:opacity-50'
            }
            paddingStyles={primaryAction.padding || 'px-4 py-2'}
          >
            {primaryAction.label}
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="fixed inset-0 z-[10000] bg-black/40 dark:bg-black/80"
                  onClick={preventBackdropClose ? undefined : onClose}
                  aria-label="Close dialog"
                />

                {/* Dialog */}
                <div className="fixed inset-0 flex items-center justify-center z-[10001] p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    className="w-full"
                  >
                    <Card
                      ref={dialogRef}
                      className={`relative ${dialogSizeClass} mx-auto overflow-hidden ${className}`}
                      contentClassName={`${maxHeight} overflow-y-auto ${contentClassName}`}
                      padding="p-0"
                      rounded={true}
                      header={createHeaderContent()}
                      headerProps={{
                        className:
                          'px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50',
                      }}
                      footer={createFooterContent()}
                      footerProps={{
                        className:
                          'px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50',
                      }}
                      role="dialog"
                      aria-modal="true"
                      aria-label={ariaLabel || title}
                      aria-describedby={ariaDescribedBy}
                      tabIndex={-1}
                    >
                      <div
                        className={contentAreaClassName || 'px-6 py-4 flex-1'}
                      >
                        {children}
                      </div>
                    </Card>
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

export default ReusableDialog;
