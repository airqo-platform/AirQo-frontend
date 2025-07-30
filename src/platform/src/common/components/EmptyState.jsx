import {
  AiOutlinePlus as Plus,
  AiOutlineFileText as FileText,
} from 'react-icons/ai';
import {
  FiPackage as Package,
  FiUsers as Users,
  FiCalendar as Calendar,
  FiSettings as Settings,
  FiDatabase as Database,
  FiMail as Mail,
  FiSearch as Search,
  FiImage as Image,
} from 'react-icons/fi';
import { useThemeSafe } from '../features/theme-customizer/hooks/useThemeSafe';
import CardWrapper from './CardWrapper';
import Button from '../components/Button';

const EmptyState = ({
  icon: IconComponent,
  title,
  description,
  actionLabel,
  onAction,
  secondaryAction,
  onSecondaryAction,
  className = '',
  variant = 'default', // default, compact, minimal, card
  size = 'medium', // small, medium, large
  showIcon = true,
  children,
  preset, // Quick preset configurations
}) => {
  const { primaryColor } = useThemeSafe();

  // Preset configurations for common scenarios
  const presets = {
    devices: {
      icon: Package,
      title: 'No devices deployed',
      description:
        'Deploy your first device to begin collecting air quality data and unlock real-time insights for your organization.',
      actionLabel: 'Deploy device',
    },
    users: {
      icon: Users,
      title: 'No team members',
      description:
        'Invite team members to collaborate and manage your air quality monitoring together.',
      actionLabel: 'Invite members',
    },
    data: {
      icon: Database,
      title: 'No data available',
      description:
        "There's no data to display yet. Data will appear here once your devices start reporting.",
      actionLabel: 'View settings',
    },
    search: {
      icon: Search,
      title: 'No results found',
      description:
        'Try adjusting your search criteria or browse all available items.',
      actionLabel: 'Clear filters',
    },
    files: {
      icon: FileText,
      title: 'No files uploaded',
      description:
        'Upload your first file to get started with document management.',
      actionLabel: 'Upload file',
    },
  };

  // Apply preset if provided
  const config = preset && presets[preset] ? presets[preset] : {};
  const ResolvedIcon = IconComponent || config.icon || Plus;
  const finalTitle = title || config.title || "Let's get things started!";
  const finalDescription =
    description ||
    config.description ||
    'Get started by taking your first action.';
  const finalActionLabel = actionLabel || config.actionLabel || 'Get started';

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

  const sizeConfig = sizeConfigs[size];
  const variantClass = variantConfigs[variant];

  const containerClasses = `
    flex flex-col items-center justify-center text-center
    w-full h-auto min-h-0
    ${sizeConfig.container}
    ${variantClass}
    ${className}
  `.trim();

  // If preset is 'error', show retry button
  const isError = preset === 'error';

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
        bg-primary/10 border border-primary/20 dark:bg-primary/20 dark:border-primary
        ${sizeConfig.iconContainer}
      `}
          >
            <ResolvedIcon
              size={sizeConfig.iconSize}
              style={{ color: primaryColor }}
            />
          </div>
        </div>
      )}

      <div className={`space-y-3 ${sizeConfig.maxWidth}`}>
        <h3 className={`text-gray-900 dark:text-gray-100 ${sizeConfig.title}`}>
          {finalTitle}
        </h3>

        <p
          className={`text-gray-600 dark:text-gray-300 leading-relaxed ${sizeConfig.description}`}
        >
          {finalDescription}
        </p>

        {children && <div className="mt-4">{children}</div>}
      </div>

      {(onAction || onSecondaryAction || isError) && (
        <div className="mt-6 flex flex-col justify-center sm:flex-row gap-3 items-center">
          {onAction && <Button onClick={onAction}>{finalActionLabel}</Button>}
          {onSecondaryAction && secondaryAction && (
            <Button onClick={onSecondaryAction}>{secondaryAction}</Button>
          )}
          {isError && (
            <Button onClick={onAction || (() => window.location.reload())}>
              Retry
            </Button>
          )}
        </div>
      )}
    </CardWrapper>
  );
};

// Predefined icons for easy access
EmptyState.Icons = {
  Plus,
  Package,
  Users,
  FileText,
  Calendar,
  Settings,
  Database,
  Mail,
  Search,
  Image,
};

// Preset configurations
EmptyState.Presets = {
  DEVICES: 'devices',
  USERS: 'users',
  DATA: 'data',
  SEARCH: 'search',
  FILES: 'files',
};

// Size options
EmptyState.Sizes = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

// Variant options
EmptyState.Variants = {
  DEFAULT: 'default',
  COMPACT: 'compact',
  MINIMAL: 'minimal',
  CARD: 'card',
};

export default EmptyState;
