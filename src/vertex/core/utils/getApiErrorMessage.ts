import axios from 'axios';

// This interface covers the various error shapes
interface ApiErrorResponse {
    message?: string;
    errors?:
    | { [key: string]: { msg?: string; message?: string } | string[] | string } // Added string support
    | { message?: string }
    | string;
}

interface ErrorWithData extends Error {
    data?: ApiErrorResponse | string;
}

const getMessageFromApiData = (data: ApiErrorResponse | string): string | null => {
    if (typeof data === 'string') {
        return data;
    }

    // 1. Nested validation errors: { "errors": { "field": { "msg": "..." } } } OR { "errors": { "field": "..." } }
    if (typeof data.errors === 'object' && data.errors !== null && !('message' in data.errors)) {
        const errorValues = Object.values(data.errors);
        if (errorValues.length > 0) {
            const firstError = errorValues[0];
            if (typeof firstError === 'string') return firstError; // Handle direct string errors
            if (Array.isArray(firstError) && firstError[0]) return String(firstError[0]);
            if (typeof firstError === 'object') {
                const maybeMsg = (firstError as { msg?: string; message?: string }).msg ?? (firstError as { message?: string }).message;
                if (maybeMsg) return maybeMsg;
            }
        }
    }

    // 2. Simple errors object: { "errors": { "message": "..." } }
    if (typeof data.errors === 'object' && data.errors !== null && (data.errors as { message: string }).message) {
        return (data.errors as { message: string }).message;
    }

    // 3. String inside errors: { "errors": "..." }
    if (typeof data.errors === 'string') {
        return data.errors;
    }

    // 4. Top-level message: { "message": "..." }
    if (data.message) {
        return data.message;
    }

    return null;
};

/**
 * Extracts the most specific error message from an API error response.
 * It gracefully handles various error formats from the backend.
 * @param error The error object, usually from a catch block.
 * @returns A user-friendly error message string.
 */
export const getApiErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
            return 'Request timed out. Please check your connection and try again.';
        }

        if (error.response?.data) {
            const message = getMessageFromApiData(error.response.data as ApiErrorResponse | string);
            if (message) return message;
        }
    }

    // 5. Fetch/custom errors with preserved backend payload: Object.assign(new Error(...), { data })
    if (error instanceof Error && 'data' in error) {
        const message = getMessageFromApiData((error as ErrorWithData).data ?? {});
        if (message) return message;
    }

    // 6. Fallback to standard Error message
    if (error instanceof Error) {
        return error.message;
    }

    // 7. Generic fallback
    return 'An unexpected error occurred. Please try again.';
};
