import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  AqGlobe02Maps_Travel,
  AqCheck,
  AqXClose,
  AqLoading02,
} from '@airqo/icons-react';
import { FaInfo } from 'react-icons/fa';
import CardWrapper from '@/common/components/CardWrapper';
import CustomToast from '@/components/Toast/CustomToast';
import useGroupSlugManager from '@/core/hooks/useGroupSlugManager';
import logger from '@/lib/logger';

const DomainSettingsForm = forwardRef((_props, ref) => {
  // Use the group slug manager hook for all slug-related operations
  const {
    currentSlug,
    isUpdating,
    isCheckingAvailability,
    slugStatus, // This likely indicates the overall update status (success, error, idle)
    validateSlugFormat,
    checkSlugAvailability,
    updateGroupSlug: updateSlugHook,
    resetStates,
    activeGroup,
    // Assuming useGroupSlugManager might eventually expose these:
    // slugSuggestions: hookSlugSuggestions, // If hook provides suggestions
    // errors: hookErrors, // If hook provides specific input errors
  } = useGroupSlugManager();

  // Check if this is AirQo group - they should not be able to update domain
  const isAirQoGroup =
    currentSlug === 'airqo' ||
    activeGroup?.grp_title?.toLowerCase() === 'airqo' ||
    activeGroup?.grp_name?.toLowerCase() === 'airqo';

  // State for form management
  const [formData, setFormData] = useState({
    slug: '',
    originalSlug: '',
  });

  // Consolidated availability state
  const [slugAvailability, setSlugAvailability] = useState(null); // null: no check, true: available, false: unavailable
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [slugSuggestions, setSlugSuggestions] = useState([]); // For suggested alternatives

  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    message: '',
    type: 'success',
  });

  // Initialize form data when currentSlug is available from the hook
  useEffect(() => {
    if (currentSlug) {
      setFormData({
        slug: currentSlug,
        originalSlug: currentSlug,
      });
      setHasChanges(false);
      setSlugAvailability(null); // Reset availability status on initial load
      setAvailabilityMessage('');
      setSlugSuggestions([]);
      resetStates();
    }
  }, [currentSlug, resetStates]);

  // Redirect AirQo group users away from organization domain settings
  useEffect(() => {
    if (isAirQoGroup && typeof window !== 'undefined') {
      logger.warn(
        'AirQo group detected in domain settings, redirecting to user flow',
      );
      window.location.href = '/user/Home';
    }
  }, [isAirQoGroup]);

  // Calculate format error for use throughout the component
  const formatError = formData.slug ? validateSlugFormat(formData.slug) : null;

  // Helper function to show toast messages
  const showToastMessage = useCallback((message, type) => {
    setToastConfig({ message, type });
    setShowToast(true);
  }, []);

  // Handle form submission - simplified version that uses the improved hook
  const handleSubmit = useCallback(
    async (e) => {
      if (e && e.preventDefault) {
        e.preventDefault();
      }
      if (!hasChanges) {
        showToastMessage('No changes to save', 'info');
        return;
      }

      if (formatError) {
        showToastMessage(`Invalid format: ${formatError}`, 'warning');
        return;
      }

      // Check for availability only if the slug is actually different and not currently available
      if (
        formData.slug !== formData.originalSlug &&
        slugAvailability !== true
      ) {
        showToastMessage(
          'Please ensure the new URL is checked and available before saving.',
          'warning',
        );
        return;
      }

      if (isUpdating) {
        showToastMessage('Update already in progress', 'info');
        return;
      }

      try {
        // Use the simplified hook that handles redirect automatically
        await updateSlugHook(formData.slug);

        // Update local state for consistency
        setFormData((prev) => ({
          ...prev,
          originalSlug: formData.slug,
        }));
        setHasChanges(false);
        setSlugAvailability(null); // Reset after successful update
        setAvailabilityMessage('');
        setSlugSuggestions([]); // Clear suggestions

        showToastMessage(
          'Domain updated successfully! Redirecting...',
          'success',
        );
        // Prevent further state updates or error toasts after success
        return;
      } catch (error) {
        // Only show error toast if updateSlugHook actually throws
        showToastMessage(error.message, 'error');
      }
    },
    [
      hasChanges,
      updateSlugHook,
      formData.slug,
      formData.originalSlug,
      slugAvailability, // Use the local slugAvailability state
      isUpdating,
      formatError,
      showToastMessage,
    ],
  );

  // Expose functions to parent component via ref
  useImperativeHandle(
    ref,
    () => ({
      handleUpdate: handleSubmit,
      hasChanges,
      isUpdating,
    }),
    [handleSubmit, hasChanges, isUpdating],
  );

  // Debounced availability check
  const debouncedAvailabilityCheck = useCallback(
    (slug) => {
      // Clear previous timeout
      const timeoutId = setTimeout(async () => {
        if (slug && slug !== formData.originalSlug && !formatError) {
          // Only check if there's no format error and it's a new slug
          const result = await checkSlugAvailability(slug);
          setSlugAvailability(result.available);
          setAvailabilityMessage(result.message);
          setSlugSuggestions(result.suggestions || []); // Assume suggestions from hook
        } else if (slug === formData.originalSlug) {
          // User typed back to original slug, or cleared it
          setSlugAvailability(null);
          setAvailabilityMessage('');
          setSlugSuggestions([]);
        } else {
          setSlugAvailability(null);
          setAvailabilityMessage('');
          setSlugSuggestions([]);
        }
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId); // Cleanup function
    },
    [checkSlugAvailability, formData.originalSlug, formatError], // Add formatError to dependencies
  );

  // Effect to trigger debounced slug checking
  useEffect(() => {
    // Only trigger debounce if slug is not empty and has changes from original, AND no format error
    if (
      formData.slug &&
      formData.slug !== formData.originalSlug &&
      !formatError
    ) {
      const cleanup = debouncedAvailabilityCheck(formData.slug);
      return cleanup;
    } else {
      // If slug is empty, same as original, or has format error, reset status
      setSlugAvailability(null);
      setAvailabilityMessage('');
      setSlugSuggestions([]);
    }
  }, [
    formData.slug,
    formData.originalSlug,
    debouncedAvailabilityCheck,
    formatError,
  ]);

  // Handle input changes
  const handleSlugChange = (e) => {
    // Sanitize input: convert to lowercase, remove non-alphanumeric except hyphen
    const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData((prev) => ({
      ...prev,
      slug: newSlug,
    }));
    setHasChanges(newSlug !== formData.originalSlug);
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      slug: suggestion,
    }));
    setHasChanges(suggestion !== formData.originalSlug);
    setSlugAvailability(true);
    setAvailabilityMessage(`${suggestion} is available.`);
    setSlugSuggestions([]);
  };

  // Get current full URL for preview
  const getFullUrl = (slug) => {
    const baseUrl =
      typeof window !== 'undefined'
        ? window.location.origin // Dynamic base URL
        : 'https://analytics.airqo.net'; // Fallback for SSR
    return `${baseUrl}/org/${slug}`;
  };

  if (isAirQoGroup) {
    return null;
  }

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
      <CardWrapper>
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <div className="p-3 rounded-xl mr-4 bg-primary/10 dark:bg-primary/20">
                  <AqGlobe02Maps_Travel className="text-xl text-primary" />
                </div>
                Domain Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2 ml-16">
                Customize your organization&apos;s unique URL in the AirQo
                platform. This URL will be used across all shared links and
                integrations.
              </p>
            </div>
          </div>

          {/* Domain Update Progress Banner */}
          {slugStatus === 'success' && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-fadeIn">
              <div className="flex items-center space-x-3">
                <AqLoading02 className="text-blue-600 dark:text-blue-400 animate-spin" />
                <div>
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                    Setting up your new domain...
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Please wait while we configure your new URL. The page will
                    reload automatically in a few seconds.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-8">
            {/* URL Customization */}
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="organizationSlug"
                  className="block text-base font-semibold text-gray-900 dark:text-white mb-2"
                >
                  Organization URL
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Choose a unique URL for your organization that will be used
                  across all shared links.
                </p>
              </div>

              {/* URL Input Field - Refactored */}
              <div className="flex items-center">
                <span className="flex-shrink-0 bg-gray-100 dark:bg-gray-600 px-4 py-2.5 rounded-l-xl text-gray-500 dark:text-gray-300 border border-r-0 border-gray-400 dark:border-gray-500 text-sm whitespace-nowrap">
                  analytics.airqo.net/org/
                </span>
                <input
                  type="text"
                  id="organizationSlug"
                  name="organizationSlug"
                  placeholder="your-organization-name"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  className={`flex-grow px-4 py-2.5 rounded-r-xl border text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 ${
                    formatError
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:border-red-400 dark:focus:ring-red-400'
                      : 'border-gray-400 dark:border-gray-500 focus:border-primary focus:ring-primary/50 dark:focus:ring-primary/40' // Primary color for focus
                  }`}
                  disabled={isUpdating}
                  required
                />
              </div>

              {/* Loader and Availability Messages Below the Input */}
              {isCheckingAvailability &&
                formData.slug &&
                formData.slug !== formData.originalSlug && (
                  <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400 animate-fadeIn">
                    <AqLoading02 className="animate-spin h-4 w-4 mr-2 text-primary dark:text-primary-light" />
                    Checking availability...
                  </p>
                )}

              {formatError && (
                <p className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400 animate-fadeIn">
                  <AqXClose className="h-4 w-4 mr-1" />
                  {formatError}
                </p>
              )}

              {/* Display availability message only if not checking and no format error */}
              {!isCheckingAvailability &&
                availabilityMessage &&
                !formatError && (
                  <div
                    className={`mt-1 text-sm flex items-center animate-fadeIn ${
                      slugAvailability
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {slugAvailability ? (
                      <>
                        <AqCheck className="h-4 w-4 mr-1 text-green-500" />
                        <span>{formData.slug} is available.</span>
                      </>
                    ) : (
                      <>
                        <AqXClose className="h-4 w-4 mr-1 text-red-500" />
                        <span>{availabilityMessage}</span>
                      </>
                    )}
                  </div>
                )}

              {/* Slug Suggestions */}
              {slugSuggestions &&
                slugSuggestions.length > 0 &&
                slugAvailability === false &&
                !formatError && (
                  <div className="mt-2 animate-fadeIn">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Try one of these instead:
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {slugSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light text-sm rounded-full hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* General descriptive text */}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This will be your unique URL in the AirQo platform
              </p>

              {/* Preview */}
              {formData.slug && !formatError && (
                <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-6 border border-primary/20 dark:border-primary/30">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                      <AqGlobe02Maps_Travel className="text-primary text-sm" />
                    </div>
                    <h4 className="text-sm font-semibold text-primary">
                      Preview URL
                    </h4>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-primary/20">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Your organization will be accessible at:
                    </p>
                    <p className="text-base font-mono text-primary break-all">
                      {getFullUrl(formData.slug)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Guidelines */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <FaInfo className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-amber-800 dark:text-amber-200 mb-3">
                    URL Guidelines & Requirements
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        Format Rules:
                      </h5>
                      <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                        <li className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                          <span>Only lowercase letters (a-z)</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                          <span>Numbers (0-9) and hyphens (-)</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                          <span>3-50 characters in length</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        Important Notes:
                      </h5>
                      <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                        <li className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                          <span>Must be unique across all organizations</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                          <span>Cannot start or end with hyphen</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                          <span>Changing URL affects all shared links</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Form Actions - Removed, handled by sidebar */}
          </form>

          {/* Toast Notifications */}
          {showToast && (
            <CustomToast
              message={toastConfig.message}
              type={toastConfig.type}
              onClose={() => setShowToast(false)}
            />
          )}
        </div>
      </CardWrapper>
    </>
  );
});

DomainSettingsForm.displayName = 'DomainSettingsForm';

export default DomainSettingsForm;
