import {
  FiAlertTriangle as AlertTriangle,
  FiRefreshCw as RefreshCw,
  FiWifi as Wifi,
  FiServer as Server,
  FiAlertCircle as AlertCircle,
  FiXCircle as XCircle,
  FiWifiOff as WifiOff,
  FiShield as ShieldAlert,
  FiFileText as FileX,
  FiClock as Clock,
  FiLock as Lock,
} from 'react-icons/fi';
import { useThemeSafe } from '../features/theme-customizer/hooks/useThemeSafe';
import CardWrapper from './CardWrapper';
import Button from '../components/Button';

const ErrorState = ({
  icon: IconComponent,
  title,
  description,
  primaryAction,
  onPrimaryAction,
  secondaryAction,
  onSecondaryAction,
  className = '',
  variant = 'default', // default, compact, minimal, card
  size = 'medium', // small, medium, large
  type, // Predefined error types
  showIcon = true,
  severity = 'error', // error, warning, info
  children,
  retryCount = 0,
  maxRetries = 3,
}) => {
  const { primaryColor } = useThemeSafe();
  // Predefined error type configurations
  const errorTypes = {
    network: {
      icon: WifiOff,
      title: 'Connection problem',
      description:
        'Unable to connect to our servers. Please check your internet connection and try again.',
      primaryAction: 'Retry connection',
      severity: 'error',
    },
    server: {
      icon: Server,
      title: 'Server error',
      description:
        'Our servers are experiencing issues. Please try again in a few moments.',
      primaryAction: 'Try again',
      severity: 'error',
    },
    notFound: {
      icon: FileX,
      title: 'Content not found',
      description:
        "The content you're looking for doesn't exist or has been moved.",
      primaryAction: 'Go back',
      severity: 'warning',
    },
    forbidden: {
      icon: Lock,
      title: 'Access denied',
      description:
        "You don't have permission to access this resource. Contact your administrator if you believe this is an error.",
      primaryAction: 'Go back',
      severity: 'error',
    },
    timeout: {
      icon: Clock,
      title: 'Request timeout',
      description: 'The request took too long to complete. Please try again.',
      primaryAction: 'Try again',
      severity: 'warning',
    },
    validation: {
      icon: AlertCircle,
      title: 'Invalid data',
      description: 'Please check your input and try again.',
      primaryAction: 'Review input',
      severity: 'warning',
    },
    generic: {
      icon: AlertTriangle,
      title: 'Something went wrong',
      description:
        'An unexpected error occurred. Please try again or contact support if the problem persists.',
      primaryAction: 'Try again',
      severity: 'error',
    },
  };

  // Apply error type configuration if provided
  const config = type && errorTypes[type] ? errorTypes[type] : {};
  const ResolvedIcon = IconComponent || config.icon || AlertTriangle;
  const finalTitle = title || config.title || 'Something went wrong';
  const finalDescription =
    description || config.description || 'An unexpected error occurred.';
  const finalPrimaryAction =
    primaryAction || config.primaryAction || 'Try again';
  const finalSeverity = severity || config.severity || 'error';

  // Size configurations
  const sizeConfigs = {
    small: {
      container: 'py-6 px-4',
      iconContainer: 'w-12 h-12 mb-3',
      iconSize: 24,
      title: 'text-lg font-semibold',
      description: 'text-sm',
      maxWidth: 'max-w-sm',
    },
    medium: {
      container: 'py-8 px-6',
      iconContainer: 'w-16 h-16 mb-4',
      iconSize: 32,
      title: 'text-xl font-semibold',
      description: 'text-base',
      maxWidth: 'max-w-md',
    },
    large: {
      container: 'py-12 px-8',
      iconContainer: 'w-20 h-20 mb-6',
      iconSize: 40,
      title: 'text-2xl font-bold',
      description: 'text-lg',
      maxWidth: 'max-w-lg',
    },
  };

  // Variant configurations
  const variantConfigs = {
    default: '',
    compact: '',
    minimal: '',
    card: 'bg-white rounded-xl border border-gray-200 shadow-sm',
  };

  // Severity-based styling with dark mode support
  const severityStyles = {
    error: {
      iconBg: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700',
      iconColor: 'text-red-600 dark:text-red-400',
      primaryBtn:
        'bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600',
    },
    warning: {
      iconBg:
        'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      primaryBtn:
        'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 dark:bg-yellow-700 dark:hover:bg-yellow-600',
    },
    info: {
      iconBg:
        'bg-primary/10 border-primary/20 dark:bg-primary/20 dark:border-primary',
      iconColor: '', // will use inline style for color
      primaryBtn:
        'bg-primary hover:bg-primary/90 focus:ring-primary/50 dark:bg-primary dark:hover:bg-primary/80',
    },
  };

  const sizeConfig = sizeConfigs[size];
  const variantClass = variantConfigs[variant];
  const severityStyle = severityStyles[finalSeverity];

  const containerClasses = `
    flex flex-col items-center justify-center text-center
    w-full h-auto min-h-0
    leading-tight
    ${sizeConfig.container}
    ${variantClass}
    ${className}
  `.trim();

  const showRetryInfo = retryCount > 0 && maxRetries > 0;
  const isMaxRetriesReached = retryCount >= maxRetries;

  return (
    <CardWrapper
      className={containerClasses}
      shadow="shadow-sm"
      radius="rounded-xl"
      background="bg-white dark:bg-gray-900"
      bordered
    >
      {showIcon && (
        <div className="mb-4">
          <div
            className={`
        inline-flex items-center justify-center rounded-full
        ${severityStyle.iconBg}
        ${sizeConfig.iconContainer}
      `}
          >
            <ResolvedIcon
              size={sizeConfig.iconSize}
              className={severityStyle.iconColor}
              style={finalSeverity === 'info' ? { color: primaryColor } : {}}
            />
          </div>
        </div>
      )}

      <div className={`space-y-1 ${sizeConfig.maxWidth}`}>
        <h3
          className={`text-gray-900 dark:text-gray-100 ${sizeConfig.title} leading-tight`}
        >
          {finalTitle}
        </h3>

        <p
          className={`text-gray-600 dark:text-gray-300 leading-tight ${sizeConfig.description}`}
        >
          {finalDescription}
        </p>

        {showRetryInfo && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {isMaxRetriesReached ? (
              <span className="text-red-600 dark:text-red-400">
                Maximum retry attempts reached
              </span>
            ) : (
              <span>
                Attempt {retryCount} of {maxRetries}
              </span>
            )}
          </div>
        )}

        {children && <div className="mt-2">{children}</div>}
      </div>

      {(onPrimaryAction || onSecondaryAction) && (
        <div className="mt-4 flex flex-col justify-center sm:flex-row gap-2 items-center">
          {onPrimaryAction && (
            <Button onClick={onPrimaryAction} disabled={isMaxRetriesReached}>
              {isMaxRetriesReached ? 'Max retries reached' : finalPrimaryAction}
            </Button>
          )}
          {onSecondaryAction && secondaryAction && (
            <Button onClick={onSecondaryAction}>{secondaryAction}</Button>
          )}
        </div>
      )}
    </CardWrapper>
  );
};

// Predefined icons for easy access
ErrorState.Icons = {
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff,
  Server,
  AlertCircle,
  XCircle,
  ShieldAlert,
  FileX,
  Clock,
  Lock,
};

// Error type presets
ErrorState.Types = {
  NETWORK: 'network',
  SERVER: 'server',
  NOT_FOUND: 'notFound',
  FORBIDDEN: 'forbidden',
  TIMEOUT: 'timeout',
  VALIDATION: 'validation',
  GENERIC: 'generic',
};

// Severity levels
ErrorState.Severity = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Size options
ErrorState.Sizes = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

// Variant options
ErrorState.Variants = {
  DEFAULT: 'default',
  COMPACT: 'compact',
  MINIMAL: 'minimal',
  CARD: 'card',
};

export default ErrorState;
