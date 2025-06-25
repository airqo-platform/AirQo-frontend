import { useState } from 'react';
import {
  createOrganisationRequestApi,
  getOrganisationSlugAvailabilityApi,
} from '@/core/apis/Account';
import { cloudinaryImageUpload } from '@/core/apis/Cloudinary';
import CustomToast from '@/common/components/Toast/CustomToast';
import logger from '@/lib/logger';

/**
 * Custom hook for managing organization creation functionality
 * This hook provides the state and logic for creating new organizations
 */
export const useCreateOrganization = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState(null);
  const [slugSuggestions, setSlugSuggestions] = useState([]);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Reset state when closing modal
    setSlugAvailability(null);
    setSlugSuggestions([]);
    setIsCheckingSlug(false);
  };

  /**
   * Check if organization slug is available
   * @param {string} slug - The slug to check
   * @returns {Promise<boolean>} - Whether the slug is available
   */
  const checkSlugAvailability = async (slug) => {
    if (!slug) return false;

    try {
      setIsCheckingSlug(true);
      const response = await getOrganisationSlugAvailabilityApi(slug);
      setSlugAvailability(response.available);
      setSlugSuggestions(response.alternativeSuggestions || []);
      return response.available;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Error checking slug availability';
      CustomToast({
        message: errorMessage,
        type: 'error',
      });
      setSlugAvailability(null);
      setSlugSuggestions([]);
      return false;
    } finally {
      setIsCheckingSlug(false);
    }
  };

  /**
   * Upload logo to Cloudinary
   * @param {File} logoFile - The logo file to upload
   * @returns {Promise<Object>} - Upload result
   */
  const uploadToCloudinary = async (logoFile) => {
    if (!logoFile) return { secure_url: '' };

    const formData = new FormData();
    formData.append('file', logoFile);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);
    formData.append('folder', 'organization_profiles');

    try {
      const responseData = await cloudinaryImageUpload(formData);
      return { secure_url: responseData.secure_url };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Unable to upload image to Cloudinary';
      CustomToast({
        message: errorMessage,
        type: 'error',
      });
      logger.error('Uploading organization logo to cloudinary failed:', error);
      return { secure_url: '' };
    }
  };
  /**
   * Submit organization creation request
   * @param {Object} formData - The organization creation form data
   * @param {File} logoFile - Optional logo file to upload
   * @returns {Promise<Object>} - Submission result
   */
  const handleSubmit = async (formData, logoFile = null) => {
    setIsSubmitting(true);

    try {
      let finalFormData = { ...formData };

      // Upload logo if provided
      if (logoFile) {
        try {
          const cloudinaryResponse = await uploadToCloudinary(logoFile);
          finalFormData = {
            ...finalFormData,
            branding_settings: {
              ...finalFormData.branding_settings,
              logo_url: cloudinaryResponse.secure_url,
            },
          };
        } catch (uploadError) {
          CustomToast({
            message: 'Failed to upload logo. Please try again.',
            type: 'error',
          });
          return { success: false, error: uploadError };
        }
      }

      await createOrganisationRequestApi(finalFormData);

      CustomToast({
        message: 'Organization request submitted successfully!',
        type: 'success',
      });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Unable to send request. Please try again.';
      CustomToast({
        message: errorMessage,
        type: 'error',
      });
      logger.error('Organization creation request failed:', error);
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };
  return {
    isModalOpen,
    isSubmitting,
    slugAvailability,
    slugSuggestions,
    isCheckingSlug,
    openModal,
    closeModal,
    submitOrganizationRequest: handleSubmit,
    checkSlugAvailability,
  };
};
