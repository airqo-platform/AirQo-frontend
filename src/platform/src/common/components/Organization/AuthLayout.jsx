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

  // Note: Removed automatic theme application - using standard colors for auth pages

  const organizationName = getDisplayName() || 'AirQo';
  const logoSrc = logo || '/icons/airqo_logo.svg';

  // Use standard gradient instead of organization colors
  const gradientStyle = {
    background: 'linear-gradient(135deg, #135DFF10 0%, #1B255915 100%)',
  };

  // Use standard border color
  const borderAccentStyle = {
    borderTopColor: '#135DFF',
    borderTopWidth: '4px',
  };

  return (
    <ErrorBoundary>
      <div
        className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden"
        style={gradientStyle}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: '#135DFF' }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-15 blur-3xl"
            style={{ backgroundColor: '#1B2559' }}
          />
        </div>
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          {/* Organization Logo and Header */}
          <div className="text-center">
            <div className="relative mb-6">
              {logoSrc ? (
                <div className="relative inline-block">
                  {/* Logo glow effect */}
                  <div
                    className="absolute inset-0 rounded-full blur-md opacity-30"
                    style={{ backgroundColor: '#135DFF' }}
                  />
                  <img
                    className="relative mx-auto h-20 w-auto drop-shadow-lg"
                    src={logoSrc}
                    alt={`${organizationName} logo`}
                    onError={(e) => {
                      // Fallback to AirQo logo if organization logo fails to load
                      e.target.src = '/icons/airqo_logo.svg';
                    }}
                  />
                </div>
              ) : (
                // Loading state for logo
                <div className="mx-auto h-20 w-20 bg-white bg-opacity-20 animate-pulse rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>

            <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
              {title || `Sign in to ${organizationName}`}
            </h2>
            {subtitle && (
              <p className="text-center text-sm text-gray-600 max-w-sm mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div
            className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 backdrop-blur-sm border border-white border-opacity-20"
            style={borderAccentStyle}
          >
            {children}

            {/* Organization Info with enhanced styling */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="text-center">
                <p className="text-xs font-medium" style={{ color: '#135DFF' }}>
                  {organization
                    ? `${organizationName}'s Private Dashboard`
                    : 'AirQo Platform'}
                </p>
                {organization?.description && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    {organization.description}
                  </p>
                )}
              </div>

              {/* Back to AirQo link */}
              {showBackToAirqo && (
                <div className="mt-4 text-center">
                  <a
                    href={backToAirqoPath}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline"
                  >
                    ← Back to AirQo Platform
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>{' '}
        {/* Optional disclaimer/additional info */}
        <div className="mt-8 text-center relative z-10">
          <p className="text-xs text-gray-500">
            Secure access to {organizationName}&apos;s air quality monitoring
            dashboard
          </p>
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
