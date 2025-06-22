import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  updateGroupSlugApi,
  getOrganisationSlugAvailabilityApi,
} from '@/core/apis/Account';
import { useUnifiedGroup } from '@/app/providers/UnifiedGroupProvider';
import { titleToSlug } from '@/core/utils/organizationUtils';
import logger from '@/lib/logger';

/**
 * Custom hook for managing organization slug updates
 * Provides functionality to validate, check availability, and update group slugs
 */
export const useGroupSlugManager = () => {
  const { activeGroup, refreshGroups } = useUnifiedGroup();
  const pathname = usePathname();

  const [isUpdating, setIsUpdating] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [slugStatus, setSlugStatus] = useState('');

  /**
   * Validates slug format (only hyphens, lowercase letters, numbers)
   */
  const validateSlugFormat = useCallback((slug) => {
    if (!slug) {
      return 'Slug is required';
    }

    if (slug.length < 3) {
      return 'Slug must be at least 3 characters long';
    }

    if (slug.length > 50) {
      return 'Slug must be less than 50 characters';
    }

    // Only allow lowercase letters, numbers, and hyphens
    // Cannot start or end with hyphen
    const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!slugPattern.test(slug)) {
      return 'Slug can only contain lowercase letters, numbers, and hyphens. Cannot start or end with hyphen.';
    }

    // Reserved words that cannot be used as slugs
    const reservedWords = [
      'admin',
      'api',
      'www',
      'app',
      'dashboard',
      'settings',
      'user',
      'org',
      'organization',
    ];
    if (reservedWords.includes(slug)) {
      return 'This slug is reserved and cannot be used';
    }

    return null;
  }, []);

  /**
   * Generates a slug from organization name
   */
  const generateSlugFromName = useCallback((organizationName) => {
    return titleToSlug(organizationName);
  }, []);
  /**
   * Checks if a slug is available
   */ const checkSlugAvailability = useCallback(
    async (slug) => {
      if (!slug) return { available: false, message: 'Slug is required' };

      // First validate format
      const formatError = validateSlugFormat(slug);
      if (formatError) {
        return { available: false, message: formatError };
      }

      setIsCheckingAvailability(true);
      try {
        logger.info('Checking slug availability:', { slug });

        // Don't pass groupId for availability checks - we want to know if slug is truly available
        const response = await getOrganisationSlugAvailabilityApi(slug);

        logger.info('Slug availability response:', {
          slug,
          response,
          success: response?.success,
          available: response?.available,
        });

        if (response && response.success !== undefined) {
          return {
            available: response.available,
            message: response.available
              ? 'Slug is available'
              : 'This slug is already taken',
          };
        } else {
          return {
            available: false,
            message: response?.message || 'Unable to check slug availability',
          };
        }
      } catch (error) {
        logger.error('Error checking slug availability:', {
          error: error.message,
          slug,
          stack: error.stack,
        });
        return {
          available: false,
          message: 'Error checking availability. Please try again.',
        };
      } finally {
        setIsCheckingAvailability(false);
      }
    },
    [validateSlugFormat],
  ); /**
   * Updates the group slug with robust error handling and redirect logic
   */
  const updateGroupSlug = useCallback(
    async (newSlug) => {
      if (!activeGroup?._id) {
        throw new Error('No active group found');
      }

      // Validate format first
      const formatError = validateSlugFormat(newSlug);
      if (formatError) {
        throw new Error(formatError);
      }

      // Prevent duplicate calls
      if (isUpdating) {
        throw new Error('Update already in progress');
      }

      setIsUpdating(true);
      setValidationErrors({});
      setSlugStatus('updating');

      try {
        logger.info('Starting domain update:', {
          oldSlug: activeGroup?.organization_slug || activeGroup?.grp_slug,
          newSlug,
          groupId: activeGroup._id,
        });

        // Call the API and wait for the response
        const response = await updateGroupSlugApi(activeGroup._id, {
          slug: newSlug,
          regenerate: true,
        });

        logger.info('API response received:', {
          response,
          success: response?.success,
          message: response?.message,
        });

        // Check if the API call was actually successful
        if (!response || !response.success) {
          const errorMessage =
            response?.message ||
            response?.error ||
            'Failed to update domain. Please try again.';
          throw new Error(errorMessage);
        }
        logger.info('Domain update successful, API confirmed:', {
          oldSlug: activeGroup?.organization_slug || activeGroup?.grp_slug,
          newSlug,
          groupId: activeGroup._id,
          apiResponse: response,
        });

        setSlugStatus('success');

        // Force refresh user groups to get updated slug data
        logger.info('Refreshing user groups to get updated slug data...');
        try {
          await refreshGroups(true); // Force refresh
        } catch (refreshError) {
          logger.warn(
            'Failed to refresh user groups after slug update:',
            refreshError,
          );
          // Don't fail the entire process if group refresh fails
        }

        // Delay to allow backend to process the slug update and propagate changes
        logger.info(
          'Waiting for backend processing and propagation before redirect...',
        );
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Construct the new URL more robustly
        const currentUrl = window.location.href;
        const oldSlug =
          activeGroup?.organization_slug ||
          activeGroup?.grp_slug ||
          generateSlugFromName(activeGroup?.grp_title || activeGroup?.grp_name);

        let newUrl;

        if (oldSlug && currentUrl.includes(`/org/${oldSlug}`)) {
          // Replace the old slug with the new one in the current URL
          newUrl = currentUrl.replace(`/org/${oldSlug}`, `/org/${newSlug}`);
          logger.info('Redirecting to new domain:', {
            from: currentUrl,
            to: newUrl,
          });
        } else {
          // Fallback: construct new URL from scratch
          const baseUrl = window.location.origin;
          const pathAfterSlug = pathname.split('/').slice(3).join('/'); // Remove /org/[slug]
          newUrl = `${baseUrl}/org/${newSlug}/${pathAfterSlug}`;
          logger.info('Constructing new URL from scratch:', {
            newUrl,
            pathAfterSlug,
          });
        }

        // Perform the redirect - this will trigger a full page reload and loginSetup
        logger.info('Performing redirect to new domain...');
        window.location.href = newUrl;

        // Note: Code after this point won't execute due to page navigation
      } catch (error) {
        logger.error('Error updating group slug:', {
          error: error.message,
          stack: error.stack,
          groupId: activeGroup._id,
          newSlug,
        });

        setSlugStatus('error');
        setValidationErrors({ slug: error.message });
        setIsUpdating(false); // Explicitly stop loading on error
        throw error;
      }
      // Note: setIsUpdating(false) is intentionally NOT called on success
      // because the page will reload before this line is reached
    },
    [
      activeGroup,
      validateSlugFormat,
      pathname,
      generateSlugFromName,
      isUpdating,
      refreshGroups,
    ],
  );

  /**
   * Resets all states
   */
  const resetStates = useCallback(() => {
    setValidationErrors({});
    setSlugStatus('');
  }, []);

  return {
    // State
    isUpdating,
    isCheckingAvailability,
    validationErrors,
    slugStatus, // Current group info
    currentSlug:
      activeGroup?.organization_slug ||
      activeGroup?.grp_slug ||
      (activeGroup?.grp_title
        ? generateSlugFromName(activeGroup.grp_title)
        : null) ||
      (activeGroup?.grp_name
        ? generateSlugFromName(activeGroup.grp_name)
        : null) ||
      'unknown-org',
    activeGroup,

    // Actions
    validateSlugFormat,
    generateSlugFromName,
    checkSlugAvailability,
    updateGroupSlug,
    resetStates,
  };
};

export default useGroupSlugManager;
