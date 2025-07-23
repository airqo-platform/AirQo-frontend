/**
 * Chart configuration constants
 */
export const CHART_CONFIG = {
  // Unified dimensions - single source of truth
  dimensions: {
    defaultHeight: 250,
    minHeight: 220,
    maxHeight: 600,
    aspectRatio: 16 / 9,
  },

  // Simplified padding - removed from chart content, handled by container
  spacing: {
    containerPadding: '0.5rem',
    chartMargin: { top: 20, right: 20, bottom: 60, left: 20 },
  },

  // Export settings
  export: {
    quality: 0.95,
    scale: 2,
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: '12px',
    fontWeight: '500',
    exportDelay: 500,
    pdfMargin: 20,
  },

  // Animation and transition settings
  animation: {
    skeletonDelay: 500,
    refreshTimeout: 10000,
    transitionDuration: 200,
  },

  // Theme settings
  theme: {
    light: {
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      borderColor: '#E5E7EB',
      cardBackground: '#FFFFFF',
      errorColor: '#EF4444',
      successColor: '#10B981',
    },
    dark: {
      backgroundColor: '#1F2937',
      textColor: '#F9FAFB',
      borderColor: '#374151',
      cardBackground: '#374151',
      errorColor: '#F87171',
      successColor: '#34D399',
    },
  },

  // Responsive breakpoints
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    wide: 1280,
  },

  // Chart specific settings
  chart: {
    gridOpacity: 0.3,
    legendMargin: 16,
    tooltipZIndex: 100,
    axisTickFontSize: 12,
    legendFontSize: 14,
  },
};

/**
 * Get theme-specific colors
 * @param {boolean} isDark - Whether dark theme is active
 * @returns {Object} Theme colors
 */
export const getThemeColors = (isDark) => {
  return isDark ? CHART_CONFIG.theme.dark : CHART_CONFIG.theme.light;
};

/**
 * Get responsive chart dimensions based on container width
 * @param {number} containerWidth - Container width
 * @returns {Object} Responsive dimensions
 */
export const getResponsiveDimensions = (containerWidth) => {
  const { breakpoints, dimensions } = CHART_CONFIG;

  if (containerWidth <= breakpoints.mobile) {
    return {
      ...dimensions,
      defaultHeight: 200,
      minHeight: 180,
    };
  }

  if (containerWidth <= breakpoints.tablet) {
    return {
      ...dimensions,
      defaultHeight: 220,
      minHeight: 200,
    };
  }

  return dimensions;
};

/**
 * Get export configuration
 * @param {Object} options - Override options
 * @returns {Object} Export configuration
 */
export const getExportConfig = (options = {}) => {
  return {
    ...CHART_CONFIG.export,
    ...options,
  };
};
