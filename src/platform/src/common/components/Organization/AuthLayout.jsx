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
  const { organization, getDisplayName, primaryColor, secondaryColor, logo } =
    useOrganization();

  // Apply organization theme
  React.useEffect(() => {
    if (primaryColor && secondaryColor) {
      const root = document.documentElement;
      root.style.setProperty('--org-primary', primaryColor);
      root.style.setProperty('--org-secondary', secondaryColor);
    }
  }, [primaryColor, secondaryColor]);

  const organizationName = getDisplayName() || 'AirQo';
  const logoSrc = logo || '/icons/airqo_logo.svg';

  // Create a gradient background based on organization colors
  const gradientStyle =
    primaryColor && secondaryColor
      ? {
          background: `linear-gradient(135deg, ${primaryColor}10 0%, ${secondaryColor}15 100%)`,
        }
      : {
          background: 'linear-gradient(135deg, #135DFF10 0%, #1B255915 100%)',
        };

  // Create border accent color
  const borderAccentStyle = primaryColor
    ? { borderTopColor: primaryColor, borderTopWidth: '4px' }
    : { borderTopColor: '#135DFF', borderTopWidth: '4px' };

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
            style={{ backgroundColor: primaryColor || '#135DFF' }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-15 blur-3xl"
            style={{ backgroundColor: secondaryColor || '#1B2559' }}
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
                    style={{ backgroundColor: primaryColor || '#135DFF' }}
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
                <p
                  className="text-xs font-medium"
                  style={{ color: primaryColor || '#135DFF' }}
                >
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
            </div>

            {/* Fallback to main AirQo login with enhanced styling */}
            {showBackToAirqo && organization && (
              <div className="mt-4 text-center">
                <a
                  href={backToAirqoPath}
                  className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200 px-3 py-1 rounded-full hover:bg-gray-100"
                >
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Use main AirQo login
                </a>
              </div>
            )}
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
