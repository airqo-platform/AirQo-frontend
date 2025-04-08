'use client';
import React, { useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

export const MESSAGE_TYPES = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  SUCCESS: 'success',
};

const EnhancedFooter = ({
  message = '',
  messageType = MESSAGE_TYPES.INFO,
  setError,
  selectedItems = [],
  handleClearSelection,
  handleSubmit,
  onClose,
  btnText = 'Submit',
  loading = false,
  disabled = false,
  errorTimeout = 5000, // Configurable error timeout
  minimumSelection = 0, // Set to 1 for AddLocations component
}) => {
  // Track timer for cleanup
  const timeoutRef = useRef(null);

  // Auto-clear error messages after specified timeout
  useEffect(() => {
    if (
      message &&
      (messageType === MESSAGE_TYPES.ERROR ||
        messageType === MESSAGE_TYPES.WARNING) &&
      setError
    ) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setError('');
        timeoutRef.current = null;
      }, errorTimeout);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, messageType, setError, errorTimeout]);

  // Memoized message styles
  const messageStyles = useMemo(() => {
    const styleMap = {
      [MESSAGE_TYPES.ERROR]: 'text-red-600',
      [MESSAGE_TYPES.WARNING]: 'text-amber-600',
      [MESSAGE_TYPES.SUCCESS]: 'text-green-600',
      [MESSAGE_TYPES.INFO]: 'text-blue-600',
    };
    return styleMap[messageType] || 'text-blue-600';
  }, [messageType]);

  // Determine if clear button should be shown
  const showClearButton = useMemo(() => {
    // Only show if we have items selected AND more than the minimum required
    return selectedItems.length > minimumSelection && handleClearSelection;
  }, [selectedItems.length, handleClearSelection, minimumSelection]);

  // Button hover animation
  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.03 },
    tap: { scale: 0.98 },
    disabled: { opacity: 0.7 },
  };

  // Message animation
  const messageVariants = {
    initial: { opacity: 0, y: 5, height: 0 },
    animate: {
      opacity: 1,
      y: 0,
      height: 'auto',
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 sm:px-6 flex flex-col md:flex-row items-start md:items-center gap-2 justify-between shadow-lg z-10">
      {/* Animated message area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message || 'status'}
          className="text-sm leading-5 font-normal flex-1 mb-2 md:mb-0 overflow-hidden"
          variants={messageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {message ? (
            <span className={messageStyles}>{message}</span>
          ) : (
            <span className="text-gray-500">
              {selectedItems.length > 0
                ? `${selectedItems.length} ${selectedItems.length === 1 ? 'item' : 'items'} selected`
                : 'Select items to continue'}
            </span>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex w-full md:w-auto gap-2 justify-end">
        {/* Conditionally render clear button */}
        <AnimatePresence>
          {showClearButton && (
            <motion.button
              type="button"
              onClick={handleClearSelection}
              className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-100 transition-colors ease-in-out duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              disabled={loading}
              variants={buttonVariants}
              initial="idle"
              animate="idle"
              whileHover="hover"
              whileTap="tap"
              exit={{ opacity: 0, width: 0, padding: 0, margin: 0 }}
            >
              Clear
            </motion.button>
          )}
        </AnimatePresence>

        {/* Cancel button */}
        <motion.button
          type="button"
          onClick={onClose}
          className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-100 transition-colors ease-in-out duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          disabled={loading}
          variants={buttonVariants}
          initial="idle"
          animate="idle"
          whileHover={!loading ? 'hover' : 'disabled'}
          whileTap={!loading ? 'tap' : 'disabled'}
        >
          Cancel
        </motion.button>

        {/* Submit/Action button */}
        <motion.button
          type="button"
          onClick={handleSubmit}
          className={`px-4 py-2 bg-blue-600 text-white text-sm rounded-md transition-colors ease-in-out duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
            disabled || loading
              ? 'opacity-70 cursor-not-allowed'
              : 'hover:bg-blue-700'
          }`}
          disabled={disabled || loading}
          variants={buttonVariants}
          initial="idle"
          animate={disabled || loading ? 'disabled' : 'idle'}
          whileHover={!disabled && !loading ? 'hover' : 'disabled'}
          whileTap={!disabled && !loading ? 'tap' : 'disabled'}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {btnText}
            </span>
          ) : (
            btnText
          )}
        </motion.button>
      </div>
    </div>
  );
};

EnhancedFooter.propTypes = {
  message: PropTypes.string,
  messageType: PropTypes.oneOf(Object.values(MESSAGE_TYPES)),
  setError: PropTypes.func,
  selectedItems: PropTypes.array,
  handleClearSelection: PropTypes.func,
  handleSubmit: PropTypes.func,
  onClose: PropTypes.func,
  btnText: PropTypes.string,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  errorTimeout: PropTypes.number,
  minimumSelection: PropTypes.number,
};

export default EnhancedFooter;
