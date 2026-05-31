import React from 'react';
import { cn } from '@/lib/utils';
import {
  AqMessageCheckCircle,
  AqMessageXCircle,
  AqAlertTriangle,
  AqAnnotationInfo,
  AqXClose,
} from '@airqo/icons-react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type BannerSeverity = 'success' | 'error' | 'warning' | 'info';

export interface BannerProps {
  severity: BannerSeverity;
  title?: React.ReactNode;
  message?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  dense?: boolean;
  showIcon?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const SEVERITY_CONFIG: Record<
  BannerSeverity,
  {
    bgColor: string;
    borderColor: string;
    textColor: string;
    icon: React.ReactNode;
    iconColor: string;
  }
> = {
  success: {
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
    borderColor: 'border-emerald-400 dark:border-emerald-600',
    textColor: 'text-emerald-900 dark:text-emerald-100',
    icon: <AqMessageCheckCircle className="h-5 w-5" />,
    iconColor: 'text-emerald-700 dark:text-emerald-300',
  },
  error: {
    bgColor: 'bg-red-100 dark:bg-red-900/40',
    borderColor: 'border-red-400 dark:border-red-600',
    textColor: 'text-red-900 dark:text-red-100',
    icon: <AqMessageXCircle className="h-5 w-5" />,
    iconColor: 'text-red-700 dark:text-red-300',
  },
  warning: {
    bgColor: 'bg-amber-100 dark:bg-amber-900/40',
    borderColor: 'border-amber-400 dark:border-amber-600',
    textColor: 'text-amber-900 dark:text-amber-100',
    icon: <AqAlertTriangle className="h-5 w-5" />,
    iconColor: 'text-amber-700 dark:text-amber-300',
  },
  info: {
    bgColor: 'bg-blue-100 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-800 dark:text-blue-200',
    icon: <AqAnnotationInfo className="h-5 w-5" />,
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
};

// ============================================================================
// Banner Component
// ============================================================================

export const Banner: React.FC<BannerProps> = ({
  severity,
  title,
  message,
  icon,
  actions,
  dismissible = false,
  onDismiss,
  className,
  dense = false,
  showIcon = true,
}) => {
  const config = SEVERITY_CONFIG[severity];
  const displayIcon = icon || (showIcon ? config.icon : null);

  const paddingClass = dense ? 'py-2 px-3' : 'p-4';

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border shadow-sm',
        paddingClass,
        config.bgColor,
        config.borderColor,
        className
      )}
      role={severity === 'error' ? 'alert' : 'status'}
      aria-live={severity === 'error' ? 'assertive' : 'polite'}
    >
      {/* Icon */}
      {displayIcon && (
        <div className={cn('flex-shrink-0', config.iconColor)}>
          {displayIcon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && <h4 className={cn('text-sm text-bold', config.textColor)}>{title}</h4>}
        {message && (
          <div className={cn('text-sm', config.textColor)}>{message}</div>
        )}
        {actions && (
          <div
            className={cn(dense ? 'mt-0' : 'mt-3', 'flex items-center gap-2')}
          >
            {actions}
          </div>
        )}
      </div>

      {/* Dismiss Button */}
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 rounded-md p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10',
            config.textColor
          )}
          aria-label="Dismiss"
        >
          <AqXClose className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// ============================================================================
// Convenience Components for Specific Severities
// ============================================================================

export const SuccessBanner: React.FC<Omit<BannerProps, 'severity'>> = props => (
  <Banner {...props} severity="success" />
);

export const ErrorBanner: React.FC<Omit<BannerProps, 'severity'>> = props => (
  <Banner {...props} severity="error" />
);

export const WarningBanner: React.FC<Omit<BannerProps, 'severity'>> = props => (
  <Banner {...props} severity="warning" />
);

export const InfoBanner: React.FC<Omit<BannerProps, 'severity'>> = props => (
  <Banner {...props} severity="info" />
);
