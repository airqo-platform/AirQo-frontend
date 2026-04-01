'use client';

import { Toaster as Sonner, toast as sonnerToast } from 'sonner';
import React from 'react';

const DEFAULT_DURATION = 5000;

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
}

const ToastBody: React.FC<{
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  onClose: () => void;
}> = ({ title, description, variant = 'info', onClose }) => {
  const stripeMap: Record<ToastVariant, string> = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-sky-500',
  };

  return (
    <div className="flex items-stretch w-full py-1 pl-1">
      <div className={`w-1.5 ${stripeMap[variant]} flex-shrink-0 rounded-full`} />
      <div className="flex items-start justify-between flex-1 px-4 py-3">
        <div className="flex-1 min-w-0 pr-3">
          {title && <div className="text-[15px] leading-tight mb-0.5 font-semibold text-foreground">{title}</div>}
          {description && (
            <div className="text-[13px] leading-relaxed text-muted-foreground font-medium">
              {description}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="flex-shrink-0 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          ?
        </button>
      </div>
    </div>
  );
};

const Toaster: React.FC<React.ComponentProps<typeof Sonner>> = ({ ...props }) => (
  <Sonner
    position="top-center"
    expand={false}
    richColors={false}
    closeButton={false}
    duration={DEFAULT_DURATION}
    gap={12}
    toastOptions={{
      unstyled: true,
      classNames: { toast: 'w-full z-[9999]' },
    }}
    {...props}
  />
);

const showToast = (options: ToastOptions) => {
  const {
    title,
    description,
    variant = 'info',
    duration = DEFAULT_DURATION,
  } = options;

  return sonnerToast.custom(
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
};

const ReusableToast = ({ message = '', type = 'SUCCESS', duration = DEFAULT_DURATION }: { message?: string; type?: string; duration?: number } = {}) => {
  const variantMap: Record<string, ToastVariant> = {
    SUCCESS: 'success',
    success: 'success',
    ERROR: 'error',
    error: 'error',
    WARNING: 'warning',
    warning: 'warning',
    INFO: 'info',
    info: 'info',
  };

  return showToast({
    title: message,
    variant: variantMap[type] ?? 'success',
    duration,
  });
};

export { Toaster };
export default ReusableToast;