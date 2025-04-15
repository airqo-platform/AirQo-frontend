'use client';
import React, { useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import CustomDropdown from '@/components/Button/CustomDropdown';
import Spinner from '@/components/Spinner';

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
  errorTimeout = 5000,
  minimumSelection = 0,
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

  // Framer Motion button variants
  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.03 },
    tap: { scale: 0.98 },
    disabled: { opacity: 0.7 },
  };

  // Inline style objects for each button, now with a border radius corresponding to rounded-xl (≈ 0.75rem)
  const clearButtonStyle = {
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    transition:
      'background-color 0.15s ease-in-out, color 0.15s ease-in-out, border-color 0.15s ease-in-out',
  };

  const cancelButtonStyle = {
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    transition:
      'background-color 0.15s ease-in-out, color 0.15s ease-in-out, border-color 0.15s ease-in-out',
  };

  const submitButtonStyle = {
    padding: '0.5rem 1rem',
    border: 'none',
    fontSize: '0.875rem',
    borderRadius: '0.75rem',
    backgroundColor: '#2563eb',
    color: '#FFFFFF',
    transition: 'background-color 0.15s ease-in-out',
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-background border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 flex flex-col md:flex-row items-start md:items-center gap-2 justify-between shadow-lg z-10">
      {/* Animated message area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message || 'status'}
          className="text-sm leading-5 font-normal flex-1 mb-2 md:mb-0 overflow-hidden"
          initial={{ opacity: 0, y: 5, height: 0 }}
          animate={{
            opacity: 1,
            y: 0,
            height: 'auto',
            transition: { duration: 0.2, ease: 'easeOut' },
          }}
          exit={{
            opacity: 0,
            height: 0,
            transition: { duration: 0.2, ease: 'easeIn' },
          }}
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
        {/* Clear Button (conditionally rendered) */}
        <AnimatePresence>
          {showClearButton && (
            <motion.div
              variants={buttonVariants}
              initial="idle"
              animate="idle"
              whileHover={!loading ? 'hover' : 'disabled'}
              whileTap={!loading ? 'tap' : 'disabled'}
              exit={{ opacity: 0, width: 0, padding: 0, margin: 0 }}
            >
              <CustomDropdown
                isButton={true}
                text="Clear"
                buttonClassName="dark:text-white"
                buttonStyle={clearButtonStyle}
                onClick={handleClearSelection}
                disabled={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancel Button */}
        <motion.div
          variants={buttonVariants}
          initial="idle"
          animate="idle"
          whileHover={!loading ? 'hover' : 'disabled'}
          whileTap={!loading ? 'tap' : 'disabled'}
        >
          <CustomDropdown
            isButton={true}
            text="Cancel"
            buttonClassName="dark:text-white"
            buttonStyle={cancelButtonStyle}
            onClick={onClose}
            disabled={loading}
          />
        </motion.div>

        {/* Submit Button */}
        <motion.div
          variants={buttonVariants}
          initial="idle"
          animate={disabled || loading ? 'disabled' : 'idle'}
          whileHover={!disabled && !loading ? 'hover' : 'disabled'}
          whileTap={!disabled && !loading ? 'tap' : 'disabled'}
        >
          <CustomDropdown
            isButton={true}
            text={
              loading ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2">
                    <Spinner width={12} height={12} />
                  </span>
                  {btnText}
                </span>
              ) : (
                btnText
              )
            }
            buttonStyle={submitButtonStyle}
            onClick={handleSubmit}
            disabled={disabled || loading}
          />
        </motion.div>
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
