import CustomToast from '@/common/components/Toast/CustomToast';
import { getNotificationConfig } from './statusText';

// Ensure we always pass a human-readable string to the toast layer
const normalizeMessage = (input) => {
  if (!input) return null;
  if (typeof input === 'string') return input;
  if (input?.message) return input.message;
  try {
    return JSON.stringify(input);
  } catch {
    return String(input);
  }
};

/**
 * Enhanced notification utility that provides standardized toast messages
 * based on HTTP status codes with support for custom message overrides
 */
class NotificationService {
  /**
   * Show a notification based on status code with optional custom message
   * @param {number|string} statusCode - HTTP status code
   * @param {string} [customMessage] - Optional custom message to override default
   * @param {Object} [options] - Additional toast options
   * @returns {string|number} Toast ID for manual dismissal
   */
  static showNotification(statusCode, customMessage = null, options = {}) {
    const { message, type } = getNotificationConfig(
      statusCode,
      normalizeMessage(customMessage),
    );

    return CustomToast({
      message,
      type,
      ...options,
    });
  }

  /**
   * Show success notification (200-299 status codes)
   */
  static success(statusCode = 200, customMessage = null, options = {}) {
    return this.showNotification(statusCode, customMessage, {
      type: 'success',
      ...options,
    });
  }

  /**
   * Show error notification (400+ status codes)
   */
  static error(statusCode = 500, customMessage = null, options = {}) {
    return this.showNotification(statusCode, customMessage, {
      type: 'error',
      duration: 7000, // Longer duration for errors
      ...options,
    });
  }

  /**
   * Show warning notification
   */
  static warning(statusCode = 422, customMessage = null, options = {}) {
    return this.showNotification(statusCode, customMessage, {
      type: 'warning',
      duration: 6000,
      ...options,
    });
  }

  /**
   * Show info notification
   */
  static info(statusCode = 200, customMessage = null, options = {}) {
    return this.showNotification(statusCode, customMessage, {
      type: 'info',
      ...options,
    });
  }

  /**
   * Handle API response and show appropriate notification
   * @param {Object} response - API response object
   * @param {string} [customMessage] - Optional custom message
   * @param {Object} [options] - Additional toast options
   * @returns {string|number} Toast ID
   */
  static handleApiResponse(response, customMessage = null, options = {}) {
    const statusCode = response?.status || response?.statusCode || 200;
    return this.showNotification(
      statusCode,
      normalizeMessage(customMessage),
      options,
    );
  }

  /**
   * Handle API error and show appropriate notification
   * @param {Object} error - Error object from API
   * @param {string} [customMessage] - Optional custom message
   * @param {Object} [options] - Additional toast options
   * @returns {string|number} Toast ID
   */
  static handleApiError(error, customMessage = null, options = {}) {
    // Extract status code from various error structures
    if (error?.name === 'AbortError') return null; // don't toast cancelations
    const statusCode =
      error?.response?.status ||
      error?.status ||
      error?.statusCode ||
      (/\b(Network Error|Failed to fetch|ECONNABORTED)\b/i.test(
        error?.message || '',
      )
        ? 503
        : 500);

    return this.showNotification(
      statusCode,
      normalizeMessage(customMessage || error),
      {
        type: 'error',
        duration: 7000,
        ...options,
      },
    );
  }

  /**
   * Handle promise-based operations with loading, success, and error states
   * @param {Promise} promise - Promise to handle
   * @param {Object} messages - Custom messages for each state
   * @param {Object} options - Additional options
   */
  static async handlePromise(promise, messages = {}, options = {}) {
    const {
      loading = 'Processing...',
      success: successMessage,
      error: errorMessage,
    } = messages;

    return CustomToast.promise(promise, {
      loading,
      success: (data) => {
        const statusCode = data?.status || data?.statusCode || 200;
        const { message } = getNotificationConfig(statusCode, successMessage);
        return message;
      },
      error: (err) => {
        const statusCode =
          err?.response?.status || err?.status || err?.statusCode || 500;
        const { message } = getNotificationConfig(statusCode, errorMessage);
        return message;
      },
      ...options,
    });
  }

  /**
   * Dismiss notification(s)
   * @param {string|number} [toastId] - Specific toast ID to dismiss, or leave empty to dismiss all
   */
  static dismiss(toastId) {
    CustomToast.dismiss(toastId);
  }

  /**
   * Check if notifications are supported
   */
  static isSupported() {
    return CustomToast.isSupported();
  }
}

/**
 * Convenience function for quick status-based notifications
 * @param {number|string} statusCode - HTTP status code
 * @param {string} [customMessage] - Optional custom message
 * @param {Object} [options] - Additional options
 */
export const notify = (statusCode, customMessage = null, options = {}) => {
  return NotificationService.showNotification(
    statusCode,
    customMessage,
    options,
  );
};

/**
 * Convenience function for API response handling
 * @param {Object} response - API response
 * @param {string} [customMessage] - Optional custom message
 * @param {Object} [options] - Additional options
 */
export const notifyApiResponse = (
  response,
  customMessage = null,
  options = {},
) => {
  return NotificationService.handleApiResponse(
    response,
    customMessage,
    options,
  );
};

/**
 * Convenience function for API error handling
 * @param {Object} error - API error
 * @param {string} [customMessage] - Optional custom message
 * @param {Object} [options] - Additional options
 */
export const notifyApiError = (error, customMessage = null, options = {}) => {
  return NotificationService.handleApiError(error, customMessage, options);
};

export default NotificationService;
