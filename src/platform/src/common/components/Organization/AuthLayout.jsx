'use client';

import PropTypes from 'prop-types';
import Image from 'next/image';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useOrganization } from '@/app/providers/UnifiedGroupProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatOrgSlug } from '@/core/utils/strings';
import AirqoLogo from '@/icons/airqo_logo.svg';

const AuthLayout = ({
  children,
  title,
  subtitle,
  showBackToAirqo = true,
  backToAirqoPath = '/user/login',
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  const {
    organization,
    getDisplayName,
    logo,
    isLoading,
    isInitialized,
    error,
  } = useOrganization();

  // Check if current organization is AirQo
  const isAirQoOrganization = useMemo(() => {
    if (!organization) return false;

    const orgName = getDisplayName()?.toLowerCase() || '';
    const orgWebsite = organization.grp_website?.toLowerCase() || '';

    return (
      orgName.includes('airqo') ||
      orgWebsite.includes('airqo') ||
      organization._id?.toLowerCase().includes('airqo')
    );
  }, [organization, getDisplayName]);

  // Get logo URL with proper validation
  const logoUrl = useMemo(() => {
    if (!organization || isAirQoOrganization) return null;

    const url = logo;

    // Validate URL format
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return null;
    }

    // Basic URL validation
    try {
      new URL(url);
      return url;
    } catch {
      return null;
    }
  }, [organization, logo, isAirQoOrganization]);

  // Generate organization initials and color for fallback
  const organizationDisplay = useMemo(() => {
    if (!organization) return { initials: 'ORG', color: '#6B7280' };

    const title = getDisplayName() || 'Organization';

    // Generate initials (max 2 characters)
    const words = title.trim().split(/\s+/);
    let initials;

    if (words.length === 1) {
      initials = words[0].substring(0, 2).toUpperCase();
    } else {
      initials = words
        .slice(0, 2)
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase();
    }

    // Generate consistent color based on organization name
    const generateColor = (str) => {
      const colors = [
        '#3B82F6', // Blue
        '#10B981', // Emerald
        '#8B5CF6', // Violet
        '#F59E0B', // Amber
        '#EF4444', // Red
        '#06B6D4', // Cyan
        '#84CC16', // Lime
        '#EC4899', // Pink
        '#6366F1', // Indigo
        '#14B8A6', // Teal
      ];

      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }

      return colors[Math.abs(hash) % colors.length];
    };

    return {
      initials,
      color: generateColor(title),
      title,
    };
  }, [organization, getDisplayName]);

  // Reset loading state when logoUrl changes
  useEffect(() => {
    if (logoUrl) {
      setImageLoading(true);
      setImageError(false);
      setLoadingTimeout(false);

      // Set timeout to prevent endless loading (3 seconds)
      const timeoutId = setTimeout(() => {
        setLoadingTimeout(true);
        setImageLoading(false);
        setImageError(true);
      }, 3000);

      return () => clearTimeout(timeoutId);
    } else {
      setImageLoading(false);
      setImageError(false);
      setLoadingTimeout(false);
    }
  }, [logoUrl]);

  // Event handlers
  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
    setLoadingTimeout(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageError(false);
    setImageLoading(false);
    setLoadingTimeout(false);
  }, []);

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

  // Memoized organization info to prevent unnecessary re-renders
  const organizationInfo = organization
    ? `${formatOrgSlug(organizationName)}'s Private Dashboard`
    : 'AirQo Platform';

  // Professional Logo Component with smart fallbacks
  const LogoComponent = () => {
    // Loading state
    if (logoUrl && imageLoading && !imageError && !loadingTimeout) {
      return (
        <div className="inline-flex items-center justify-center">
          <div className="h-16 w-auto aspect-square rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-800 animate-pulse flex-shrink-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-blue-300 dark:bg-gray-600 animate-ping" />
          </div>
        </div>
      );
    }

    // AirQo organization - always show AirQo logo
    if (isAirQoOrganization) {
      return (
        <div className="inline-flex items-center justify-center">
          <AirqoLogo className="h-16 w-auto max-w-none flex-shrink-0" />
        </div>
      );
    }

    // Organization logo - try to load from URL with fallback safety
    if (logoUrl && !imageError && !loadingTimeout) {
      return (
        <div className="inline-flex items-center justify-center">
          <div className="relative h-16 w-auto aspect-square flex-shrink-0 bg-white dark:bg-gray-50 rounded-lg shadow-sm ring-1 ring-gray-200 dark:ring-gray-300 overflow-hidden">
            <Image
              src={logoUrl}
              alt={`${organizationDisplay.title} logo`}
              width={160}
              height={64}
              className="object-contain p-1"
              onError={handleImageError}
              onLoad={handleImageLoad}
              priority
              sizes="160px"
              unoptimized={logoUrl.includes('http')}
            />
          </div>
        </div>
      );
    }

    // Professional fallback - Organization initials badge
    if (organization) {
      return (
        <div className="inline-flex items-center justify-center">
          <div
            className="h-16 w-16 aspect-square flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white dark:ring-gray-800 text-2xl"
            style={{ backgroundColor: organizationDisplay.color }}
            title={organizationDisplay.title}
          >
            {organizationDisplay.initials}
          </div>
        </div>
      );
    }

    // Ultimate fallback - Generic organization icon
    return (
      <div className="inline-flex items-center justify-center">
        <div className="h-16 w-16 aspect-square flex-shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
          <svg
            className="w-8 h-8 text-gray-500 dark:text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-[#1b1d1e] py-10 px-6 lg:px-20 flex justify-center items-center">
        <div className="w-full max-w-md space-y-6">
          {/* Organization Logo */}
          <div className="mb-8">
            <LogoComponent />
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
