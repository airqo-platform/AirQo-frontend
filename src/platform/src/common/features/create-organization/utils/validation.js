export const validateFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif'];
  if (!file) {
    return { isValid: false, error: 'No file selected.' };
  }
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Select a JPEG, PNG, SVG, or GIF under 2MB',
    };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { isValid: false, error: 'Image file size must be less than 2MB' };
  }
  return { isValid: true, error: null };
};

export const validateStep1 = (formData, slugAvailability) => {
  const errors = {};

  if (!formData.organizationName?.trim()) {
    errors.organizationName = 'Organization name is required';
  }

  if (!formData.contactName?.trim()) {
    errors.contactName = 'Contact name is required';
  }

  if (!formData.contactEmail?.trim()) {
    errors.contactEmail = 'Contact email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
    errors.contactEmail = 'Please enter a valid email address';
  }

  if (!formData.contactPhone?.trim()) {
    errors.contactPhone = 'Contact phone is required';
  } else if (formData.contactPhone.length < 10) {
    errors.contactPhone = 'Please enter a valid phone number';
  }

  if (!formData.country?.trim()) {
    errors.country = 'Country is required';
  }

  if (!formData.organizationType) {
    errors.organizationType = 'Organization type is required';
  }

  if (!formData.useCase?.trim()) {
    errors.useCase = 'Use case is required';
  } else if (formData.useCase.length < 10) {
    errors.useCase = 'Use case must be at least 10 characters';
  }

  const slug = formData.organizationSlug?.trim();
  if (!slug) {
    errors.organizationSlug = 'Organization URL is required';
  } else if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.organizationSlug =
      'URL can only contain lowercase letters, numbers, and hyphens';
  } else if (slug.length < 3) {
    errors.organizationSlug = 'URL must be at least 3 characters';
  } else if (slugAvailability === false) {
    errors.organizationSlug = 'This URL is already taken';
  } else if (slugAvailability !== true) {
    errors.organizationSlug = 'Checking URL availability...';
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};

export const validateStep2 = (formData) => {
  const errors = {};
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  if (!hexRegex.test(formData.branding_settings?.primary_color)) {
    errors['branding_settings.primary_color'] =
      'Please enter a valid hex color code (e.g., #135DFF)';
  }

  if (!hexRegex.test(formData.branding_settings?.secondary_color)) {
    errors['branding_settings.secondary_color'] =
      'Please enter a valid hex color code (e.g., #FFFFFF)';
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};
