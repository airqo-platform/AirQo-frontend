"use client";

import { Toaster as Sonner, toast as sonnerToast } from 'sonner';
import React from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

type ToasterProps = React.ComponentProps<typeof Sonner>;

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastBodyProps extends ToastOptions {
  onClose: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const VARIANT_CONFIG: Record<
  ToastVariant,
  {
    stripe: string;
    titleColor: string;
    icon?: React.ReactNode;
  }
> = {
  success: {
    stripe: 'bg-emerald-500',
    titleColor: 'text-foreground',
  },
  error: {
    stripe: 'bg-rose-500',
    titleColor: 'text-foreground',
  },
  warning: {
    stripe: 'bg-amber-500',
    titleColor: 'text-foreground',
  },
  info: {
    stripe: 'bg-sky-500',
    titleColor: 'text-foreground',
  },
};

const DEFAULT_DURATION = 5000;
const DEFAULT_VARIANT: ToastVariant = 'info';

// ============================================================================
// ToastBody Component
// ============================================================================

const ToastBody: React.FC<ToastBodyProps> = ({
  title,
  description,
  variant = DEFAULT_VARIANT,
  onClose,
}) => {
  const config = VARIANT_CONFIG[variant];

  return (
    <div className="flex items-stretch w-full py-1 pl-1">
      {/* Left colored stripe - with spacing from edge */}
      <div
        className={`w-1.5 ${config.stripe} flex-shrink-0 rounded-full`}
        role="presentation"
      />

      {/* Content area */}
      <div className="flex items-start justify-between flex-1 px-4 py-3">
        <div className="flex-1 min-w-0 pr-3">
          {title && (
            <div
              className={`text-[15px] leading-tight mb-0.5 font-semibold ${config.titleColor}`}
            >
              {title}
            </div>
          )}
          {description && (
            <div className="text-[13px] leading-relaxed text-muted-foreground font-medium">
              {description}
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="flex-shrink-0 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

ToastBody.displayName = 'ToastBody';

// ============================================================================
// Toaster Component
// ============================================================================

const Toaster: React.FC<ToasterProps> = ({ ...props }) => {
  return (
    <Sonner
      position="top-center"
      expand={false}
      richColors={false}
      closeButton={false}
      duration={DEFAULT_DURATION}
      gap={12}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: 'w-full z-[9999]',
        },
      }}
      {...props}
    />
  );
};

Toaster.displayName = 'Toaster';

// ============================================================================
// Toast Helper Functions
// ============================================================================

const showToast = (options: ToastOptions) => {
  const {
    title,
    description,
    variant = DEFAULT_VARIANT,
    duration = DEFAULT_DURATION,
  } = options;

  const toastId = sonnerToast.custom(
    id => (
      <div
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        className="w-full min-w-[360px] max-w-[560px] bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
      >
        <ToastBody
          title={title}
          description={description}
          variant={variant}
          onClose={() => sonnerToast.dismiss(id)}
        />
      </div>
    ),
    { duration }
  );

  return toastId;
};

// Convenience methods for different toast types
const toast = {
  success: (
    title: React.ReactNode,
    description?: React.ReactNode,
    duration?: number
  ) =>
    showToast({
      title,
      description,
      variant: 'success',
      duration,
    }),

  error: (
    title: React.ReactNode,
    description?: React.ReactNode,
    duration?: number
  ) =>
    showToast({
      title,
      description,
      variant: 'error',
      duration,
    }),

  warning: (
    title: React.ReactNode,
    description?: React.ReactNode,
    duration?: number
  ) =>
    showToast({
      title,
      description,
      variant: 'warning',
      duration,
    }),

  info: (
    title: React.ReactNode,
    description?: React.ReactNode,
    duration?: number
  ) =>
    showToast({
      title,
      description,
      variant: 'info',
      duration,
    }),

  custom: showToast,

  dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
};

// ============================================================================
// Legacy Compatibility
// ============================================================================

export const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
} as const;

type LegacyToastType = keyof typeof TOAST_TYPES;

interface CustomToastOptions {
  message?: string;
  type?: LegacyToastType;
  duration?: number;
  style?: React.CSSProperties;
}

/**
 * Legacy wrapper for backward compatibility
 */
const ReusableToast = ({
  message = "",
  type = "SUCCESS",
  duration = 5000,
}: CustomToastOptions = {}) => {
  const variantMap: Record<string, ToastVariant> = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  };

  const variant = variantMap[type] || 'success';

  // Map legacy message to title
  return showToast({
    title: message,
    variant,
    duration,
  });
};

// ============================================================================
// Exports
// ============================================================================

export { Toaster, toast, showToast };
export type { ToastVariant, ToastOptions };
export default ReusableToast;
