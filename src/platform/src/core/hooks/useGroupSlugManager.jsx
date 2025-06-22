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
        const response = await getOrganisationSlugAvailabilityApi(slug);

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
        logger.error('Slug availability check failed', {
          slug,
          error: error.message,
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
        logger.info('Domain update successful', {
          oldSlug: activeGroup?.organization_slug || activeGroup?.grp_slug,
          newSlug,
          groupId: activeGroup._id,
        });

        setSlugStatus('success');

        // Show "setting up domain" message for 3 seconds before background refresh
        // This gives user time to see the setup message and feel confident about the process
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Start background group refresh (invisible to user)
        const refreshPromise = refreshGroups(true).catch((refreshError) => {
          logger.warn(
            'Background group refresh failed (non-critical):',
            refreshError,
          );
        });

        // Give refresh a moment to complete, then redirect
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await refreshPromise; // Construct the new URL and redirect
        const currentUrl = window.location.href;
        const oldSlug =
          activeGroup?.organization_slug ||
          activeGroup?.grp_slug ||
          generateSlugFromName(activeGroup?.grp_title || activeGroup?.grp_name);

        let newUrl;
        if (oldSlug && currentUrl.includes(`/org/${oldSlug}`)) {
          newUrl = currentUrl.replace(`/org/${oldSlug}`, `/org/${newSlug}`);
        } else {
          const baseUrl = window.location.origin;
          const pathAfterSlug = pathname.split('/').slice(3).join('/');
          newUrl = `${baseUrl}/org/${newSlug}/${pathAfterSlug}`;
        }
        logger.info('Redirecting to new domain', {
          from: currentUrl,
          to: newUrl,
        });
        window.location.href = newUrl;

        // Note: Code after this point won't execute due to page navigation
      } catch (error) {
        logger.error('Domain update failed', {
          error: error.message,
          groupId: activeGroup._id,
          newSlug,
        });

        setSlugStatus('error');
        setValidationErrors({ slug: error.message });
        setIsUpdating(false);
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
