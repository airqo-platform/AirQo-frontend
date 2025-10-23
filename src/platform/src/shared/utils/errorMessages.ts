import type { AxiosError } from 'axios';

// Error mapping interface for custom error messages
export interface ErrorMapping {
  // HTTP status codes
  [statusCode: number]: string;
  // Error types/messages
  [errorType: string]: string;
}

// API Error Response interface
interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  errors?: Array<{
    param?: string;
    message?: string;
    location?: string;
  }>;
}

// Default error mappings for common HTTP status codes and error types
const DEFAULT_ERROR_MAPPINGS: ErrorMapping = {
  // HTTP Status Codes
  400: 'Invalid request. Please check your input and try again.',
  401: 'Authentication failed. Please check your credentials.',
  403: 'Access denied. You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  408: 'Request timeout. Please try again.',
  409: 'Conflict occurred. The resource may already exist.',
  422: 'Validation failed. Please check your input.',
  429: 'Too many requests. Please wait a moment before trying again.',
  500: 'Server error. Please try again later.',
  502: 'Service temporarily unavailable. Please try again later.',
  503: 'Service temporarily unavailable. Please try again later.',
  504: 'Gateway timeout. Please try again later.',

  // Specific API Error Messages
  'This endpoint does not exist':
    'Service temporarily unavailable. Please try again later.',
  'Invalid credentials':
    'Invalid email or password. Please check your credentials and try again.',
  invalid:
    'Invalid email or password. Please check your credentials and try again.',
  wrong:
    'Invalid email or password. Please check your credentials and try again.',
  network:
    'Network error. Please check your internet connection and try again.',
  connection:
    'Network error. Please check your internet connection and try again.',
  timeout: 'Request timeout. Please try again.',
  'rate limit':
    'Too many login attempts. Please wait a few minutes before trying again.',
  'too many':
    'Too many login attempts. Please wait a few minutes before trying again.',
  account:
    'Your account has been temporarily locked due to multiple failed login attempts. Please try again later or contact support.',
  locked:
    'Your account has been temporarily locked due to multiple failed login attempts. Please try again later or contact support.',
  email: 'Please verify your email address before signing in.',
  'not verified': 'Please verify your email address before signing in.',
  'Login failed': 'Login failed. Please check your credentials and try again.',

  // NextAuth Error Messages
  CredentialsSignin:
    'Invalid email or password. Please check your credentials and try again.',
  EmailSignin: 'Unable to send sign-in email. Please try again later.',
  OAuthSignin:
    'Unable to sign in with the selected provider. Please try again.',
  OAuthCallback: 'Unable to complete sign-in. Please try again.',
  OAuthCreateAccount:
    'Unable to create account with the selected provider. Please try again.',
  EmailCreateAccount:
    'Unable to create account with the provided email. Please try again.',
  Callback: 'Unable to complete sign-in. Please try again.',
  OAuthAccountNotLinked:
    'This account is not linked to the selected provider. Please sign in with your original provider.',
  SessionRequired: 'You must be signed in to access this page.',
  AccessDenied:
    'Access denied. You do not have permission to access this resource.',
  Configuration:
    'There is a problem with the server configuration. Please try again later.',
  Default: 'Something went wrong. Please try again.',
};

/**
 * Get user-friendly error message from various error sources
 * @param error - The error object (can be AxiosError, string, or any error)
 * @param customMappings - Optional custom error mappings to override defaults
 * @returns User-friendly error message
 */
export function getUserFriendlyErrorMessage(
  error: unknown,
  customMappings?: Partial<ErrorMapping>
): string {
  // Merge default mappings with custom ones
  const errorMappings = { ...DEFAULT_ERROR_MAPPINGS, ...customMappings };

  // Handle null/undefined errors
  if (!error) {
    return (
      errorMappings['Default'] ||
      'An unexpected error occurred. Please try again.'
    );
  }

  // Handle string errors directly
  if (typeof error === 'string') {
    // Check for exact matches first
    if (errorMappings[error]) {
      return errorMappings[error];
    }

    // Check for partial matches in error message
    for (const [key, message] of Object.entries(errorMappings)) {
      if (
        typeof key === 'string' &&
        error.toLowerCase().includes(key.toLowerCase())
      ) {
        return (
          message ||
          errorMappings['Default'] ||
          'An unexpected error occurred. Please try again.'
        );
      }
    }

    // Return the original error if it's already user-friendly
    return error;
  }

  // Handle Axios errors
  if ((error as AxiosError).isAxiosError || (error as AxiosError).response) {
    const axiosError = error as AxiosError;

    // Priority 1: Check response.data.errors array for specific error messages
    if (axiosError.response?.data) {
      const responseData = axiosError.response.data as ApiErrorResponse;

      // Handle errors array if present and has items
      if (
        responseData.errors &&
        Array.isArray(responseData.errors) &&
        responseData.errors.length > 0
      ) {
        // Look for the first error with a message
        for (const errorItem of responseData.errors) {
          if (errorItem.message && typeof errorItem.message === 'string') {
            return errorItem.message;
          }
        }
      }
    }

    // Priority 2: Check HTTP status code for preset error messages
    if (
      axiosError.response?.status &&
      errorMappings[axiosError.response.status]
    ) {
      const statusMessage = errorMappings[axiosError.response.status];
      if (typeof statusMessage === 'string') {
        return statusMessage;
      }
    }

    // Priority 3: Check response data for general API message (fallback)
    if (axiosError.response?.data) {
      const responseData = axiosError.response.data as ApiErrorResponse;

      if (responseData.message && typeof responseData.message === 'string') {
        // Only use the root message if we didn't find specific errors above
        // and it's not a generic error message
        const rootMessage = responseData.message.toLowerCase();
        if (
          !rootMessage.includes('request failed') &&
          !rootMessage.includes('bad request') &&
          !rootMessage.includes('axioserror')
        ) {
          return responseData.message;
        }
      }
    }

    // Priority 4: Network/timeout errors
    if (
      axiosError.code === 'NETWORK_ERROR' ||
      axiosError.code === 'ECONNABORTED'
    ) {
      return (
        errorMappings['network'] ||
        'Network error. Please check your internet connection and try again.'
      );
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    const errorMessage = error.message;

    // Check for exact matches
    if (errorMappings[errorMessage]) {
      return errorMappings[errorMessage];
    }

    // Check for partial matches
    for (const [key, message] of Object.entries(errorMappings)) {
      if (
        typeof key === 'string' &&
        errorMessage.toLowerCase().includes(key.toLowerCase())
      ) {
        return (
          message ||
          errorMappings['Default'] ||
          'An unexpected error occurred. Please try again.'
        );
      }
    }

    // Return error message if it's user-friendly
    return errorMessage;
  }

  // Handle NextAuth error objects
  if (typeof error === 'object' && error !== null && 'error' in error) {
    const nextAuthError = (error as { error: string }).error;

    if (errorMappings[nextAuthError]) {
      return errorMappings[nextAuthError];
    }
  }

  // Final fallback
  return (
    errorMappings['Default'] ||
    'An unexpected error occurred. Please try again.'
  );
}

/**
 * Create a customized error message getter with predefined mappings
 * @param customMappings - Custom error mappings
 * @returns Function that gets user-friendly error messages with custom mappings
 */
export function createErrorMessageGetter(
  customMappings: Partial<ErrorMapping>
) {
  return (error: unknown) => getUserFriendlyErrorMessage(error, customMappings);
}

// Export default mappings for reference
export { DEFAULT_ERROR_MAPPINGS };
