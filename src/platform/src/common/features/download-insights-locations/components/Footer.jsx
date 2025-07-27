'use client';
import { useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import Spinner from '@/components/Spinner';
import Button from '@/components/Button';

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
      [MESSAGE_TYPES.INFO]: 'text-primary',
    };
    return styleMap[messageType] || 'text-primary';
  }, [messageType]);

  // Determine if clear button should be shown
  const showClearButton = useMemo(() => {
    // Only show if we have items selected AND more than the minimum required
    return selectedItems.length > minimumSelection && handleClearSelection;
  }, [selectedItems.length, handleClearSelection, minimumSelection]);

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-background border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 justify-between shadow-lg z-10">
      {/* Animated message area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message || 'status'}
          className="text-sm leading-5 font-normal flex-1 mb-2 sm:mb-0 overflow-hidden min-w-0"
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
      </AnimatePresence>{' '}
      {/* Action buttons */}
      <div className="flex w-full sm:w-auto gap-2 justify-end flex-wrap">
        {/* Clear Button (conditionally rendered) */}
        {showClearButton && (
          <Button
            onClick={handleClearSelection}
            variant="outlined"
            disabled={loading}
          >
            Clear
          </Button>
        )}

        {/* Cancel Button */}
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          Cancel
        </Button>

        {/* Submit Button */}
        <Button onClick={handleSubmit} disabled={disabled || loading}>
          {loading ? (
            <span className="flex items-center justify-center">
              <span className="mr-2">
                <Spinner size={12} />
              </span>
              {btnText}
            </span>
          ) : (
            btnText
          )}
        </Button>
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
