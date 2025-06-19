import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import AirqoLogo from '@/icons/airqo_logo.svg';

/**
 * GroupLogo Component - Professional organization logo display with smart fallbacks
 *
 * Fallback hierarchy:
 * 1. AirQo organizations: Always show AirQo logo
 * 2. Other organizations: Try to load organization logo
 * 3. Fallback: Professional initials badge with organization colors
 * 4. Ultimate fallback: Generic organization icon
 *
 * Features:
 * - Smart organization detection
 * - Professional fallback design
 * - Optimized loading states
 * - Accessible and responsive
 */
const GroupLogo = ({ className = '', size = 32 }) => {
  // Get user data and active group from Redux
  const userInfo = useSelector((state) => state.login?.userInfo);
  const activeGroup = useSelector((state) => state.groups?.activeGroup);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Get current organization data with accurate ID matching
  const currentOrganization = useMemo(() => {
    if (!activeGroup || !userInfo?.groups) {
      return null;
    }

    // Find exact match by ID for high accuracy
    const matchingGroup = userInfo.groups.find(
      (group) => group._id === activeGroup._id,
    );

    return matchingGroup || activeGroup;
  }, [activeGroup, userInfo?.groups]);

  // Check if current organization is AirQo
  const isAirQoOrganization = useMemo(() => {
    if (!currentOrganization) return false;

    const orgName = currentOrganization.grp_title?.toLowerCase() || '';
    const orgWebsite = currentOrganization.grp_website?.toLowerCase() || '';

    return (
      orgName.includes('airqo') ||
      orgWebsite.includes('airqo') ||
      currentOrganization._id?.toLowerCase().includes('airqo')
    );
  }, [currentOrganization]);

  // Get logo URL with proper validation
  const logoUrl = useMemo(() => {
    if (!currentOrganization || isAirQoOrganization) return null;

    const url =
      currentOrganization.grp_profile_picture ||
      currentOrganization.grp_image ||
      currentOrganization.logo_url;

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
  }, [currentOrganization, isAirQoOrganization]);

  // Generate organization initials and color
  const organizationDisplay = useMemo(() => {
    if (!currentOrganization) return { initials: 'ORG', color: '#6B7280' };

    const title = currentOrganization.grp_title || 'Organization';

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
  }, [currentOrganization]);

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

  // Dynamic sizing - separate for containers and text
  const containerSizeClasses = useMemo(() => {
    const sizeMap = {
      24: 'h-6',
      32: 'h-8',
      40: 'h-10',
      48: 'h-12',
      56: 'h-14',
    };
    return sizeMap[size] || 'h-8';
  }, [size]);

  const textSizeClasses = useMemo(() => {
    const sizeMap = {
      24: 'text-xs',
      32: 'text-sm',
      40: 'text-base',
      48: 'text-lg',
      56: 'text-xl',
    };
    return sizeMap[size] || 'text-sm';
  }, [size]);

  // Loading state - only show for a maximum of 3 seconds
  if (logoUrl && imageLoading && !imageError && !loadingTimeout) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <div
          className={`${containerSizeClasses} aspect-square rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-800 animate-pulse flex-shrink-0 flex items-center justify-center`}
        >
          <div className="w-1/2 h-1/2 rounded-full bg-blue-300 dark:bg-gray-600 animate-ping" />
        </div>
      </div>
    );
  }

  // AirQo organization - always show AirQo logo
  if (isAirQoOrganization) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <AirqoLogo
          className={`${containerSizeClasses} max-w-none flex-shrink-0`}
        />
      </div>
    );
  }

  // Organization logo - try to load from URL with fallback safety
  if (logoUrl && !imageError && !loadingTimeout) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <div
          className={`relative ${containerSizeClasses} flex-shrink-0 bg-white dark:bg-gray-50 rounded-lg shadow-sm ring-1 ring-gray-200 dark:ring-gray-300 overflow-hidden`}
        >
          <Image
            src={logoUrl}
            alt={`${organizationDisplay.title} logo`}
            fill
            sizes={`${size}px`}
            className="object-contain p-1"
            onError={handleImageError}
            onLoad={handleImageLoad}
            priority={false}
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  // Professional fallback - Organization initials badge
  if (currentOrganization) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <div
          className={`${containerSizeClasses} aspect-square flex-shrink-0 rounded-full flex items-center justify-center text-white font-semibold shadow-sm ring-2 ring-white dark:ring-gray-800 ${textSizeClasses}`}
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
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div
        className={`${containerSizeClasses} aspect-square flex-shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-sm ring-1 ring-gray-200 dark:ring-gray-700`}
      >
        <svg
          className="w-1/2 h-1/2 text-gray-500 dark:text-gray-400"
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

GroupLogo.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf([24, 32, 40, 48, 56]),
};

export default GroupLogo;
