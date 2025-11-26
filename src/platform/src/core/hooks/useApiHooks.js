import { useCallback, useRef, useEffect, useState } from 'react';
import { useLoadingState } from './useCommonStates';
import logger from '@/lib/logger';

/**
 * Custom hook for handling API calls with loading states, error handling, and cleanup
 * @param {function} apiFunction - The API function to call
 * @param {object} options - Configuration options
 * @param {function} options.onSuccess - Success callback
 * @param {function} options.onError - Error callback
 * @param {function} options.onFinally - Finally callback
 * @param {boolean} options.showToast - Whether to show toast notifications
 * @param {object} options.toastConfig - Toast configuration
 * @returns {object} { callApi, loading, error, data }
 */
export const useApiCall = (apiFunction, options = {}) => {
  const {
    onSuccess = () => {},
    onError = () => {},
    onFinally = () => {},
    showToast = false,
    toastConfig = {},
  } = options;

  const { loading, startLoading, stopLoading } = useLoadingState(false);
  const isMountedRef = useRef(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const callApi = useCallback(
    async (...args) => {
      if (!isMountedRef.current || loading) return;

      startLoading();
      // clear previous error
      setError(null);

      try {
        const response = await apiFunction(...args);

        if (!isMountedRef.current) return;

        // update reactive state only when component still mounted
        setData(response);
        onSuccess(response);

        if (showToast && toastConfig.successMessage) {
          // Import and use toast here if needed
          logger.info('API call successful:', response);
        }

        return response;
      } catch (error) {
        // Always log and rethrow the error so promise rejection semantics are preserved.
        logger.error('API call failed:', error);
        if (isMountedRef.current) {
          setError(error);
        }
        // Allow consumers to react to the error even if unmounted.
        onError(error);

        if (showToast && toastConfig.errorMessage) {
          // Import and use toast here if needed
          logger.error('API call error:', error.message);
        }

        throw error;
      } finally {
        if (isMountedRef.current) {
          stopLoading();
        }
        // Always call the finally callback so callers can run cleanup regardless of mount state
        onFinally();
      }
    },
    [
      apiFunction,
      loading,
      startLoading,
      stopLoading,
      onSuccess,
      onError,
      onFinally,
      showToast,
      toastConfig,
    ],
  );

  return {
    callApi,
    loading,
    error,
    data,
  };
};

/**
 * Custom hook for handling form submissions with validation and API calls
 * @param {function} validationSchema - Yup validation schema
 * @param {function} submitFunction - Function to call on successful validation
 * @param {object} options - Configuration options
 * @returns {object} { handleSubmit, loading, errors, clearErrors }
 */
export const useFormSubmission = (
  validationSchema,
  submitFunction,
  options = {},
) => {
  const {
    onValidationError = () => {},
    onSubmitSuccess = () => {},
    onSubmitError = () => {},
  } = options;

  const { loading, startLoading, stopLoading } = useLoadingState(false);
  const isMountedRef = useRef(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const clearErrors = useCallback(() => setErrors({}), []);

  const handleSubmit = useCallback(
    async (formData, ...args) => {
      if (!isMountedRef.current || loading) return;

      startLoading();
      clearErrors();

      try {
        // Validate form data
        if (validationSchema) {
          await validationSchema.validate(formData, { abortEarly: false });
        }

        // Call submit function
        const result = await submitFunction(formData, ...args);

        if (!isMountedRef.current) return;

        onSubmitSuccess(result);
        return result;
      } catch (error) {
        // Don't swallow errors when component unmounts; always process and rethrow.
        if (error.name === 'ValidationError') {
          // Handle validation errors and harden mapping in case error.inner is missing
          const validationErrors = {};
          if (Array.isArray(error.inner) && error.inner.length > 0) {
            error.inner.forEach((err) => {
              if (err && err.path) validationErrors[err.path] = err.message;
            });
          } else if (error.path) {
            validationErrors[error.path] = error.message;
          } else {
            // Fallback generic key
            validationErrors._error = error.message || 'Validation error';
          }
          if (isMountedRef.current) setErrors(validationErrors);
          // Notify consumer even if unmounted
          onValidationError(validationErrors);
        } else {
          // Handle submission errors
          logger.error('Form submission error:', error);
          onSubmitError(error);
        }

        throw error;
      } finally {
        if (isMountedRef.current) {
          stopLoading();
        }
      }
    },
    [
      validationSchema,
      submitFunction,
      loading,
      startLoading,
      stopLoading,
      clearErrors,
      onValidationError,
      onSubmitSuccess,
      onSubmitError,
    ],
  );

  return {
    handleSubmit,
    loading,
    errors,
    clearErrors,
  };
};

/**
 * Custom hook for handling data fetching with loading and error states
 * @param {function} fetchFunction - Function to fetch data
 * @param {array} dependencies - Dependencies to trigger refetch
 * @param {object} options - Configuration options
 * @returns {object} { data, loading, error, refetch }
 */
export const useDataFetcher = (
  fetchFunction,
  dependencies = [],
  options = {},
) => {
  const {
    immediate = true,
    onSuccess = () => {},
    onError = () => {},
  } = options;

  const { loading, startLoading, stopLoading } = useLoadingState(false);
  const isMountedRef = useRef(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(
    async (...args) => {
      if (!isMountedRef.current) return;

      startLoading();
      // clear previous error
      setError(null);

      try {
        const result = await fetchFunction(...args);

        if (!isMountedRef.current) return;

        setData(result);
        onSuccess(result);
        return result;
      } catch (error) {
        // Preserve rejection semantics; only guard state updates
        logger.error('Data fetch error:', error);
        if (isMountedRef.current) setError(error);
        onError(error);
        throw error;
      } finally {
        if (isMountedRef.current) {
          stopLoading();
        }
      }
    },
    [fetchFunction, startLoading, stopLoading, onSuccess, onError],
  );

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, fetchData, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

const apiHooks = {
  useApiCall,
  useFormSubmission,
  useDataFetcher,
};

export default apiHooks;
