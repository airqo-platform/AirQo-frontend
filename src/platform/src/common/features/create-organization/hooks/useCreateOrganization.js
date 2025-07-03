// src/hooks/useCreateOrganization.js

import { useState } from 'react';
import {
  createOrganisationRequestApi,
  getOrganisationSlugAvailabilityApi,
} from '@/core/apis/Account';
import { cloudinaryImageUpload } from '@/core/apis/Cloudinary';
import CustomToast from '@/common/components/Toast/CustomToast';
import logger from '@/lib/logger';

/**
 * Hook to manage org-creation: slug checks, logo upload, payload formatting,
 * and submission in one place.
 */
export const useCreateOrganization = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState(null); // true | false | null
  const [slugSuggestions, setSlugSuggestions] = useState([]); // [string]
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  /**
   * Checks if a slug is available, updates state accordingly.
   * @returns {Promise<boolean>}
   */
  const checkSlugAvailability = async (slug) => {
    const clean = slug.trim();
    if (!clean) {
      setSlugAvailability(null);
      setSlugSuggestions([]);
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
      CustomToast({ message: msg, type: 'error' });
      setSlugAvailability(null);
      setSlugSuggestions([]);
      return false;
    } finally {
      setIsCheckingSlug(false);
    }
  };

  /**
   * Handles uploading to Cloudinary; returns the secure URL or empty string.
   */
  const uploadLogo = async (file) => {
    if (!file) return '';
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);
    fd.append('folder', 'organization_profiles');

    try {
      const { secure_url } = await cloudinaryImageUpload(fd);
      return secure_url;
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || 'Image upload failed';
      CustomToast({ message: msg, type: 'error' });
      logger.error('Cloudinary upload error:', err);
      return '';
    }
  };

  /**
   * Takes camelCase formData + optional File, builds snake_case payload,
   * uploads logo if any, then POSTs to the API.
   * @returns {Promise<{success: boolean, error?: any}>}
   */
  const submitOrganizationRequest = async (formData, logoFile) => {
    setIsSubmitting(true);
    try {
      // 1) upload logo (if provided)
      const logo_url = logoFile
        ? await uploadLogo(logoFile)
        : formData.branding_settings.logo_url || '';

      // 2) build API payload
      const payload = {
        organization_name: formData.organizationName.trim(),
        organization_slug: formData.organizationSlug.trim(),
        contact_email: formData.contactEmail.trim(),
        contact_name: formData.contactName.trim(),
        contact_phone: formData.contactPhone.trim(),
        use_case: formData.useCase.trim(),
        organization_type: formData.organizationType,
        country: formData.country.trim(),
        branding_settings: {
          logo_url,
          primary_color: formData.branding_settings.primary_color,
          secondary_color: formData.branding_settings.secondary_color,
        },
      };

      // 3) send it
      await createOrganisationRequestApi(payload);

      CustomToast({
        message: 'Organization request submitted successfully!',
        type: 'success',
      });
      return { success: true };
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        'Failed to submit request';
      CustomToast({ message: msg, type: 'error' });
      logger.error('Org creation error:', err);
      return { success: false, error: err };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    slugAvailability,
    slugSuggestions,
    isCheckingSlug,
    checkSlugAvailability,
    submitOrganizationRequest,
  };
};
