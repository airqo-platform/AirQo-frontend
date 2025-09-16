import { useCallback, useRef, useEffect } from 'react';
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
  const dataRef = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const callApi = useCallback(
    async (...args) => {
      if (!isMountedRef.current || loading) return;

      startLoading();
      errorRef.current = null;

      try {
        const response = await apiFunction(...args);

        if (!isMountedRef.current) return;

        dataRef.current = response;
        onSuccess(response);

        if (showToast && toastConfig.successMessage) {
          // Import and use toast here if needed
          logger.info('API call successful:', response);
        }

        return response;
      } catch (error) {
        if (!isMountedRef.current) return;

        logger.error('API call failed:', error);
        errorRef.current = error;
        onError(error);

        if (showToast && toastConfig.errorMessage) {
          // Import and use toast here if needed
          logger.error('API call error:', error.message);
        }

        throw error;
      } finally {
        if (isMountedRef.current) {
          stopLoading();
          onFinally();
        }
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
    error: errorRef.current,
    data: dataRef.current,
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
  const errorsRef = useRef({});

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const clearErrors = useCallback(() => {
    errorsRef.current = {};
  }, []);

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
        if (!isMountedRef.current) return;

        if (error.name === 'ValidationError') {
          // Handle validation errors
          const validationErrors = {};
          error.inner.forEach((err) => {
            validationErrors[err.path] = err.message;
          });
          errorsRef.current = validationErrors;
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
    errors: errorsRef.current,
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
  const dataRef = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(
    async (...args) => {
      if (!isMountedRef.current) return;

      startLoading();
      errorRef.current = null;

      try {
        const result = await fetchFunction(...args);

        if (!isMountedRef.current) return;

        dataRef.current = result;
        onSuccess(result);
        return result;
      } catch (error) {
        if (!isMountedRef.current) return;

        logger.error('Data fetch error:', error);
        errorRef.current = error;
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
    data: dataRef.current,
    loading,
    error: errorRef.current,
    refetch: fetchData,
  };
};

const apiHooks = {
  useApiCall,
  useFormSubmission,
  useDataFetcher,
};

export default apiHooks;
