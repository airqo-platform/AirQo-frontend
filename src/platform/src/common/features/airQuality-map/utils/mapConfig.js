import { MAP_CONFIG } from '../constants/mapConstants';

/**
 * Creates optimized Mapbox configuration
 */
export const createMapboxConfig = (container, styleUrl, center, zoom) => {
  return {
    container,
    style: styleUrl,
    projection: MAP_CONFIG.PROJECTION,
    center,
    zoom,
    preserveDrawingBuffer: true,
    ...MAP_CONFIG.PERFORMANCE,
    transformRequest: (url, resourceType) => {
      if (resourceType === 'Source' && url.includes('mapbox')) {
        return {
          url,
          headers: {
            'Accept-Encoding': 'gzip, br',
          },
        };
      }
    },
  };
};

/**
 * Gets default style URL based on theme
 */
export const getDefaultStyleUrl = (mapStyles, isDarkMode) => {
  if (!Array.isArray(mapStyles)) {
    const light = mapStyles.light?.url;
    const dark = mapStyles.dark?.url;
    const fallback = Object.values(mapStyles)[0]?.url;
    return isDarkMode ? dark || light || fallback : light || dark || fallback;
  }

  const key = isDarkMode ? 'dark' : 'light';
  const found = mapStyles.find((s) => s.id === key || s.key === key);
  return found?.url || mapStyles[0]?.url;
};
