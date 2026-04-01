import axios from 'axios';

interface ApiErrorResponse {
  message?: string;
  errors?:
    | { [key: string]: { msg?: string; message?: string } | string[] | string }
    | { message?: string }
    | string;
}

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please check your connection and try again.';
    }

    if (error.response?.data) {
      const data = error.response.data as ApiErrorResponse;

      if (typeof data.errors === 'object' && data.errors !== null && !('message' in data.errors)) {
        const errorValues = Object.values(data.errors);
        if (errorValues.length > 0) {
          const firstError = errorValues[0];
          if (typeof firstError === 'string') return firstError;
          if (Array.isArray(firstError) && firstError[0]) return String(firstError[0]);
          if (typeof firstError === 'object') {
            const maybeMsg = (firstError as { msg?: string; message?: string }).msg ??
              (firstError as { message?: string }).message;
            if (maybeMsg) return maybeMsg;
          }
        }
      }

      if (typeof data.errors === 'object' && data.errors !== null && (data.errors as { message: string }).message) {
        return (data.errors as { message: string }).message;
      }

      if (typeof data.errors === 'string') {
        return data.errors;
      }

      if (data.message) {
        return data.message;
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};