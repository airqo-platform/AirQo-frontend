import React, { useEffect } from 'react';
import Button from '../../../Button';

const Footer = ({
  errorMessage,
  setError,
  selectedSites = [],
  handleClearSelection,
  handleSubmit,
  onClose,
  btnText = 'Download', // Default to 'Download' if no btnText is provided
  loading = false, // Default loading state
}) => {
  // Clear the error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, setError]);

  return (
    <div className="bg-gray-50 absolute bottom-0 right-0 w-full px-4 py-3 sm:px-6 flex items-center justify-between">
      {/* Error message or selected locations info */}
      <div className="text-sm leading-5 font-normal">
        {errorMessage ? (
          <span className="text-red-600">{errorMessage}</span>
        ) : selectedSites.length === 0 ? (
          'Select locations to continue'
        ) : (
          <div>
            <span className="text-blue-600">
              {`${selectedSites.length} ${
                selectedSites.length === 1 ? 'location' : 'locations'
              } selected`}
            </span>
            <button
              type="button"
              className="ml-2"
              onClick={handleClearSelection}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="sm:flex sm:flex-row-reverse gap-2">
        <Button
          type="button"
          variant="filled"
          onClick={handleSubmit}
          disabled={loading} // Disable button when loading
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-t-transparent border-white rounded-full"></span>
              <span>{btnText || 'Downloading...'}</span>{' '}
            </div>
          ) : (
            btnText
          )}
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={onClose}
          disabled={loading} // Disable cancel button when loading
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default Footer;
