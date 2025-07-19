/**
 * Centralized error handling for map operations
 */
export class MapErrorHandler {
  static handleMapError(error, context = '') {
    console.error(`Map Error ${context}:`, error);
    // e.g., Sentry, LogRocket, etc.

    return {
      message: this.getErrorMessage(error, context),
      type: 'error',
      bgColor: 'bg-red-500',
    };
  }

  static getErrorMessage(error, context) {
    const defaultMessages = {
      'data-fetch': 'Failed to load map data. Please try again.',
      'style-load': 'Failed to load map style. Please try again.',
      geolocation: 'Unable to access your location.',
      screenshot: 'Failed to capture screenshot.',
      share: 'Failed to share location.',
      default: 'Something went wrong. Please try again.',
    };

    return defaultMessages[context] || defaultMessages.default;
  }

  static handleAsyncOperation = (operation, context = '') => {
    return async (...args) => {
      try {
        return await operation(...args);
      } catch (error) {
        throw this.handleMapError(error, context);
      }
    };
  };
}
