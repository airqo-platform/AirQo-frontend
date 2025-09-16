import { useState, useCallback } from 'react';

/**
 * Custom hook for managing password visibility state
 * @param {boolean} initialValue - Initial visibility state (default: false)
 * @returns {object} { showPassword, togglePasswordVisibility, setShowPassword }
 */
export const usePasswordVisibility = (initialValue = false) => {
  const [showPassword, setShowPassword] = useState(initialValue);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return {
    showPassword,
    togglePasswordVisibility,
    setShowPassword,
  };
};

/**
 * Custom hook for managing multiple password fields visibility
 * @param {object} initialValues - Initial visibility states for multiple fields
 * @returns {object} { passwordVisibility, togglePasswordVisibility }
 */
export const useMultiplePasswordVisibility = (initialValues = {}) => {
  const [passwordVisibility, setPasswordVisibility] = useState(initialValues);

  const togglePasswordVisibility = useCallback((fieldName) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  }, []);

  return {
    passwordVisibility,
    togglePasswordVisibility,
    setPasswordVisibility,
  };
};

/**
 * Custom hook for loading state management
 * @param {boolean} initialValue - Initial loading state (default: false)
 * @returns {object} { loading, setLoading, startLoading, stopLoading }
 */
export const useLoadingState = (initialValue = false) => {
  const [loading, setLoading] = useState(initialValue);

  const startLoading = useCallback(() => setLoading(true), []);
  const stopLoading = useCallback(() => setLoading(false), []);

  return {
    loading,
    setLoading,
    startLoading,
    stopLoading,
  };
};

/**
 * Custom hook for managing boolean toggle states (modal, drawer, etc.)
 * @param {boolean} initialValue - Initial state (default: false)
 * @returns {object} { isOpen, toggle, open, close, setIsOpen }
 */
export const useToggleState = (initialValue = false) => {
  const [isOpen, setIsOpen] = useState(initialValue);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return {
    isOpen,
    toggle,
    open,
    close,
    setIsOpen,
  };
};

const commonStateHooks = {
  usePasswordVisibility,
  useMultiplePasswordVisibility,
  useLoadingState,
  useToggleState,
};

export default commonStateHooks;