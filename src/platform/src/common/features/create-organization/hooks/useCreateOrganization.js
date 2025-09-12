import { useState, useCallback } from 'react';
import {
  createOrganisationRequestApi,
  getOrganisationSlugAvailabilityApi,
} from '@/core/apis/Account';
import { cloudinaryImageUpload } from '@/core/apis/Cloudinary';
import NotificationService from '@/core/utils/notificationService';
import logger from '@/lib/logger';
import { transformFormDataForAPI } from '../utils/formUtils';

/**
 * Hook to manage org-creation: slug checks, logo upload, payload formatting,
 * and submission in one place.
 */
export const useCreateOrganization = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState(null);
  const [slugSuggestions, setSlugSuggestions] = useState([]);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  /**
   * Checks if a slug is available, updates state accordingly.
   * @param {string} slug - The slug to check
   * @returns {Promise<boolean>} - True if available, false otherwise
   */
  const checkSlugAvailability = useCallback(async (slug) => {
    const clean = slug.trim();
    if (!clean) {
      // Reset if slug is empty/whitespace
      setSlugAvailability(null);
      setSlugSuggestions([]);
      setIsCheckingSlug(false);
      return false;
    }
    if (clean.length < 3) {
      // Reset if slug is too short
      setSlugAvailability(null);
      setSlugSuggestions([]);
      setIsCheckingSlug(false);
      return false;
    }
    setIsCheckingSlug(true);
    try {
      const { available, alternativeSuggestions } =
        await getOrganisationSlugAvailabilityApi(clean);
      setSlugAvailability(available);
      setSlugSuggestions(alternativeSuggestions || []);
      return available;
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || 'Error checking URL';
      const statusCode = err?.response?.status || err?.status || 500;
      NotificationService.error(statusCode, msg);
      logger.error('Slug availability check error:', err);
      setSlugAvailability(null);
      setSlugSuggestions([]);
      return false;
    } finally {
      setIsCheckingSlug(false);
    }
  }, []);

  // Function to explicitly reset slug check state (e.g., when slug becomes too short)
  const resetSlugCheck = useCallback(() => {
    setSlugAvailability(null);
    setSlugSuggestions([]);
    setIsCheckingSlug(false);
  }, []);

  /**
   * Handles uploading to Cloudinary; returns the secure URL or empty string.
   * @param {File} file - The file to upload
   * @returns {Promise<string>} - The secure URL or empty string on failure
   */
  const uploadLogo = useCallback(async (file) => {
    if (!file) return '';
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);
    fd.append('folder', 'organization_profiles');

    try {
      // Ensure cloudinaryImageUpload returns a promise that resolves to an object with secure_url
      const response = await cloudinaryImageUpload(fd);
      return response?.secure_url || '';
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || 'Image upload failed';
      const statusCode = err?.response?.status || err?.status || 500;
      NotificationService.error(statusCode, msg);
      logger.error('Cloudinary upload error:', err);
      return '';
    }
  }, []);

  /**
   * Takes formData + optional File, builds payload,
   * uploads logo if any, then POSTs to the API.
   * @param {Object} formData - The form data object
   * @param {File} logoFile - The logo file object
   * @returns {Promise<{success: boolean, error?: any}>}
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const submitOrganizationRequest = useCallback(
    async (formData, logoFile) => {
      setIsSubmitting(true);
      try {
        // upload logo (if provided)
        const logo_url = logoFile
          ? await uploadLogo(logoFile)
          : formData.branding_settings.logo_url || '';

        // build API payload with trimmed values
        const payload = transformFormDataForAPI({
          ...formData,
          branding_settings: {
            ...formData.branding_settings,
            logo_url, // Override with uploaded URL or existing one
          },
        });

        // send it
        const response = await createOrganisationRequestApi(payload);
        const success = response?.success !== false; // default true if not provided
        if (!success) {
          const msg = response?.message || 'Failed to submit request';
          NotificationService.error(400, msg);
          return { success: false, error: new Error(msg) };
        }
        NotificationService.success(
          201,
          'Organization request submitted successfully!',
        );
        return { success: true, data: response };
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err.message ||
          'Failed to submit request';
        const statusCode = err?.response?.status || err?.status || 500;
        NotificationService.error(statusCode, msg);
        logger.error('Org creation error:', err);
        return { success: false, error: err };
      } finally {
        setIsSubmitting(false);
      }
    },
    [uploadLogo],
  );

  return {
    isSubmitting,
    slugAvailability,
    slugSuggestions,
    isCheckingSlug,
    checkSlugAvailability,
    submitOrganizationRequest,
    resetSlugCheck,
  };
};
