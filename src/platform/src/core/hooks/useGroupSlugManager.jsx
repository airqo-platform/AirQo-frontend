import { useState, useCallback } from 'react';
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
        // Don't pass groupId for availability checks - we want to know if slug is truly available
        const response = await getOrganisationSlugAvailabilityApi(slug);

        if (response.success) {
          return {
            available: response.available,
            message: response.available
              ? 'Slug is available'
              : 'This slug is already taken',
          };
        } else {
          return {
            available: false,
            message: response.message || 'Unable to check slug availability',
          };
        }
      } catch (error) {
        logger.error('Error checking slug availability:', error);
        return {
          available: false,
          message: 'Error checking availability. Please try again.',
        };
      } finally {
        setIsCheckingAvailability(false);
      }
    },
    [validateSlugFormat],
  );
  /**
   * Updates the group slug
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

      setIsUpdating(true);
      setValidationErrors({});
      setSlugStatus('updating');

      try {
        // Update the slug directly - availability has already been checked in the form
        const response = await updateGroupSlugApi(activeGroup._id, {
          slug: newSlug,
          regenerate: true,
        });
        if (!response.success) {
          throw new Error(response.message || 'Failed to update slug');
        }

        // Note: We don't update Redux store here since setupUserSession will handle
        // fetching and setting all user/group data globally after the update

        // Refresh groups data to get the updated slug
        await refreshGroups();

        setSlugStatus('success');

        return {
          success: true,
          message: 'Organization URL updated successfully',
          newSlug,
        };
      } catch (error) {
        logger.error('Error updating group slug:', error);
        setSlugStatus('error');
        setValidationErrors({ slug: error.message });
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [activeGroup, validateSlugFormat, refreshGroups],
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
      generateSlugFromName(activeGroup?.grp_title || activeGroup?.grp_name),
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
