import axios from 'axios';

/**
 * Extracts the most specific error message from an API error response.
 * It gracefully handles various error formats from the backend.
 * @param {unknown} error The error object, usually from a catch block.
 * @returns {string} A user-friendly error message string.
 */
export const getApiErrorMessage = (error) => {
  // Handle Axios-specific network errors first
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please check your connection and try again.';
    }
  }

  // Now, check for a response body, which is common to Axios and other errors.
  // This allows the function to be used with non-Axios errors that have a similar structure.
  if (error?.response?.data) {
    const data = error.response.data;

    // Case 1: Nested validation errors: { "errors": [{ "message": "..." }] } or { "errors": { "field": { "msg": "..." } } }
    if (data.errors && typeof data.errors === 'object' && !('message' in data.errors)) {
      const errorValues = Object.values(data.errors);
      if (errorValues.length > 0) {
        const firstError = errorValues[0];

        // Handles { "errors": [{ "message": "..." }] }
        if (typeof firstError === 'object' && firstError !== null && firstError.message) {
          return firstError.message;
        }

        // Handles { "errors": { "field": "..." } }
        if (typeof firstError === 'string') {
          return firstError;
        }

        // Handles { "errors": { "field": ["..."] } }
        if (Array.isArray(firstError) && firstError[0]) {
          return String(firstError[0]);
        }

        // Handles { "errors": { "field": { "msg": "..." } } }
        if (typeof firstError === 'object' && firstError !== null) {
          const maybeMsg = firstError.msg ?? firstError.message;
          if (maybeMsg) return maybeMsg;
        }
      }
    }

    // Case 2: Simple errors object: { "errors": { "message": "..." } }
    if (data.errors && typeof data.errors === 'object' && data.errors.message) {
      return data.errors.message;
    }

    // Case 3: String inside errors: { "errors": "..." }
    if (typeof data.errors === 'string') {
      return data.errors;
    }

    // Case 4: Top-level message: { "message": "..." }
    if (data.message) {
      return data.message;
    }
  }

  // Case 5: Fallback to standard Error message
  if (error instanceof Error) {
    return error.message;
  }

  // Case 6: Generic fallback
  return 'An unexpected error occurred. Please try again.';
};