'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { useOrganization } from '@/app/providers/OrganizationProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingSpinner from '@/components/LoadingSpinner';

const AuthLayout = ({
  children,
  title,
  subtitle,
  showBackToAirqo = true,
  backToAirqoPath = '/user/login',
}) => {
  const { organization, getDisplayName, logo } = useOrganization();

  const organizationName = getDisplayName() || 'AirQo';
  const logoSrc = logo || '/icons/airqo_logo.svg';

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-[#1b1d1e] py-10 px-6 lg:px-20 flex justify-center items-center">
        <div className="w-full max-w-md">
          {/* Organization Logo */}
          <div className="mb-8">
            {logoSrc ? (
              <img
                className="h-12 w-auto"
                src={logoSrc}
                alt={`${organizationName} logo`}
                onError={(e) => {
                  // Fallback to AirQo logo if organization logo fails to load
                  e.target.src = '/icons/airqo_logo.svg';
                }}
              />
            ) : (
              // Loading state for logo
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded flex items-center justify-center">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>
          {/* Title and Subtitle */}
          {(title || subtitle) && (
            <div className="mb-8">
              {title && (
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {/* Form Content */}{' '}
          <div className="space-y-6">
            {children}

            {/* Organization Info */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                {' '}
                <p
                  className="text-xs font-medium"
                  style={{ color: 'var(--color-primary, #145fff)' }}
                >
                  {organization
                    ? `${organizationName}'s Private Dashboard`
                    : 'AirQo Platform'}
                </p>
                {organization?.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {organization.description}
                  </p>
                )}
              </div>

              {/* Back to AirQo link */}
              {showBackToAirqo && (
                <div className="mt-4 text-center">
                  <a
                    href={backToAirqoPath}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors underline"
                  >
                    ← Back to AirQo Platform
                  </a>
                </div>
              )}
            </div>
          </div>
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
