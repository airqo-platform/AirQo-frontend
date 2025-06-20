'use client';

import PropTypes from 'prop-types';
import Image from 'next/image';
import { useState } from 'react';
import { useOrganization } from '@/app/providers/UnifiedGroupProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatOrgSlug } from '@/core/utils/strings';

const AuthLayout = ({
  children,
  title,
  subtitle,
  showBackToAirqo = true,
  backToAirqoPath = '/user/login',
}) => {
  const [imageError, setImageError] = useState(false);
  const {
    organization,
    getDisplayName,
    logo,
    isLoading,
    isInitialized,
    error,
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

  const organizationName = getDisplayName?.() || 'AirQo';
  const logoSrc = imageError || !logo ? '/icons/airqo_logo.svg' : logo;

  // Memoized organization info to prevent unnecessary re-renders
  const organizationInfo = organization
    ? `${formatOrgSlug(organizationName)}'s Private Dashboard`
    : 'AirQo Platform';

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-[#1b1d1e] py-10 px-6 lg:px-20 flex justify-center items-center">
        <div className="w-full max-w-md space-y-6">
          {/* Organization Logo */}
          <div className="mb-8">
            <div className="relative">
              <Image
                src={logoSrc}
                alt={`${organizationName} logo`}
                width={120}
                height={48}
                className="h-12 w-auto object-contain"
                priority
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 100vw, 120px"
                unoptimized={logoSrc.includes('http')}
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
          <footer className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center space-y-2">
              <p
                className="text-xs font-medium transition-colors duration-200"
                style={{ color: 'var(--color-primary, #145fff)' }}
              >
                {organizationInfo}
              </p>
              {organization?.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
                  {organization.description}
                </p>
              )}
            </div>

            {/* Back to AirQo link */}
            {showBackToAirqo && (
              <div className="mt-4 text-center">
                <a
                  href={backToAirqoPath}
                  className="inline-flex items-center text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200 underline underline-offset-2 hover:underline-offset-4"
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
