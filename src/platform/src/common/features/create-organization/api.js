import logger from '@/lib/logger';

/**
 * API service for organization creation requests
 */
export class OrganizationCreationAPI {
  /**
   * Submit a new organization creation request
   * @param {Object} formData - The organization creation form data
   * @returns {Promise<Object>} - The API response
   */
  static async submitCreationRequest(formData) {
    try {
      // Log the request for debugging
      logger.info('Submitting organization creation request:', {
        organizationName: formData.organizationName,
        contactEmail: formData.contactEmail,
        country: formData.country,
        organizationType: formData.organizationType,
      });

      // TODO: Replace this with actual API call
      // const response = await fetch('/api/organizations/creation-request', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });
      //
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      //
      // return await response.json();

      // Simulate API call with realistic delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate successful response
      return {
        success: true,
        message: 'Organization creation request submitted successfully',
        requestId: `req_${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to submit organization creation request:', error);
      throw new Error(
        error.message || 'Failed to submit organization creation request',
      );
    }
  }

  /**
   * Validate organization creation form data
   * @param {Object} formData - The form data to validate
   * @returns {Object} - Validation errors object
   */
  static validateFormData(formData) {
    const errors = {};

    // Required field validations
    if (!formData.organizationName?.trim()) {
      errors.organizationName = 'Organization name is required';
    } else if (formData.organizationName.trim().length < 2) {
      errors.organizationName =
        'Organization name must be at least 2 characters';
    }

    if (!formData.contactName?.trim()) {
      errors.contactName = 'Contact name is required';
    } else if (formData.contactName.trim().length < 2) {
      errors.contactName = 'Contact name must be at least 2 characters';
    }

    if (!formData.contactEmail?.trim()) {
      errors.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      errors.contactEmail = 'Please enter a valid email address';
    }

    if (!formData.contactPhone?.trim()) {
      errors.contactPhone = 'Contact phone is required';
    } else if (!/^[\d\s+\-()]{10,}$/.test(formData.contactPhone)) {
      errors.contactPhone = 'Please enter a valid phone number';
    }

    if (!formData.country?.trim()) {
      errors.country = 'Country is required';
    }

    if (!formData.organizationType) {
      errors.organizationType = 'Organization type is required';
    }

    if (!formData.useCase?.trim()) {
      errors.useCase = 'Use case description is required';
    } else if (formData.useCase.trim().length < 10) {
      errors.useCase = 'Use case description must be at least 10 characters';
    }

    // Optional field validations
    if (formData.additionalInfo && formData.additionalInfo.length > 1000) {
      errors.additionalInfo =
        'Additional information must be less than 1000 characters';
    }

    return errors;
  }
}

export default OrganizationCreationAPI;
