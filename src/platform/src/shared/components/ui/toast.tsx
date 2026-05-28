'use client';

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
    progress: string;
    iconShell: string;
    iconColor: string;
    icon: React.ReactNode;
  }
> = {
  success: {
    progress: 'bg-emerald-500',
    iconShell:
      'bg-emerald-50 ring-1 ring-emerald-100 dark:bg-emerald-500/12 dark:ring-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-300',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-4 h-4"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.704 5.29a1 1 0 010 1.42l-7.2 7.2a1 1 0 01-1.415 0l-3-3a1 1 0 111.414-1.42l2.293 2.294 6.493-6.494a1 1 0 011.415 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  error: {
    progress: 'bg-rose-500',
    iconShell:
      'bg-rose-50 ring-1 ring-rose-100 dark:bg-rose-500/12 dark:ring-rose-500/20',
    iconColor: 'text-rose-600 dark:text-rose-300',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-4 h-4"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.03-10.97a.75.75 0 10-1.06-1.06L10 7.94 8.03 5.97a.75.75 0 00-1.06 1.06L8.94 9l-1.97 1.97a.75.75 0 101.06 1.06L10 10.06l1.97 1.97a.75.75 0 001.06-1.06L11.06 9l1.97-1.97z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  warning: {
    progress: 'bg-amber-500',
    iconShell:
      'bg-amber-50 ring-1 ring-amber-100 dark:bg-amber-500/12 dark:ring-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-300',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-4 h-4"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l5.58 9.92c.75 1.334-.213 2.981-1.742 2.981H4.42c-1.53 0-2.492-1.647-1.743-2.98l5.58-9.92zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-6a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 0010 7z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  info: {
    progress: 'bg-[rgb(var(--primary))]',
    iconShell:
      'bg-primary/10 ring-1 ring-primary/10 dark:bg-primary/12 dark:ring-primary/20',
    iconColor: 'text-primary dark:text-blue-300',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-4 h-4"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M18 10A8 8 0 112 10a8 8 0 0116 0zm-7-3a1 1 0 10-2 0 1 1 0 002 0zm-2 2.75A.75.75 0 019.75 9h.5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0V10.5h-.5A.75.75 0 019 9.75z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
};

const DEFAULT_DURATION = 5000;
const DEFAULT_VARIANT: ToastVariant = 'info';
const MIN_DURATION = 1800;

// ============================================================================
// ToastCard Component
// ============================================================================

const ToastCard: React.FC<ToastBodyProps> = ({
  title,
  description,
  variant = DEFAULT_VARIANT,
  duration = DEFAULT_DURATION,
  onClose,
}) => {
  const config = VARIANT_CONFIG[variant];
  const resolvedDuration = Math.max(duration, MIN_DURATION);
  const progressStyle = {
    ['--toast-duration' as string]: `${resolvedDuration}ms`,
  } as React.CSSProperties;

  return (
    <div className="group relative w-full overflow-hidden rounded-xl border border-border/90 bg-card shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)] ring-1 ring-black/5 dark:shadow-[0_18px_44px_-28px_rgba(0,0,0,0.55)]">
      <div className="flex items-start justify-between gap-4 px-4 py-3.5 sm:px-5">
        <div className="flex items-start flex-1 min-w-0 gap-3">
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.iconShell} ${config.iconColor}`}
          >
            {config.icon}
          </div>

          <div className="flex-1 min-w-0 pt-0.5 pr-2">
            {title && (
              <div className="mb-0.5 text-[15px] font-semibold leading-tight tracking-[-0.015em] text-foreground">
                {title}
              </div>
            )}
            {description && (
              <div className="text-[13px] font-medium leading-relaxed text-muted-foreground">
                {description}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="mt-0.5 flex-shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
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

      <div
        className="absolute inset-x-0 bottom-0 h-[3px] bg-slate-200/80 dark:bg-slate-700/70"
        role="presentation"
      >
        <div
          className={`toast-progress-bar h-full origin-left ${config.progress} [animation:toast-progress-shrink_var(--toast-duration)_linear_forwards] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]`}
          style={progressStyle}
          onAnimationEnd={onClose}
        />
      </div>
    </div>
  );
};

ToastCard.displayName = 'ToastCard';

// ============================================================================
// Toaster Component
// ============================================================================

const Toaster: React.FC<ToasterProps> = ({ ...props }) => {
  return (
    <>
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
            toast: 'w-full z-[9999] px-3 sm:px-0',
          },
        }}
        {...props}
      />

      <style jsx global>{`
        @keyframes toast-progress-shrink {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
    </>
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
  const resolvedDuration = Math.max(duration, MIN_DURATION);
  const isError = variant === 'error';

  const toastId = sonnerToast.custom(
    id => (
      <div
        role={isError ? 'alert' : 'status'}
        aria-live={isError ? 'assertive' : 'polite'}
        aria-atomic="true"
        className="w-full max-w-[560px] sm:min-w-[340px]"
      >
        <ToastCard
          title={title}
          description={description}
          variant={variant}
          duration={resolvedDuration}
          onClose={() => sonnerToast.dismiss(id)}
        />
      </div>
    ),
    { duration: Infinity }
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
// Exports
// ============================================================================

export { Toaster, toast, showToast };
export type { ToastVariant, ToastOptions };
