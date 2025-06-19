import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import AirqoLogo from '@/icons/airqo_logo.svg';

/**
 * GroupLogo Component - Professional organization logo display
 *
 * Follows industry best practices for logo fallbacks:
 * 1. Primary: Organization logo image
 * 2. Secondary: Brand initials in colored circle
 * 3. Tertiary: Generic organization icon
 *
 * Features:
 * - Uses user data from login setup for accurate group matching
 * - Progressive fallback system for missing/failed logos
 * - Consistent styling and accessibility
 * - Optimized performance with memoization
 */
const GroupLogo = ({
  className = '',
  showFallback = true, // Whether to show initials fallback
}) => {
  const pathname = usePathname();

  // Get user data and active group from Redux
  const userInfo = useSelector((state) => state.login?.userInfo);
  const activeGroup = useSelector((state) => state.groups?.activeGroup);

  console.log('userinfo', userInfo);

  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  // Determine if we're in organization flow
  const isOrganizationFlow = useMemo(() => {
    return pathname?.startsWith('/org/');
  }, [pathname]);

  // Get current organization data with accurate ID matching
  const currentOrganization = useMemo(() => {
    if (!isOrganizationFlow || !activeGroup || !userInfo?.groups) {
      return null;
    }

    // Find exact match by ID for high accuracy
    const matchingGroup = userInfo.groups.find(
      (group) => group._id === activeGroup._id,
    );

    return matchingGroup || activeGroup;
  }, [isOrganizationFlow, activeGroup, userInfo?.groups]);

  // Get logo URL with proper validation
  const logoUrl = useMemo(() => {
    if (!currentOrganization) return null;

    const url =
      currentOrganization.grp_profile_picture || currentOrganization.grp_image;

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
  }, [currentOrganization]);

  // Generate professional initials with proper formatting
  const organizationInitials = useMemo(() => {
    const getName = () => {
      if (currentOrganization) {
        return currentOrganization.grp_title || currentOrganization.grp_name;
      }

      // Fallback to pathname parsing for loading states
      if (isOrganizationFlow && pathname) {
        const matches = pathname.match(/\/org\/([^/]+)/);
        if (matches?.[1]) {
          return matches[1].replace(/[-_]/g, ' ');
        }
      }

      return 'Organization';
    };

    const name = getName();
    const words = name.split(/\s+/).filter(Boolean);

    if (words.length >= 2) {
      // Use first letter of first two words
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    } else if (words.length === 1 && words[0].length >= 2) {
      // Use first two letters of single word
      return words[0].substring(0, 2).toUpperCase();
    }

    return 'OR'; // Default fallback
  }, [currentOrganization, isOrganizationFlow, pathname]);

  // Professional color palette for different organizations
  const brandColors = useMemo(() => {
    const hash = organizationInitials.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const colors = [
      { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-200' },
      {
        bg: 'bg-purple-600',
        text: 'text-white',
        border: 'border-purple-200',
      },
      { bg: 'bg-green-600', text: 'text-white', border: 'border-green-200' },
      {
        bg: 'bg-orange-600',
        text: 'text-white',
        border: 'border-orange-200',
      },
      { bg: 'bg-teal-600', text: 'text-white', border: 'border-teal-200' },
      {
        bg: 'bg-indigo-600',
        text: 'text-white',
        border: 'border-indigo-200',
      },
    ];

    return colors[Math.abs(hash) % colors.length];
  }, [organizationInitials]);

  // Event handlers
  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageError(false);
    setImageLoading(false);
  }, []);
  // For non-organization flows, show AirQo logo
  if (!isOrganizationFlow) {
    return (
      <div
        className={`inline-flex items-center justify-center m-0 p-0 ${className}`}
      >
        <AirqoLogo className="flex-shrink-0 w-auto h-auto max-w-full max-h-full" />
      </div>
    );
  }

  // Loading state for organization logos
  if (imageLoading && logoUrl && !imageError) {
    return (
      <div
        className={`inline-flex items-center justify-center m-0 p-0 ${className}`}
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>
    );
  }

  // Primary: Show organization logo if available and not failed
  if (logoUrl && !imageError) {
    return (
      <div
        className={`inline-flex items-center justify-center m-0 p-0 ${className}`}
      >
        <div className="relative w-8 h-8 flex-shrink-0 rounded-full overflow-hidden bg-white shadow-sm">
          <Image
            src={logoUrl}
            alt={`${currentOrganization?.grp_title || 'Organization'} logo`}
            fill
            sizes="32px"
            className="object-contain p-1"
            onError={handleImageError}
            onLoad={handleImageLoad}
            priority
          />
        </div>
      </div>
    );
  }

  // Secondary: Show professional initials fallback
  if (showFallback) {
    return (
      <div
        className={`inline-flex items-center justify-center m-0 p-0 ${className}`}
      >
        <div
          className={`
            w-8 h-8
            flex-shrink-0
            ${brandColors.bg} 
            ${brandColors.text}
            rounded-full 
            flex items-center justify-center 
            shadow-sm 
            border-2 
            ${brandColors.border}
            dark:border-opacity-30
          `}
          title={currentOrganization?.grp_title || 'Organization'}
        >
          <span className="text-sm font-semibold">{organizationInitials}</span>
        </div>
      </div>
    );
  }

  // Tertiary: Generic fallback (minimal)
  return (
    <div
      className={`inline-flex items-center justify-center m-0 p-0 ${className}`}
    >
      <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
        <svg
          className="w-1/2 h-1/2 text-gray-500 dark:text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2a1 1 0 01-1 1H6a1 1 0 01-1-1v-2h8zM9 8h2v2H9V8z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
};

GroupLogo.propTypes = {
  className: PropTypes.string,
  showFallback: PropTypes.bool,
};

export default GroupLogo;
