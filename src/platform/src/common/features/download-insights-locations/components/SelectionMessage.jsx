import {
  AqInfoCircle,
  AqAlertTriangle,
  AqAlertHexagon,
  AqCheckCircleBroken,
} from '@airqo/icons-react';

const SelectionMessage = ({
  type = 'info',
  children,
  onClear,
  clearText = 'Clear',
  className = '',
}) => {
  const colorSchemes = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      borderClass: 'border border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      iconColor: 'text-blue-600 dark:text-blue-400',
      buttonHover: 'hover:text-blue-600 dark:hover:text-blue-400',
      buttonText: 'text-blue-600 dark:text-blue-400',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      borderClass: 'border border-green-200 dark:border-green-600',
      text: 'text-green-800 dark:text-green-200',
      iconColor: 'text-green-600 dark:text-green-300',
      buttonHover: 'hover:text-green-800 dark:hover:text-green-200',
      buttonText: 'text-green-600 dark:text-green-200',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderClass: 'border border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      buttonHover: 'hover:text-yellow-800 dark:hover:text-yellow-200',
      buttonText: 'text-yellow-600 dark:text-yellow-200',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      borderClass: 'border border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      iconColor: 'text-red-600 dark:text-red-300',
      buttonHover: 'hover:text-red-800 dark:hover:text-red-200',
      buttonText: 'text-red-600 dark:text-red-200',
    },
  };

  const colors = colorSchemes[type] || colorSchemes.info;

  const IconMap = {
    info: AqInfoCircle,
    warning: AqAlertTriangle,
    error: AqAlertHexagon,
    success: AqCheckCircleBroken,
  };

  const Icon = IconMap[type] || IconMap.info;
  return (
    <div
      className={`mb-4 ${colors.bg} ${colors.borderClass} rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Icon size={20} className={`${colors.iconColor} mt-0.5`} />
        </div>
        <div className={`${colors.text} text-sm flex-1`}>{children}</div>
        {onClear && (
          <div className="ml-3 flex-shrink-0">
            <button
              onClick={onClear}
              className={`flex items-center ${colors.buttonText} ${colors.buttonHover} text-sm font-medium`}
              aria-label={clearText}
              type="button"
            >
              {clearText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectionMessage;
