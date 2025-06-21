import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
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
 * - Enhanced reload/refresh handling
 * - Intelligent image fitting and sizing
 * - Reusable with custom image URL and styling
 */
const GroupLogo = ({
  className = '',
  size = 'md',
  imageUrl: customImageUrl = null,
  fallbackText = null,
  fallbackColor = null,
  showAirqoLogo = true,
  containerClassName = '',
  imageClassName = '',
  disabled = false,
}) => {
  // Redux state (only used when not in custom mode)
  const userInfo = useSelector((state) => state.login?.userInfo);
  const activeGroup = useSelector((state) => state.groups?.activeGroup);

  // Determine if we're in custom mode
  const isCustomMode = customImageUrl !== null;

  // Component state
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Refs
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const loadTimeoutRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const retryCountRef = useRef(0);

  // Size configurations with more precise dimensions
  const sizeConfig = {
    xs: { container: 'h-6 w-6', text: 'text-xs', padding: 'p-0.5' },
    sm: { container: 'h-8 w-8', text: 'text-sm', padding: 'p-0.5' },
    md: { container: 'h-10 w-10', text: 'text-sm', padding: 'p-1' },
    lg: { container: 'h-12 w-12', text: 'text-base', padding: 'p-1' },
    xl: { container: 'h-16 w-16', text: 'text-lg', padding: 'p-1.5' },
    '2xl': { container: 'h-20 w-20', text: 'text-xl', padding: 'p-2' },
  };

  // Enhanced refresh handling with debouncing
  const handleRefresh = useCallback(() => {
    setImageError(false);
    setImageLoading(false);
    setImageLoaded(false);
    setRefreshKey((prev) => prev + 1);
    retryCountRef.current = 0;

    // Clear any existing timeouts
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, []);

  // Debounce utility
  const debounce = useCallback((func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  // Enhanced event listeners for refresh and page lifecycle (only for non-custom mode)
  useEffect(() => {
    if (isCustomMode) return;

    const events = [
      'logoRefresh',
      'groupDataUpdated',
      'visibilitychange',
      'focus',
    ];
    const debouncedRefresh = debounce(handleRefresh, 300);

    events.forEach((event) => {
      if (event === 'visibilitychange') {
        document.addEventListener(event, debouncedRefresh);
      } else {
        window.addEventListener(event, debouncedRefresh);
      }
    });

    // Handle page reload/refresh detection
    const handleBeforeUnload = () => {
      sessionStorage.setItem('logoRefreshNeeded', 'true');
    };

    const handlePageLoad = () => {
      if (sessionStorage.getItem('logoRefreshNeeded') === 'true') {
        sessionStorage.removeItem('logoRefreshNeeded');
        setTimeout(handleRefresh, 100);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handlePageLoad);

    // Check on mount if refresh is needed
    if (sessionStorage.getItem('logoRefreshNeeded') === 'true') {
      sessionStorage.removeItem('logoRefreshNeeded');
      setTimeout(handleRefresh, 100);
    }

    return () => {
      events.forEach((event) => {
        if (event === 'visibilitychange') {
          document.removeEventListener(event, debouncedRefresh);
        } else {
          window.removeEventListener(event, debouncedRefresh);
        }
      });
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handlePageLoad);
    };
  }, [handleRefresh, debounce, isCustomMode]);

  // Get current organization data (only for non-custom mode)
  const currentOrg = useMemo(() => {
    if (isCustomMode || !activeGroup) return null;

    // Prefer userInfo groups data if available (more up-to-date)
    const orgFromUserInfo = userInfo?.groups?.find(
      (g) => g._id === activeGroup._id,
    );
    return orgFromUserInfo || activeGroup;
  }, [activeGroup, userInfo?.groups, isCustomMode]);

  // Check if this is AirQo organization (only for non-custom mode)
  const isAirQo = useMemo(() => {
    if (isCustomMode || !showAirqoLogo || !currentOrg) return false;

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
  }, [currentOrg, isCustomMode, showAirqoLogo]);

  // Enhanced image URL validation and processing
  const imageUrl = useMemo(() => {
    // Custom mode - use provided URL
    if (isCustomMode) {
      if (
        !customImageUrl ||
        typeof customImageUrl !== 'string' ||
        !customImageUrl.trim()
      ) {
        return null;
      }

      try {
        // Validate URL format
        new URL(customImageUrl);
        return customImageUrl;
      } catch {
        // Try to construct a valid URL if it's a relative path
        if (customImageUrl.startsWith('/') || customImageUrl.startsWith('./')) {
          try {
            return new URL(customImageUrl, window.location.origin).href;
          } catch {
            return null;
          }
        }
        return null;
      }
    }

    // Organization mode
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
          const url = new URL(source);
          if (url.protocol === 'http:' || url.protocol === 'https:') {
            return source;
          }
        } catch {
          // Try to construct a valid URL if it's a relative path
          if (source.startsWith('/') || source.startsWith('./')) {
            try {
              return new URL(source, window.location.origin).href;
            } catch {
              continue;
            }
          }
          continue;
        }
      }
    }

    return null;
  }, [currentOrg, isAirQo, refreshKey, isCustomMode, customImageUrl]);

  // Generate organization display data
  const orgDisplay = useMemo(() => {
    let title, color;

    if (isCustomMode) {
      title = fallbackText || 'Logo';
      color = fallbackColor;
    } else {
      title = currentOrg?.grp_title || currentOrg?.grp_name || 'Organization';
    }

    // Generate initials
    const generateInitials = (text) => {
      const words = text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);

      if (words.length === 0) return isCustomMode ? 'IMG' : 'ORG';
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
      color: color || generateColor(title),
      title: title,
    };
  }, [currentOrg, isCustomMode, fallbackText, fallbackColor]);

  // Enhanced image event handlers
  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
    setImageError(false);
    setImageLoaded(true);
    retryCountRef.current = 0;

    // Clear loading timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
    setImageLoaded(false);

    // Clear loading timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }

    // Retry mechanism with exponential backoff (max 3 retries)
    if (retryCountRef.current < 3) {
      const delay = Math.pow(2, retryCountRef.current) * 1000; // 1s, 2s, 4s
      retryTimeoutRef.current = setTimeout(() => {
        retryCountRef.current += 1;
        setImageError(false);
        setRefreshKey((prev) => prev + 1);
      }, delay);
    }
  }, []);

  // Enhanced image loading management with proper cleanup
  useEffect(() => {
    // Clear any existing timeouts first
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    if (imageUrl && !imageError && !disabled) {
      setImageLoading(true);
      setImageLoaded(false);

      // Set loading timeout
      loadTimeoutRef.current = setTimeout(() => {
        if (!imageLoaded) {
          setImageLoading(false);
          setImageError(true);
        }
        loadTimeoutRef.current = null;
      }, 10000); // 10 second timeout
    } else {
      setImageLoading(false);
      setImageLoaded(false);
    }

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [imageUrl, refreshKey, imageError, disabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Get current size configuration
  const currentSizeConfig = sizeConfig[size] || sizeConfig.md;

  // Get container classes with custom styling support
  const containerClasses = `
    relative inline-flex items-center justify-center flex-shrink-0
    ${currentSizeConfig.container}
    ${containerClassName}
    ${className}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `
    .replace(/\s+/g, ' ')
    .trim();

  // Render AirQo logo with better fit (only in non-custom mode)
  if (!isCustomMode && isAirQo && !disabled) {
    return (
      <div
        ref={containerRef}
        className={`
          ${containerClasses}
          border-none outline-none
          bg-white dark:bg-gray-50
        `}
        data-testid="airqo-logo"
        title={orgDisplay.title}
        role="img"
        aria-label={`${orgDisplay.title} logo`}
      >
        <div className="w-full h-full flex items-center justify-center">
          <AirqoLogo />
        </div>
      </div>
    );
  }

  // Render organization/custom image with enhanced fitting
  if (imageUrl && !imageError && !disabled) {
    return (
      <div
        ref={containerRef}
        className={`
          ${containerClasses}
          bg-white dark:bg-gray-50
          overflow-hidden
          transition-all duration-300 ease-in-out
          ${imageLoading && !imageLoaded ? 'animate-pulse' : ''}
        `}
        data-testid={isCustomMode ? 'custom-image-logo' : 'org-image-logo'}
        title={orgDisplay.title}
        role="img"
        aria-label={`${orgDisplay.title} logo`}
      >
        {/* Loading skeleton - only show when actually loading */}
        {imageLoading && !imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
        )}

        {/* Image container with minimal padding for better coverage */}
        <div
          className={`relative w-full h-full ${size === 'xs' || size === 'sm' ? 'p-0' : 'p-0.5'}`}
        >
          <Image
            ref={imageRef}
            key={`${isCustomMode ? 'custom' : currentOrg?._id}-${refreshKey}`}
            src={imageUrl}
            alt={`${orgDisplay.title} logo`}
            fill
            sizes={`(max-width: 640px) ${currentSizeConfig.container}, (max-width: 768px) ${currentSizeConfig.container}, ${currentSizeConfig.container}`}
            className={`
              transition-all duration-500 ease-in-out
              object-cover
              ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
              ${imageClassName}
            `}
            style={{
              objectPosition: 'center',
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="eager"
            priority={size === 'lg' || size === 'xl' || size === '2xl'}
            unoptimized={false}
          />
        </div>
      </div>
    );
  }

  // Render initials fallback
  return (
    <div
      ref={containerRef}
      className={`
        ${containerClasses}
        rounded-full
        text-white font-semibold
        shadow-sm ring-2 ring-white dark:ring-gray-800
        transition-all duration-300 ease-in-out
        ${!disabled ? 'hover:shadow-md hover:scale-105' : ''}
        select-none
        ${currentSizeConfig.text}
      `}
      style={{ backgroundColor: orgDisplay.color }}
      title={orgDisplay.title}
      data-testid={isCustomMode ? 'custom-initials-logo' : 'org-initials-logo'}
      role="img"
      aria-label={`${orgDisplay.title} initials`}
    >
      <span className="font-medium tracking-tight drop-shadow-sm">
        {orgDisplay.initials}
      </span>
    </div>
  );
};

GroupLogo.displayName = 'GroupLogo';

GroupLogo.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  imageUrl: PropTypes.string,
  fallbackText: PropTypes.string,
  fallbackColor: PropTypes.string,
  showAirqoLogo: PropTypes.bool,
  containerClassName: PropTypes.string,
  imageClassName: PropTypes.string,
  disabled: PropTypes.bool,
};

export default React.memo(GroupLogo);
