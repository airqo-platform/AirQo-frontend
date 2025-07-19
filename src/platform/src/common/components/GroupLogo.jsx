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

// Utilities
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const isValidUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.trim()) return false;

  // Check for basic URL patterns first
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Check for relative URLs
  if (url.startsWith('/') || url.startsWith('./')) {
    return true;
  }

  // Check if it looks like a domain or URL without protocol
  if (url.includes('.') && !url.includes(' ')) {
    try {
      new URL(`https://${url}`);
      return true;
    } catch {
      return false;
    }
  }

  return false;
};

const normalizeUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.trim()) return null;

  const trimmedUrl = url.trim();

  // Already a full URL
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    try {
      return new URL(trimmedUrl).href;
    } catch {
      return null;
    }
  }

  // Relative URL
  if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./')) {
    try {
      return new URL(trimmedUrl, window.location.origin).href;
    } catch {
      return null;
    }
  }

  // Domain without protocol - add https
  if (trimmedUrl.includes('.') && !trimmedUrl.includes(' ')) {
    try {
      return new URL(`https://${trimmedUrl}`).href;
    } catch {
      return null;
    }
  }

  return null;
};

const generateInitials = (text, isCustom = false) => {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  if (words.length === 0) return isCustom ? 'IMG' : 'ORG';
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
};

const generateColor = (text) => {
  const colors = [
    '#EF4444',
    '#F97316',
    '#EAB308',
    '#22C55E',
    '#06B6D4',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#10B981',
    '#F59E0B',
  ];
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Size configurations
const SIZE_CONFIG = {
  xs: { container: 'h-6 w-6', text: 'text-xs', padding: 'p-0.5' },
  sm: { container: 'h-8 w-8', text: 'text-sm', padding: 'p-0.5' },
  md: { container: 'h-10 w-10', text: 'text-sm', padding: 'p-1' },
  lg: { container: 'h-12 w-12', text: 'text-base', padding: 'p-1' },
  xl: { container: 'h-16 w-16', text: 'text-lg', padding: 'p-1.5' },
  '2xl': { container: 'h-20 w-20', text: 'text-xl', padding: 'p-2' },
};

// Custom hook for image loading state
const useImageLoader = (imageUrl, disabled) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const retryCountRef = useRef(0);
  const loadTimeoutRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
    setImageError(false);
    setImageLoaded(true);
    retryCountRef.current = 0;
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
    setImageLoaded(false);

    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }

    // Retry with exponential backoff (max 3 retries)
    if (retryCountRef.current < 3) {
      const delay = Math.pow(2, retryCountRef.current) * 1000;
      retryTimeoutRef.current = setTimeout(() => {
        retryCountRef.current += 1;
        setImageError(false);
        setRefreshKey((prev) => prev + 1);
      }, delay);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setImageError(false);
    setImageLoading(false);
    setImageLoaded(false);
    setRefreshKey((prev) => prev + 1);
    retryCountRef.current = 0;

    [loadTimeoutRef, retryTimeoutRef].forEach((ref) => {
      if (ref.current) {
        clearTimeout(ref.current);
        ref.current = null;
      }
    });
  }, []);

  // Handle image loading timeout and state management
  useEffect(() => {
    if (imageUrl && !imageError && !disabled) {
      setImageLoading(true);
      setImageLoaded(false);

      // Clear existing timeout
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }

      loadTimeoutRef.current = setTimeout(() => {
        setImageLoading(false);
        setImageError(true);
        loadTimeoutRef.current = null;
      }, 10000);
    }

    return () => {
      [loadTimeoutRef, retryTimeoutRef].forEach((ref) => {
        if (ref.current) {
          clearTimeout(ref.current);
          ref.current = null;
        }
      });
    };
  }, [imageUrl, refreshKey, imageError, disabled]);

  return {
    imageError,
    imageLoading,
    imageLoaded,
    refreshKey,
    handleImageLoad,
    handleImageError,
    handleRefresh,
  };
};

// Custom hook for page refresh handling - MUCH more conservative
const usePageRefresh = (handleRefresh, isCustomMode) => {
  const lastRefreshRef = useRef(0);
  const isTabVisibleRef = useRef(true);

  useEffect(() => {
    if (isCustomMode) return;

    // Only refresh on specific events, not on every tab/visibility change
    const handleSpecificRefresh = debounce(() => {
      const now = Date.now();
      // Prevent excessive refreshing - minimum 30 seconds between refreshes
      if (now - lastRefreshRef.current < 30000) return;
      lastRefreshRef.current = now;
      handleRefresh();
    }, 1000); // Increased debounce time

    // Only listen to custom events that specifically request logo refresh
    window.addEventListener('logoRefresh', handleSpecificRefresh);
    window.addEventListener('groupDataUpdated', handleSpecificRefresh);

    // Handle visibility change more intelligently
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      const wasHidden = !isTabVisibleRef.current;
      isTabVisibleRef.current = isVisible;

      // Only refresh if tab was hidden for more than 5 minutes and now becomes visible
      if (isVisible && wasHidden) {
        const timeSinceLastRefresh = Date.now() - lastRefreshRef.current;
        if (timeSinceLastRefresh > 300000) {
          // 5 minutes
          handleSpecificRefresh();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('logoRefresh', handleSpecificRefresh);
      window.removeEventListener('groupDataUpdated', handleSpecificRefresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleRefresh, isCustomMode]);
};

// Custom hook for organization data
const useOrganizationData = (
  isCustomMode,
  customImageUrl,
  fallbackText,
  fallbackColor,
  showAirqoLogo,
) => {
  const userInfo = useSelector((state) => state.login?.userInfo);
  const activeGroup = useSelector((state) => state.groups?.activeGroup);

  const currentOrg = useMemo(() => {
    if (isCustomMode || !activeGroup) return null;
    const orgFromUserInfo = userInfo?.groups?.find(
      (g) => g._id === activeGroup._id,
    );
    return orgFromUserInfo || activeGroup;
  }, [activeGroup, userInfo?.groups, isCustomMode]);

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

  const imageUrl = useMemo(() => {
    if (isCustomMode) {
      return isValidUrl(customImageUrl) ? normalizeUrl(customImageUrl) : null;
    }

    if (!currentOrg || isAirQo) return null;

    const imageSources = [
      currentOrg.grp_profile_picture,
      currentOrg.grp_image,
      currentOrg.logo_url,
      currentOrg.imageUrl,
      currentOrg.logo,
    ];

    for (const source of imageSources) {
      if (source && typeof source === 'string' && source.trim()) {
        if (isValidUrl(source)) {
          const normalized = normalizeUrl(source);
          if (normalized) return normalized;
        }
      }
    }
    return null;
  }, [currentOrg, isAirQo, isCustomMode, customImageUrl]);

  const orgDisplay = useMemo(() => {
    const title = isCustomMode
      ? fallbackText || 'Logo'
      : currentOrg?.grp_title || currentOrg?.grp_name || 'Organization';

    return {
      initials: generateInitials(title, isCustomMode),
      color: fallbackColor || generateColor(title),
      title,
    };
  }, [currentOrg, isCustomMode, fallbackText, fallbackColor]);

  return { currentOrg, isAirQo, imageUrl, orgDisplay };
};

// Component for AirQo logo
const AirQoLogoComponent = ({ containerClasses, orgDisplay }) => (
  <div
    className={`${containerClasses} border-none outline-none`}
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

// Component for image logo
const ImageLogoComponent = ({
  containerClasses,
  orgDisplay,
  imageUrl,
  isCustomMode,
  currentOrg,
  refreshKey,
  imageLoading,
  imageLoaded,
  handleImageLoad,
  handleImageError,
  size,
  imageClassName,
}) => {
  const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  return (
    <div
      className={`
        ${containerClasses}
        overflow-hidden
        transition-all duration-300 ease-in-out
        ${imageLoading && !imageLoaded ? 'animate-pulse' : ''}
      `}
      data-testid={isCustomMode ? 'custom-image-logo' : 'org-image-logo'}
      title={orgDisplay.title}
      role="img"
      aria-label={`${orgDisplay.title} logo`}
    >
      {imageLoading && !imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
      )}

      <div
        className={`relative w-full h-full ${size === 'xs' || size === 'sm' ? 'p-0' : 'p-0.5'}`}
      >
        <Image
          key={`${isCustomMode ? 'custom' : currentOrg?._id}-${refreshKey}`}
          src={imageUrl}
          alt={`${orgDisplay.title} logo`}
          fill
          sizes={`(max-width: 640px) ${sizeConfig.container}, (max-width: 768px) ${sizeConfig.container}, ${sizeConfig.container}`}
          className={`
            transition-all duration-500 ease-in-out object-cover
            ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
            ${imageClassName}
          `}
          style={{ objectPosition: 'center' }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="eager"
          priority={['lg', 'xl', '2xl'].includes(size)}
          unoptimized={false}
        />
      </div>
    </div>
  );
};

// Component for initials fallback
const InitialsLogoComponent = ({
  containerClasses,
  orgDisplay,
  isCustomMode,
  disabled,
  sizeConfig,
}) => (
  <div
    className={`
      ${containerClasses} rounded-lg text-white font-semibold
      shadow-sm ring-2 ring-white dark:ring-gray-800
      transition-all duration-300 ease-in-out select-none
      ${!disabled ? 'hover:shadow-md hover:scale-105' : ''}
      ${sizeConfig.text}
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

// Main component
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
  const isCustomMode = customImageUrl !== null;

  const { currentOrg, isAirQo, imageUrl, orgDisplay } = useOrganizationData(
    isCustomMode,
    customImageUrl,
    fallbackText,
    fallbackColor,
    showAirqoLogo,
  );

  const {
    imageError,
    imageLoading,
    imageLoaded,
    refreshKey,
    handleImageLoad,
    handleImageError,
    handleRefresh,
  } = useImageLoader(imageUrl, disabled);

  usePageRefresh(handleRefresh, isCustomMode);

  const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const containerClasses = `
    relative inline-flex items-center justify-center flex-shrink-0
    ${sizeConfig.container} ${containerClassName} ${className}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `
    .replace(/\s+/g, ' ')
    .trim();

  // Render AirQo logo
  if (!isCustomMode && isAirQo && !disabled) {
    return (
      <AirQoLogoComponent
        containerClasses={containerClasses}
        orgDisplay={orgDisplay}
      />
    );
  }

  // Render image logo
  if (imageUrl && !imageError && !disabled) {
    return (
      <ImageLogoComponent
        containerClasses={containerClasses}
        orgDisplay={orgDisplay}
        imageUrl={imageUrl}
        isCustomMode={isCustomMode}
        currentOrg={currentOrg}
        refreshKey={refreshKey}
        imageLoading={imageLoading}
        imageLoaded={imageLoaded}
        handleImageLoad={handleImageLoad}
        handleImageError={handleImageError}
        size={size}
        imageClassName={imageClassName}
      />
    );
  }

  // Render initials fallback
  return (
    <InitialsLogoComponent
      containerClasses={containerClasses}
      orgDisplay={orgDisplay}
      isCustomMode={isCustomMode}
      disabled={disabled}
      sizeConfig={sizeConfig}
    />
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
