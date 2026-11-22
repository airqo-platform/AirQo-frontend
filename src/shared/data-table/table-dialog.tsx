'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AqXClose } from '@airqo/icons-react';
import { Button } from '../ui/button';

/*
 * The dialog the table opens (column filter, export columns).
 *
 * Trimmed copy of Nexus's ReusableDialog (nexus/src/shared/components/ui/dialog.tsx),
 * the same component as Vertex's components/shared/dialog/ReusableDialog.tsx.
 * The full dialog belongs with the rest of that Reusable kit; this trimmed copy is
 * kept local so the table builds on its own. Markup and classes are Nexus's: muted header and
 * footer bars, close button, focus trap, Escape, body scroll lock, portal.
 *
 * Changes from Nexus:
 * - framer-motion is replaced by tailwindcss-animate enter classes (no exit
 *   animation). Beacon has no framer-motion.
 * - Nexus's Button is the shared shadcn Button; Nexus's variant names are kept
 *   in the props and mapped below.
 * - Dropped: `primaryTooltip` (flowbite-react) and `loading` on actions.
 *
 * Stacking: Nexus puts the backdrop at z-[10000] and the dialog at z-[10001],
 * which is the popover layer in the shared stacking order (see README).
 */
type ActionVariant =
  | 'filled'
  | 'outlined'
  | 'text'
  | 'ghost'
  | 'disabled'
  | 'danger';

interface ActionButton {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  padding?: string;
  variant?: ActionVariant;
}

const BUTTON_VARIANT = {
  filled: 'default',
  outlined: 'outline',
  text: 'link',
  ghost: 'ghost',
  disabled: 'default',
  danger: 'destructive',
} as const;

interface CardProps {
  className?: string;
  contentClassName?: string;
  padding?: string;
  rounded?: boolean;
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
      rounded,
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
    const baseClasses = ['bg-card', rounded ? 'rounded-lg' : '', 'shadow-md', className]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={baseClasses} {...props}>
        {header && (
          <div
            className={headerProps?.className || 'p-4 border-b border-border'}
          >
            {header}
          </div>
        )}
        <div className={`${padding} ${contentClassName}`}>{children}</div>
        {footer && (
          <div
            className={footerProps?.className || 'p-4 border-t border-border'}
          >
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

export interface TableDialogProps {
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
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  preventBackdropClose?: boolean;
  className?: string;

  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const TableDialog: React.FC<TableDialogProps> = ({
  isOpen,
  onClose,
  children,

  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10 dark:bg-primary/20',
  showCloseButton = true,
  customHeader,

  maxHeight = 'max-h-96',
  contentClassName = '',

  showFooter = true,
  primaryAction,
  secondaryAction,
  customFooter,

  size = 'lg',
  preventBackdropClose = false,
  className = '',
  contentAreaClassName = '',

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

  // Body scroll lock — separate effect to avoid re-running on onClose changes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Focus trap and Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape' && !preventBackdropClose) {
        onClose();
        return;
      }

      // Focus trap: keep Tab / Shift+Tab inside the dialog
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, preventBackdropClose]);

  // Size mapping for dialog widths
  const sizeMap: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    full: 'max-w-full',
  };

  const dialogSizeClass = sizeMap[size] || 'max-w-lg';

  const createHeaderContent = () => {
    if (customHeader) {
      return customHeader;
    }

    if (!title && !Icon && !showCloseButton) {
      return null;
    }

    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBgColor}`}
            >
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
          )}
          {(title || subtitle) && (
            <div className="min-w-0">
              {title && (
                <h2 className="min-w-0 break-words text-lg text-foreground">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="min-w-0 break-words text-xs text-muted-foreground mt-0.5">
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
            className="flex-shrink-0 p-2 text-muted-foreground transition-colors duration-200 rounded-lg hover:text-foreground hover:bg-muted"
            aria-label="Close dialog"
          >
            <AqXClose className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

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
            variant={BUTTON_VARIANT[secondaryAction.variant || 'outlined']}
            disabled={
              secondaryAction.disabled || secondaryAction.variant === 'disabled'
            }
            className={`${secondaryAction.className || 'text-sm'} ${secondaryAction.padding || 'px-4 py-2'}`}
          >
            {secondaryAction.label}
          </Button>
        )}
        {primaryAction && (
          <Button
            onClick={primaryAction.onClick}
            variant={BUTTON_VARIANT[primaryAction.variant || 'filled']}
            disabled={
              primaryAction.disabled || primaryAction.variant === 'disabled'
            }
            className={`${primaryAction.className || 'text-sm'} ${primaryAction.padding || 'px-4 py-2'}`}
          >
            {primaryAction.label}
          </Button>
        )}
      </div>
    );
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[10000] bg-black/40 dark:bg-black/80 animate-in fade-in-0 duration-200"
        onClick={preventBackdropClose ? undefined : onClose}
        aria-label="Close dialog"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-[10001] flex items-center justify-center overflow-y-auto p-2 sm:p-4">
        <div className="w-full py-2 sm:py-0 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-200">
          <Card
            ref={dialogRef}
            className={`relative ${dialogSizeClass} mx-auto flex w-full max-h-[calc(100vh-1rem)] flex-col overflow-hidden sm:max-h-[calc(100vh-2rem)] ${className}`}
            contentClassName={`${maxHeight} min-h-0 flex-1 overflow-y-auto ${contentClassName}`}
            padding="p-0"
            rounded={true}
            header={createHeaderContent()}
            headerProps={{
              className:
                'px-4 py-3 border-b border-border bg-muted/50 sm:px-6 sm:py-4',
            }}
            footer={createFooterContent()}
            footerProps={{
              className:
                'px-4 py-3 border-t border-border bg-muted/50 sm:px-6 sm:py-4',
            }}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel || title}
            aria-describedby={ariaDescribedBy}
            tabIndex={-1}
          >
            <div className={contentAreaClassName || 'px-4 py-4 sm:px-6 sm:py-5'}>
              {children}
            </div>
          </Card>
        </div>
      </div>
    </>,
    document.body
  );
};

export default TableDialog;
