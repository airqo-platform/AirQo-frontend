'use client';

import PropTypes from 'prop-types';
import { useOrganization } from '@/app/providers/UnifiedGroupProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingSpinner from '@/components/LoadingSpinner';
import GroupLogo from '@/common/components/GroupLogo';

const AuthLayout = ({
  children,
  title,
  subtitle,
  showBackToAirqo = true,
  backToAirqoPath = '/user/login',
}) => {
  const {
    organization,
    getDisplayName,
    isLoading,
    isInitialized,
    primaryColor,
  } = useOrganization();

  // Show loading spinner while organization data is being fetched
  // Also show loading if we haven't initialized yet (prevents flashing)
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1b1d1e] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Loading organization...
          </p>
        </div>
      </div>
    );
  }

  // Use organization data directly - fallback to getDisplayName if organization.name is not available
  const organizationName = organization?.name || getDisplayName?.() || 'AirQo';
  const organizationLogo = organization?.logo;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-[#1b1d1e] py-10 px-6 lg:px-20 flex justify-center items-center">
        <div className="w-full max-w-md space-y-6">
          {/* Organization Logo */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center">
              <GroupLogo
                size="xl"
                imageUrl={organizationLogo}
                fallbackText={organizationName}
                containerClassName="border-2 border-white p-0.5 dark:border-gray-200 shadow-lg"
                className="bg-white dark:bg-gray-50 rounded-lg"
              />
            </div>
          </div>
          {/* Title and Subtitle */}
          {(title || subtitle) && (
            <header className="mb-8">
              {title && (
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 leading-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </header>
          )}
          {/* Form Content */}
          <main className="space-y-6">{children}</main>

          {/* Organization Info */}
          <footer className="pt-2 border-gray-200 dark:border-gray-700">
            {/* Back to AirQo link */}
            {showBackToAirqo && (
              <div className="text-center">
                <a
                  href={backToAirqoPath}
                  className="inline-flex items-center text-xs hover:underline transition-colors duration-200 underline underline-offset-2 hover:underline-offset-4"
                  style={{
                    color: primaryColor || '#6B7280',
                  }}
                  aria-label="Go back to AirQo Platform"
                >
                  <span className="mr-1">←</span>
                  Back to AirQo Platform
                </a>
              </div>
            )}
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  showBackToAirqo: PropTypes.bool,
  backToAirqoPath: PropTypes.string,
};

export default AuthLayout;
