import React from 'react';
import { cn } from '@/shared/lib/utils';
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
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    textColor: 'text-primary',
    icon: <AqMessageCheckCircle className="h-5 w-5" />,
    iconColor: 'text-primary',
  },
  error: {
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20',
    textColor: 'text-destructive',
    icon: <AqMessageXCircle className="h-5 w-5" />,
    iconColor: 'text-destructive',
  },
  warning: {
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-800 dark:text-amber-200',
    icon: <AqAlertTriangle className="h-5 w-5" />,
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
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
  showIcon = true,
}) => {
  const config = SEVERITY_CONFIG[severity];
  const displayIcon = icon || (showIcon ? config.icon : null);

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-md border p-4 shadow-sm',
        config.bgColor,
        config.borderColor,
        className
      )}
      role="alert"
    >
      {/* Icon */}
      {displayIcon && (
        <div className={cn('flex-shrink-0', config.iconColor)}>
          {displayIcon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={cn('font-semibold text-sm', config.textColor)}>
            {title}
          </h4>
        )}
        {message && (
          <div className={cn('mt-1 text-sm', config.textColor)}>{message}</div>
        )}
        {actions && <div className="mt-3 flex gap-2">{actions}</div>}
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
