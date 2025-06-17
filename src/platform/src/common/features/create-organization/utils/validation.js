/**
 * Validation utilities for organization creation
 */

/**
 * Validate step 1 of organization creation form
 * @param {Object} formData - The form data to validate
 * @returns {Object} - Validation errors object
 */
export const validateStep1 = (formData, slugAvailability) => {
  const errors = {};

  if (!formData.organizationName.trim()) {
    errors.organizationName = 'Organization name is required';
  }

  if (!formData.contactName.trim()) {
    errors.contactName = 'Contact name is required';
  }

  if (!formData.contactEmail.trim()) {
    errors.contactEmail = 'Contact email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
    errors.contactEmail = 'Please enter a valid email address';
  }

  if (!formData.contactPhone.trim()) {
    errors.contactPhone = 'Contact phone is required';
  } else if (formData.contactPhone.length < 10) {
    errors.contactPhone = 'Please enter a valid phone number';
  }

  if (!formData.country.trim()) {
    errors.country = 'Country is required';
  }

  if (!formData.organizationType) {
    errors.organizationType = 'Organization type is required';
  }

  if (!formData.useCase.trim()) {
    errors.useCase = 'Use case is required';
  } else if (formData.useCase.length < 10) {
    errors.useCase = 'Use case must be at least 10 characters';
  }

  if (!formData.organizationSlug.trim()) {
    errors.organizationSlug = 'Organization URL is required';
  } else if (!/^[a-z0-9-]+$/.test(formData.organizationSlug)) {
    errors.organizationSlug =
      'URL can only contain lowercase letters, numbers, and hyphens';
  } else if (formData.organizationSlug.length < 3) {
    errors.organizationSlug = 'URL must be at least 3 characters';
  } else if (slugAvailability === false) {
    errors.organizationSlug =
      'This URL is already taken. Please choose another.';
  } else if (slugAvailability !== true) {
    errors.organizationSlug = 'Please wait while we check URL availability...';
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};

/**
 * Validate step 2 of organization creation form
 * @param {Object} formData - The form data to validate
 * @param {File} logoFile - The uploaded logo file
 * @returns {Object} - Validation errors object
 */
export const validateStep2 = (formData, logoFile) => {
  const errors = {};

  if (
    !logoFile &&
    formData.branding_settings.logo_url &&
    !formData.branding_settings.logo_url.match(
      /^(https?:\/\/)?([\w-])+\.{1}([a-zA-Z]{2,63})([/\w-]*)*\/?\??([^#\n\r]*)?#?([^\n\r]*)$/,
    )
  ) {
    errors['branding_settings.logo_url'] =
      'Please enter a valid URL or upload an image file';
  }

  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  if (
    formData.branding_settings.primary_color &&
    !colorRegex.test(formData.branding_settings.primary_color)
  ) {
    errors['branding_settings.primary_color'] =
      'Please enter a valid hex color code';
  }

  if (
    formData.branding_settings.secondary_color &&
    !colorRegex.test(formData.branding_settings.secondary_color)
  ) {
    errors['branding_settings.secondary_color'] =
      'Please enter a valid hex color code';
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};

/**
 * Validate uploaded file
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result
 */
export const validateFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif'];

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please select a valid image file (JPEG, PNG, SVG, or GIF)',
    };
  }

  if (file.size > 2 * 1024 * 1024) {
    return {
      isValid: false,
      error: 'Image file size must be less than 2MB',
    };
  }

  return { isValid: true, error: null };
};
