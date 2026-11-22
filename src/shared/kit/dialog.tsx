'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AqHelpCircle, AqXClose } from '@airqo/icons-react';
import { Button, type ButtonVariant } from './button';

/*
 * The dialog Vertex and Nexus open everywhere (Nexus calls its props type
 * `ReusableDialogProps`, Vertex calls the component `ReusableDialog`).
 *
 * Copied from nexus/src/shared/components/ui/dialog.tsx (about 68 Nexus files).
 * Vertex's components/shared/dialog/ReusableDialog.tsx (about 37 files) has the
 * same props, header (icon circle, title, subtitle, close) and footer
 * (secondary then primary action).
 *
 * Nexus's version is the base: theme tokens (bg-card, border-border, a muted
 * header and footer) where Vertex hard-codes white and grays, a portal to
 * <body>, a Tab focus trap, `loading` on actions and mobile padding.
 * Added from Vertex, all optional:
 * - A stack of open dialogs, so with one dialog on top of another only the top
 *   one closes on Escape and the page only scrolls again once the last one
 *   closes. Nexus closed every open dialog on Escape and unlocked scrolling
 *   when the inner one closed.
 * - Escape is ignored while a Radix popover is open inside the dialog.
 * - Sizes xs and 4xl to 7xl (Nexus stopped at 3xl, plus `full`).
 * - `zIndex`. Vertex built it into a class name (`z-[${zIndex}]`), which
 *   Tailwind never generates, so it did nothing; it is now an inline style.
 * - `showFeedbackButton` / `onFeedbackClick`: Vertex's question-mark button that
 *   opened its feedback form. Shown only when `onFeedbackClick` is passed.
 * - `banner`: Vertex rendered its BannerSlot between the header and the body
 *   and cleared it on close; the app now passes the banner and clears it itself.
 * - Action `variant` also accepts the shadcn names Vertex callers use
 *   (outline, secondary, ghost, link, destructive, default).
 *
 * Nexus wrapped the primary action in flowbite-react's Tooltip when
 * `primaryTooltip` was set; that is now the native `title`, so flowbite-react
 * isn't needed.
 *
 * Drift: Vertex focuses the first field when it opens, Nexus the dialog itself
 * (kept). Vertex's overlay is z-[999]; Nexus's is z-[10000], above the shared
 * shadcn popovers (z-[10001] is the dialog itself), so see the stacking order
 * in README.md before mixing these with ../ui.
 */
const openDialogStack: symbol[] = [];

type ShadcnVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link';

const SHADCN_TO_KIT: Record<ShadcnVariant, ButtonVariant> = {
  default: 'filled',
  destructive: 'danger',
  outline: 'outlined',
  secondary: 'outlined',
  ghost: 'text',
  link: 'text',
};

const toKitVariant = (
  variant: ButtonVariant | ShadcnVariant | undefined,
  fallback: ButtonVariant
): ButtonVariant => {
  if (!variant) return fallback;
  return (SHADCN_TO_KIT as Record<string, ButtonVariant>)[variant] ?? variant;
};

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
  /** Rendered between the header and the scrolling body (Vertex's banner slot). */
  beforeContent?: React.ReactNode;
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
      beforeContent,
      footer,
      footerProps,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'bg-card',
      rounded ? radius || 'rounded-lg' : '',
      shadow || 'shadow-md',
      bordered ? `border ${borderColor || 'border-border'}` : '',
      background || '',
      className,
    ]
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
        {beforeContent}
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

export interface DialogAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  padding?: string;
  variant?: ButtonVariant | ShadcnVariant;
}

export type DialogSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'
  | 'full';

export interface ReusableDialogProps {
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
  /** Show the question-mark button (needs `onFeedbackClick`). Defaults to true. */
  showFeedbackButton?: boolean;
  /** Opens the app's feedback form; gets the dialog title (or aria label) as context. */
  onFeedbackClick?: (context: string | undefined) => void;
  customHeader?: React.ReactNode;

  /** Shown between the header and the body, e.g. an inline error banner. */
  banner?: React.ReactNode;

  // Content props
  maxHeight?: string;
  contentClassName?: string;
  contentAreaClassName?: string;

  // Footer props
  showFooter?: boolean;
  primaryAction?: DialogAction;
  secondaryAction?: DialogAction;
  primaryTooltip?: string;
  customFooter?: React.ReactNode;

  // Modal props
  size?: DialogSize;
  preventBackdropClose?: boolean;
  className?: string;
  /** Overlay z-index; the dialog sits one above it. Defaults to 10000. */
  zIndex?: number;

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
  showFeedbackButton = true,
  onFeedbackClick,
  customHeader,

  banner,

  // Content props
  maxHeight = 'max-h-96',
  contentClassName = '',

  // Footer props
  showFooter = true,
  primaryAction,
  secondaryAction,
  primaryTooltip,
  customFooter,

  // Modal props
  size = 'lg',
  preventBackdropClose = false,
  className = '',
  contentAreaClassName = '',
  zIndex = 10000,

  // Accessibility
  ariaLabel,
  ariaDescribedBy,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);
  const dialogId = useRef<symbol>(Symbol('reusable-dialog'));

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

  // Latest callbacks for the key handler, so the stack effect below depends on
  // isOpen only. Re-running it on a new onClose identity would move this dialog
  // to the top of the stack and Escape would close the wrong one.
  const onCloseRef = useRef(onClose);
  const preventBackdropCloseRef = useRef(preventBackdropClose);
  useEffect(() => {
    onCloseRef.current = onClose;
    preventBackdropCloseRef.current = preventBackdropClose;
  }, [onClose, preventBackdropClose]);

  // Body scroll lock, Escape and focus trap. Only the topmost open dialog reacts.
  useEffect(() => {
    if (!isOpen) return;

    const id = dialogId.current;
    openDialogStack.push(id);
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      const isTopmost = openDialogStack[openDialogStack.length - 1] === id;
      if (!isTopmost) return;

      if (e.key === 'Escape') {
        // Don't close while a Radix popover (combobox, etc.) is open on top.
        const hasOpenPopover = document.querySelector(
          '[data-radix-popper-content-wrapper]'
        );
        if (!preventBackdropCloseRef.current && !hasOpenPopover) {
          onCloseRef.current();
        }
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

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      const index = openDialogStack.indexOf(id);
      if (index !== -1) openDialogStack.splice(index, 1);
      if (openDialogStack.length === 0) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen]);

  // Size mapping for dialog widths
  const sizeMap: Record<string, string> = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const dialogSizeClass = sizeMap[size] || 'max-w-lg';

  const showFeedback = showFeedbackButton && !!onFeedbackClick;

  // Create header content using CardWrapper's built-in header system
  const createHeaderContent = () => {
    if (customHeader) {
      return customHeader;
    }

    if (!title && !Icon && !showCloseButton && !showFeedback) {
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
        <div className="flex items-center flex-shrink-0 gap-1">
          {showFeedback && (
            <button
              type="button"
              onClick={() => onFeedbackClick?.(title || ariaLabel)}
              className="flex-shrink-0 p-2 text-muted-foreground transition-colors duration-200 rounded-lg hover:text-foreground hover:bg-muted"
              title="Report an issue or share feedback"
              aria-label="Report an issue or share feedback"
              data-dialog-chrome="true"
            >
              <AqHelpCircle className="w-4 h-4" />
            </button>
          )}
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

    const primaryButton = primaryAction ? (
      <Button
        onClick={primaryAction.onClick}
        variant={toKitVariant(primaryAction.variant, 'filled')}
        disabled={primaryAction.disabled}
        loading={primaryAction.loading}
        className={primaryAction.className || 'text-sm'}
        paddingStyles={primaryAction.padding || 'px-4 py-2'}
      >
        {primaryAction.label}
      </Button>
    ) : null;

    return (
      <div className="flex items-center justify-end w-full gap-3">
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant={toKitVariant(secondaryAction.variant, 'outlined')}
            disabled={secondaryAction.disabled}
            loading={secondaryAction.loading}
            className={secondaryAction.className || 'text-sm'}
            paddingStyles={secondaryAction.padding || 'px-4 py-2'}
          >
            {secondaryAction.label}
          </Button>
        )}
        {primaryButton &&
          (primaryTooltip ? (
            <div title={primaryTooltip}>{primaryButton}</div>
          ) : (
            primaryButton
          ))}
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
                  className="fixed inset-0 bg-black/40 dark:bg-black/80"
                  style={{ zIndex }}
                  onClick={preventBackdropClose ? undefined : onClose}
                  aria-label="Close dialog"
                />

                {/* Dialog */}
                <div
                  className="fixed inset-0 flex items-center justify-center overflow-y-auto p-2 sm:p-4"
                  style={{ zIndex: zIndex + 1 }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    className="w-full py-2 sm:py-0"
                  >
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
                      beforeContent={banner}
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
                      <div
                        className={
                          contentAreaClassName || 'px-4 py-4 sm:px-6 sm:py-5'
                        }
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

export { ReusableDialog };
export default ReusableDialog;
