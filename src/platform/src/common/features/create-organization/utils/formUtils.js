/**
 * Generate organization slug from name
 * @param {string} organizationName - The organization name
 * @returns {string} - Generated slug
 */
export const generateSlugFromName = (organizationName) => {
  if (!organizationName) return '';

  return organizationName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Handle input change for nested objects
 * @param {Event} e - Input change event
 * @param {Function} setFormData - Form data setter function
 * @param {Function} setErrors - Errors setter function
 * @param {Object} errors - Current errors object
 */
export const handleInputChange = (e, setFormData, setErrors, errors) => {
  // Safety check for event and target
  if (!e || !e.target) {
    return;
  }

  const { name, value } = e.target;

  if (!name) {
    return;
  }

  if (name.includes('.')) {
    const [parent, child] = name.split('.');
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value,
      },
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Clear errors when user starts typing
  if (errors[name]) {
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  }
};

/**
 * Initial form data structure
 */
export const getInitialFormData = () => ({
  organizationName: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  country: '',
  organizationType: '',
  useCase: '',
  organizationSlug: '',
  branding_settings: {
    logo_url: '',
    primary_color: '#004080',
    secondary_color: '#FFFFFF',
  },
});

/**
 * Transform form data to API format
 * @param {Object} formData - Form data
 * @returns {Object} - API formatted data
 */
export const transformFormDataForAPI = (formData) => ({
  organization_name: formData.organizationName,
  organization_slug: formData.organizationSlug,
  contact_email: formData.contactEmail,
  contact_name: formData.contactName,
  contact_phone: formData.contactPhone,
  use_case: formData.useCase,
  organization_type: formData.organizationType,
  country: formData.country,
  branding_settings: {
    logo_url: formData.branding_settings.logo_url,
    primary_color: formData.branding_settings.primary_color,
    secondary_color: formData.branding_settings.secondary_color,
  },
});
