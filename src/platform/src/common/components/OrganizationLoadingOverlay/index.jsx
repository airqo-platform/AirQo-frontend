import React from 'react';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import clsx from 'clsx';

const OrganizationLoadingOverlay = ({
  isVisible,
  organizationName,
  message = 'Switching organizations...',
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark' || theme === 'system';

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={clsx(
          'absolute inset-0',
          isDarkMode ? 'bg-black/80' : 'bg-white/90',
        )}
      />

      {/* Content */}
      <div
        className={clsx(
          'relative z-10 bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4',
          isDarkMode
            ? 'bg-gray-800 border border-gray-700'
            : 'border border-gray-200',
        )}
      >
        <div className="text-center">
          {/* Loading Spinner */}
          <div className="mx-auto mb-6 w-16 h-16 relative">
            <div
              className={clsx(
                'w-16 h-16 border-4 border-solid rounded-full animate-spin',
                isDarkMode
                  ? 'border-gray-600 border-t-primary'
                  : 'border-gray-200 border-t-primary',
              )}
            />
          </div>

          {/* Messages */}
          <h3
            className={clsx(
              'text-lg font-semibold mb-2',
              isDarkMode ? 'text-white' : 'text-gray-900',
            )}
          >
            {message}
          </h3>

          {organizationName && (
            <p
              className={clsx(
                'text-sm mb-4',
                isDarkMode ? 'text-gray-300' : 'text-gray-600',
              )}
            >
              Setting up <span className="font-medium">{organizationName}</span>
            </p>
          )}

          <div
            className={clsx(
              'text-xs',
              isDarkMode ? 'text-gray-400' : 'text-gray-500',
            )}
          >
            <p>Fetching organization details...</p>
            <p className="mt-1">Please wait a moment.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationLoadingOverlay;
