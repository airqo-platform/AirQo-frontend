import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useDispatch } from 'react-redux';
import { FaGlobe, FaCheck, FaTimes, FaSpinner, FaInfo } from 'react-icons/fa';
import CardWrapper from '@/common/components/CardWrapper';
import CustomToast from '@/components/Toast/CustomToast';
import { setupUserSession } from '@/core/utils/loginSetup';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import useGroupSlugManager from '@/core/hooks/useGroupSlugManager';
import logger from '@/lib/logger';

const DomainSettingsForm = forwardRef((_props, ref) => {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const pathname = usePathname();
  // Use the group slug manager hook for all slug-related operations
  const {
    currentSlug,
    isUpdating,
    isCheckingAvailability,
    validateSlugFormat,
    checkSlugAvailability,
    updateGroupSlug: updateSlugHook,
    resetStates,
  } = useGroupSlugManager();

  // Check if this is AirQo group - they should not be able to update domain
  const isAirQoGroup =
    currentSlug === 'airqo' ||
    session?.user?.activeGroup?.grp_title?.toLowerCase() === 'airqo' ||
    session?.user?.activeGroup?.grp_name?.toLowerCase() === 'airqo';

  // State for form management
  const [formData, setFormData] = useState({
    slug: '',
    originalSlug: '',
  });
  const [availabilityStatus, setAvailabilityStatus] = useState('');
  const [availabilityMessage, setAvailabilityMessage] = useState('');
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
  // Handle form submission - Always allow, validate inside
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

      if (
        availabilityStatus !== 'available' &&
        formData.slug !== formData.originalSlug
      ) {
        showToastMessage(
          'Please wait for availability check or choose a different URL',
          'warning',
        );
        return;
      }

      if (isUpdating) {
        showToastMessage('Update already in progress', 'info');
        return;
      }
      try {
        const result = await updateSlugHook(formData.slug);

        setFormData((prev) => ({
          ...prev,
          originalSlug: formData.slug,
        }));
        setHasChanges(false);
        setAvailabilityStatus('');
        setAvailabilityMessage('');

        showToastMessage(result.message, 'success'); // Call setupUserSession to refresh user data and redirect properly
        logger.info('Domain updated successfully, refreshing user session...');

        try {
          // Use the new pathname with updated slug for setupUserSession
          // This ensures the session setup logic correctly identifies the updated group
          const newPathname = pathname.replace(
            `/org/${formData.originalSlug}/`,
            `/org/${formData.slug}/`,
          );

          // Pass the current active group ID to help maintain context after domain update
          // This is crucial because the API might not immediately return updated group data
          const currentActiveGroupId = session?.user?.activeGroup?._id;
          const setupResult = await setupUserSession(
            session,
            dispatch,
            newPathname, // Use updated pathname to maintain group context
            {
              preferredGroupId: currentActiveGroupId, // Help maintain the correct active group
              maintainActiveGroup: true,
              isDomainUpdate: true, // Critical flag to prioritize preferred group
            },
          );

          if (setupResult.success) {
            logger.info('User session refreshed successfully, redirecting...');

            // Redirect to new URL with updated domain
            setTimeout(() => {
              const newUrl = window.location.href.replace(
                `/org/${formData.originalSlug}/`,
                `/org/${formData.slug}/`,
              );
              if (window.location.href !== newUrl) {
                window.location.href = newUrl;
              }
            }, 1000);
          } else {
            logger.error('Failed to refresh user session:', setupResult.error);
            // Still redirect even if setup fails
            setTimeout(() => {
              const newUrl = window.location.href.replace(
                `/org/${formData.originalSlug}/`,
                `/org/${formData.slug}/`,
              );
              if (window.location.href !== newUrl) {
                window.location.href = newUrl;
              }
            }, 2000);
          }
        } catch (setupError) {
          logger.error('Error refreshing user session:', setupError);
          // Still redirect even if setup fails
          setTimeout(() => {
            const newUrl = window.location.href.replace(
              `/org/${formData.originalSlug}/`,
              `/org/${formData.slug}/`,
            );
            if (window.location.href !== newUrl) {
              window.location.href = newUrl;
            }
          }, 2000);
        }
      } catch (error) {
        showToastMessage(error.message, 'error');
      }
    },
    [
      hasChanges,
      updateSlugHook,
      formData.slug,
      formData.originalSlug,
      availabilityStatus,
      isUpdating,
      formatError,
      session,
      dispatch,
      pathname,
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

  // Effect to ensure ref values are updated when critical state changes
  useEffect(() => {
    // This effect will run whenever the dependencies change, ensuring the ref is up to date
  }, [hasChanges, isUpdating, availabilityStatus]); // Debounced availability check
  const debouncedAvailabilityCheck = useCallback(
    (slug) => {
      const timeoutId = setTimeout(async () => {
        if (slug && slug !== formData.originalSlug) {
          const result = await checkSlugAvailability(slug);
          setAvailabilityStatus(result.available ? 'available' : 'unavailable');
          setAvailabilityMessage(result.message);
        } else if (slug === formData.originalSlug) {
          // User typed back to original slug
          setAvailabilityStatus('');
          setAvailabilityMessage('');
        } else {
          setAvailabilityStatus('');
          setAvailabilityMessage('');
        }
      }, 500);

      // Cleanup function for useEffect
      return () => clearTimeout(timeoutId);
    },
    [checkSlugAvailability, formData.originalSlug],
  ); // Effect to handle debounced slug checking
  useEffect(() => {
    if (
      formData.slug &&
      formData.slug !== formData.originalSlug &&
      !validateSlugFormat(formData.slug)
    ) {
      const cleanup = debouncedAvailabilityCheck(formData.slug);
      return cleanup;
    }
  }, [
    formData.slug,
    formData.originalSlug,
    debouncedAvailabilityCheck,
    validateSlugFormat,
  ]);

  // Handle input changes
  const handleSlugChange = (e) => {
    const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData((prev) => ({
      ...prev,
      slug: newSlug,
    }));
    setHasChanges(newSlug !== formData.originalSlug);
    // Reset availability status
    setAvailabilityStatus('');
    setAvailabilityMessage('');

    // Note: Availability check is handled by useEffect
  };

  // Helper function to show toast messages
  const showToastMessage = (message, type) => {
    setToastConfig({ message, type });
    setShowToast(true);
  };

  // Get current full URL
  const getFullUrl = (slug) => {
    const baseUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://analytics.airqo.net';
    return `${baseUrl}/org/${slug}`;
  };
  // Get status icon and color
  const getStatusDisplay = () => {
    if (isCheckingAvailability) {
      return { icon: FaSpinner, color: 'text-primary', spin: true };
    }

    if (availabilityStatus === 'available') {
      return { icon: FaCheck, color: 'text-green-500', spin: false };
    }

    if (availabilityStatus === 'unavailable') {
      return { icon: FaTimes, color: 'text-red-500', spin: false };
    }

    return null;
  };
  const statusDisplay = getStatusDisplay();

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
      <CardWrapper className="max-w-4xl mx-auto shadow-lg border-0">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <div className="p-3 rounded-xl mr-4 bg-primary/10 dark:bg-primary/20">
                  <FaGlobe className="text-xl text-primary" />
                </div>
                Domain Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2 ml-16">
                Customize your organization&apos;s unique URL in the AirQo
                platform. This URL will be used across all shared links and
                integrations.
              </p>
            </div>
          </div>{' '}
          <form className="space-y-8">
            {/* URL Customization */}
            <div className="space-y-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 dark:text-white mb-2">
                  Organization URL
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Choose a unique URL for your organization that will be used
                  across all shared links.
                </p>
              </div>{' '}
              {/* URL Input Field */}
              <div className="relative">
                <div
                  className={`flex items-center border-2 rounded-xl overflow-hidden bg-white dark:bg-gray-800 transition-all duration-200 ${
                    formData.slug && hasChanges
                      ? 'border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10'
                      : 'border-gray-200 dark:border-gray-600 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'
                  }`}
                >
                  <span className="bg-gray-100 dark:bg-gray-700 px-6 py-4 text-gray-600 dark:text-gray-300 text-sm font-mono border-r border-gray-200 dark:border-gray-600">
                    analytics.airqo.net/org/
                  </span>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={handleSlugChange}
                      placeholder="your-organization-name"
                      className="w-full px-6 py-4 text-base font-mono bg-transparent text-gray-900 dark:text-white ring-transparent border-none focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                      disabled={isUpdating}
                    />
                    {statusDisplay && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <statusDisplay.icon
                          className={`text-lg ${statusDisplay.color} ${statusDisplay.spin ? 'animate-spin' : ''} transition-all duration-200`}
                        />
                      </div>
                    )}

                    {/* Typing indicator */}
                    {hasChanges && !isCheckingAvailability && (
                      <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>{' '}
              {/* Status Messages */}
              <div className="space-y-3">
                {formatError && (
                  <div className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fadeIn">
                    <FaTimes className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        Invalid Format
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {formatError}
                      </p>
                    </div>
                  </div>
                )}

                {availabilityMessage && !formatError && (
                  <div
                    className={`flex items-start space-x-3 p-4 border rounded-lg animate-fadeIn transition-all duration-300 ${
                      availabilityStatus === 'available'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}
                  >
                    {availabilityStatus === 'available' ? (
                      <FaCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <FaTimes className="text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      {' '}
                      <p
                        className={`text-sm font-medium ${
                          availabilityStatus === 'available'
                            ? 'text-green-800 dark:text-green-200'
                            : 'text-red-800 dark:text-red-200'
                        }`}
                      >
                        {availabilityStatus === 'available'
                          ? 'Available'
                          : 'Unavailable'}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          availabilityStatus === 'available'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {availabilityMessage}
                      </p>
                    </div>
                  </div>
                )}
              </div>{' '}
              {/* Preview */}
              {formData.slug && !formatError && (
                <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-6 border border-primary/20 dark:border-primary/30">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                      <FaGlobe className="text-primary text-sm" />
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
            </div>{' '}
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
          )}{' '}
        </div>
      </CardWrapper>
    </>
  );
});

DomainSettingsForm.displayName = 'DomainSettingsForm';

export default DomainSettingsForm;
