import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import AirqoLogo from '@/icons/airqo_logo.svg';

/**
 * GroupLogo - displays the organization's logo with professional fallbacks
 * Features:
 * - Organization logo image with error handling
 * - AirQo logo for AirQo organizations
 * - Professional initials fallback with consistent colors
 * - Proper container sizing and responsive design
 */
const GroupLogo = ({ className = '', size = 'md' }) => {
  // Redux state
  const userInfo = useSelector((state) => state.login?.userInfo);
  const activeGroup = useSelector((state) => state.groups?.activeGroup);

  // Component state
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Size configurations
  const sizeConfig = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
    '2xl': 'h-20 w-20 text-xl',
  };

  // Event listeners for refresh
  useEffect(() => {
    const handleRefresh = () => {
      setImageError(false);
      setImageLoading(true);
      setRefreshKey((prev) => prev + 1);
    };

    const events = ['logoRefresh', 'groupDataUpdated'];
    events.forEach((event) => {
      window.addEventListener(event, handleRefresh);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleRefresh);
      });
    };
  }, []);

  // Get current organization data
  const currentOrg = useMemo(() => {
    if (!activeGroup) return null;

    // Prefer userInfo groups data if available (more up-to-date)
    const orgFromUserInfo = userInfo?.groups?.find(
      (g) => g._id === activeGroup._id,
    );
    return orgFromUserInfo || activeGroup;
  }, [activeGroup, userInfo?.groups]);

  // Check if this is AirQo organization
  const isAirQo = useMemo(() => {
    if (!currentOrg) return false;

    const checkFields = [
      currentOrg._id,
      currentOrg.grp_title,
      currentOrg.grp_website,
      currentOrg.grp_name,
    ];

    return checkFields.some(
      (field) =>
        field &&
        typeof field === 'string' &&
        field.toLowerCase().includes('airqo'),
    );
  }, [currentOrg]);

  // Get valid image URL
  const imageUrl = useMemo(() => {
    if (!currentOrg || isAirQo) return null;

    // Priority order for image sources
    const imageSources = [
      currentOrg.grp_profile_picture,
      currentOrg.grp_image,
      currentOrg.logo_url,
      currentOrg.imageUrl,
      currentOrg.logo,
    ];

    for (const source of imageSources) {
      if (typeof source === 'string' && source.trim()) {
        try {
          // Validate URL format
          new URL(source);
          return source;
        } catch {
          // Invalid URL, continue to next
          continue;
        }
      }
    }

    return null;
  }, [currentOrg, isAirQo]);

  // Generate organization display data
  const orgDisplay = useMemo(() => {
    const title =
      currentOrg?.grp_title || currentOrg?.grp_name || 'Organization';

    // Generate initials
    const generateInitials = (text) => {
      const words = text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);

      if (words.length === 0) return 'ORG';
      if (words.length === 1) return words[0].substring(0, 2).toUpperCase();

      return words
        .slice(0, 2)
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase();
    };

    // Generate consistent color
    const generateColor = (text) => {
      const colors = [
        '#EF4444', // red-500
        '#F97316', // orange-500
        '#EAB308', // yellow-500
        '#22C55E', // green-500
        '#06B6D4', // cyan-500
        '#3B82F6', // blue-500
        '#8B5CF6', // violet-500
        '#EC4899', // pink-500
        '#10B981', // emerald-500
        '#F59E0B', // amber-500
      ];

      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
      }

      return colors[Math.abs(hash) % colors.length];
    };

    return {
      initials: generateInitials(title),
      color: generateColor(title),
      title: title,
    };
  }, [currentOrg]);

  // Image event handlers
  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
  }, []);

  // Reset states when image URL changes
  useEffect(() => {
    if (imageUrl) {
      setImageError(false);
      setImageLoading(true);
    }
  }, [imageUrl, refreshKey]);

  // Get container classes
  const containerSize = sizeConfig[size] || sizeConfig.md;
  const containerClasses = `
    relative inline-flex items-center justify-center flex-shrink-0
    ${containerSize}
    ${className}
  `
    .replace(/\s+/g, ' ')
    .trim();

  // Render AirQo logo
  if (isAirQo) {
    return (
      <div
        className={`
          ${containerClasses}
          bg-white dark:bg-gray-50 
          rounded-lg shadow-sm 
          ring-1 ring-gray-200 dark:ring-gray-300 
          overflow-hidden
          transition-all duration-200
        `}
        data-testid="airqo-logo"
        title={orgDisplay.title}
      >
        <AirqoLogo
          className="w-full h-full object-contain p-1.5"
          aria-label="AirQo Logo"
        />
      </div>
    );
  }

  // Render organization image
  if (imageUrl && !imageError) {
    return (
      <div
        className={`
          ${containerClasses}
          bg-white dark:bg-gray-50 
          rounded-lg shadow-sm 
          ring-1 ring-gray-200 dark:ring-gray-300 
          overflow-hidden
          transition-all duration-200
          ${imageLoading ? 'animate-pulse' : ''}
        `}
        data-testid="org-image-logo"
        title={orgDisplay.title}
      >
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
        <Image
          key={`${currentOrg?._id}-${refreshKey}`}
          src={imageUrl}
          alt={`${orgDisplay.title} logo`}
          fill
          sizes="(max-width: 768px) 64px, 80px"
          className="object-contain p-1.5"
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
          unoptimized={true}
        />
      </div>
    );
  }

  // Render initials fallback
  return (
    <div
      className={`
        ${containerClasses}
        rounded-full
        text-white font-semibold
        shadow-sm ring-2 ring-white dark:ring-gray-800
        transition-all duration-200
        hover:shadow-md
        select-none
      `}
      style={{ backgroundColor: orgDisplay.color }}
      title={orgDisplay.title}
      data-testid="org-initials-logo"
      aria-label={`${orgDisplay.title} initials`}
    >
      <span className="font-medium tracking-tight">{orgDisplay.initials}</span>
    </div>
  );
};

GroupLogo.displayName = 'GroupLogo';

GroupLogo.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
};

GroupLogo.defaultProps = {
  className: '',
  size: 'md',
};

export default React.memo(GroupLogo);
