/**
 * Performance optimization utilities for map operations
 */
export class MapPerformanceOptimizer {
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  static createRequestIdleCallback(callback, options = {}) {
    if (window.requestIdleCallback) {
      return window.requestIdleCallback(callback, options);
    } else {
      return setTimeout(callback, 0);
    }
  }

  static optimizeMapForDevice() {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    return {
      antialias: !isMobile,
      preserveDrawingBuffer: true,
      renderWorldCopies: false,
      refreshExpiredTiles: false,
      maxTileCacheSize: isMobile ? 25 : 50,
      optimizeForTerrain: !isMobile,
    };
  }
}
