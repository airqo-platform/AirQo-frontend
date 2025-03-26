import React, { useEffect } from 'react';
import Button from '../../../Button';

const MESSAGE_TYPES = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

/**
 * Footer component for the data download modal
 * Provides user feedback and action buttons
 */
const Footer = ({
  message = '',
  messageType = MESSAGE_TYPES.INFO,
  setError,
  selectedItems = [],
  handleClearSelection,
  handleSubmit,
  onClose,
  btnText = 'Download',
  loading = false,
  disabled = false,
}) => {
  // Auto-clear error messages after 8 seconds
  useEffect(() => {
    if (message && messageType === MESSAGE_TYPES.ERROR) {
      const timer = setTimeout(() => setError(''), 8000);
      return () => clearTimeout(timer);
    }
  }, [message, messageType, setError]);

  // Get appropriate text color based on message type
  const getMessageStyles = () => {
    switch (messageType) {
      case MESSAGE_TYPES.ERROR:
        return 'text-red-600';
      case MESSAGE_TYPES.WARNING:
        return 'text-amber-600';
      case MESSAGE_TYPES.INFO:
      default:
        return 'text-blue-600';
    }
  };

  // Get message content for the footer
  const getMessageContent = () => {
    // If there's a message, show it with appropriate styling
    if (message) {
      return <span className={getMessageStyles()}>{message}</span>;
    }

    // Default state based on selection count
    if (selectedItems?.length === 0) {
      return 'Select locations to continue';
    }

    return (
      <div>
        <span className="text-blue-600">
          {`${selectedItems?.length} ${
            selectedItems?.length === 1 ? 'location' : 'locations'
          } selected`}
        </span>
        <button
          type="button"
          className="ml-2 hover:text-red-600"
          onClick={handleClearSelection}
        >
          Clear
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 absolute bottom-0 right-0 w-full px-4 py-3 sm:px-6 flex flex-col md:flex-row items-start md:items-center gap-2 justify-between border-t border-gray-200">
      {/* Message area */}
      <div className="text-sm leading-5 font-normal">{getMessageContent()}</div>

      {/* Action buttons */}
      <div className="flex sm:flex-row-reverse gap-2">
        <Button
          type="button"
          variant="filled"
          onClick={handleSubmit}
          disabled={loading || disabled || selectedItems.length === 0}
          className={
            loading || disabled || selectedItems.length === 0
              ? 'opacity-70 cursor-not-allowed'
              : ''
          }
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-t-transparent border-white rounded-full"></span>
              <span>{btnText}</span>
            </div>
          ) : (
            btnText
          )}
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          className={loading ? 'opacity-70 cursor-not-allowed' : ''}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default Footer;
