export const generateSlugFromName = (organizationName) => {
  if (!organizationName) return '';
  return organizationName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const handleInputChange = (prevState, name, value) => {
  if (!name) return prevState;

  if (name.includes('.')) {
    const [parent, child] = name.split('.');
    const updatedParent = {
      ...(prevState[parent] || {}),
      [child]: value,
    };
    return {
      ...prevState,
      [parent]: updatedParent,
    };
  } else {
    return {
      ...prevState,
      [name]: value,
    };
  }
};

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

// FIXED: Export this function
export const transformFormDataForAPI = (formData) => ({
  organization_name: formData.organizationName?.trim(),
  organization_slug: formData.organizationSlug?.trim(),
  contact_email: formData.contactEmail?.trim(),
  contact_name: formData.contactName?.trim(),
  contact_phone: formData.contactPhone?.trim(),
  use_case: formData.useCase?.trim(),
  organization_type: formData.organizationType,
  country: formData.country?.trim(),
  branding_settings: {
    logo_url: formData.branding_settings?.logo_url || '',
    primary_color: formData.branding_settings?.primary_color,
    secondary_color: formData.branding_settings?.secondary_color,
  },
});
