'use client';

import { useUnifiedGroup } from '@/app/providers/UnifiedGroupProvider';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { getGroupDetailsApi, updateGroupDetailsApi } from '@/core/apis/Account';
import { OrganizationSettingsContainer } from '@/common/components/Organization';
import { OrganizationSettingsSkeleton } from '@/common/components/Skeleton';

// Validation schema
const validationSchema = Yup.object().shape({
  grp_title: Yup.string().required('Organization name is required'),
  grp_website: Yup.string()
    .url('Enter a valid website URL')
    .required('Website is required'),
  grp_industry: Yup.string().required('Industry is required'),
  grp_description: Yup.string().required('Description is required'),
  grp_country: Yup.string().required('Country is required'),
  grp_timezone: Yup.string().required('Timezone is required'),
});

const OrganizationSettingsPage = () => {
  const { activeGroup, isLoading: groupLoading } = useUnifiedGroup();
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [organizationDetails, setOrganizationDetails] = useState(null);

  const [formData, setFormData] = useState({
    grp_title: '',
    grp_description: '',
    grp_website: '',
    grp_industry: '',
    grp_country: '',
    grp_timezone: '',
  });
  // Fetch organization details using getGroupDetailsApi
  useEffect(() => {
    const fetchOrganizationDetails = async () => {
      if (activeGroup?._id) {
        try {
          setIsLoading(true);
          const response = await getGroupDetailsApi(activeGroup._id);

          if (response.success && response.group) {
            const orgData = response.group;
            setOrganizationDetails(orgData);

            // Update form data with fetched organization details
            setFormData({
              grp_title: orgData.grp_title || '',
              grp_description: orgData.grp_description || '',
              grp_website: orgData.grp_website || '',
              grp_industry: orgData.grp_industry || '',
              grp_country: orgData.grp_country || '',
              grp_timezone: orgData.grp_timezone || '',
            });

            setLogoPreview(orgData.grp_profile_picture || '');
          } else {
            setSaveStatus('error');
            console.error(
              'Failed to fetch organization details:',
              response.message,
            );
          }
        } catch (error) {
          setSaveStatus('error');
          console.error('Failed to fetch organization details:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (!groupLoading) {
        // If we're not loading groups but activeGroup is still null, set loading to false
        setIsLoading(false);
      }
    };

    fetchOrganizationDetails();
  }, [activeGroup?._id, groupLoading]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaveStatus('saving');
      setValidationErrors({});

      // Validate form data
      await validationSchema.validate(formData, { abortEarly: false });

      // Prepare the data for API call
      const updateData = {
        grp_title: formData.grp_title,
        grp_description: formData.grp_description,
        grp_website: formData.grp_website,
        grp_industry: formData.grp_industry,
        grp_country: formData.grp_country,
        grp_timezone: formData.grp_timezone,
      };

      // Handle logo upload if there's a new file
      if (logoFile) {
        const formDataWithFile = new FormData();
        formDataWithFile.append('grp_image', logoFile);

        // Add other fields to form data
        Object.keys(updateData).forEach((key) => {
          formDataWithFile.append(key, updateData[key]);
        }); // Update with FormData (includes logo)
        const response = await updateGroupDetailsApi(
          activeGroup._id,
          formDataWithFile,
        );

        if (response.success) {
          // Update the logo preview to the new uploaded image
          if (response.group?.grp_profile_picture) {
            setLogoPreview(response.group.grp_profile_picture);
          }

          // Dispatch custom event to notify all GroupLogo components
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new window.Event('logoRefresh'));
          }
        } else {
          throw new Error(response.message || 'Failed to update organization');
        }
      } else {
        // Update without logo
        const response = await updateGroupDetailsApi(
          activeGroup._id,
          updateData,
        );

        if (!response.success) {
          throw new Error(response.message || 'Failed to update organization');
        }
      } // Refresh organization details after successful update
      const refreshResponse = await getGroupDetailsApi(activeGroup._id);
      if (refreshResponse.success && refreshResponse.group) {
        setOrganizationDetails(refreshResponse.group);
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);

      // If logo was updated, trigger refresh event
      if (logoFile) {
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new window.Event('logoRefresh'));
          }
        }, 500);
      }
    } catch (error) {
      if (error.name === 'ValidationError') {
        const errors = {};
        error.inner.forEach((err) => {
          errors[err.path] = err.message;
        });
        setValidationErrors(errors);
        setSaveStatus('validation-error');
      } else {
        setSaveStatus('error');
        console.error('Failed to save organization details:', error);
      }
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      // Validate file type and size
      const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/svg+xml',
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setSaveStatus('invalid-file-type');
        setTimeout(() => setSaveStatus(''), 3000);
        return;
      }

      if (file.size > maxSize) {
        setSaveStatus('file-too-large');
        setTimeout(() => setSaveStatus(''), 3000);
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const newLogoUrl = e.target.result;
        setLogoPreview(newLogoUrl);
      };
      reader.readAsDataURL(file);
    }
  };
  if (isLoading || groupLoading) {
    return <OrganizationSettingsSkeleton />;
  }

  // If no active group and not loading, show error state
  if (!activeGroup && !groupLoading) {
    return (
      <div className="text-center py-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Organization Found
        </h2>
        <p className="text-gray-500 mb-4">
          Unable to load organization data. Please try refreshing the page.
        </p>{' '}
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <OrganizationSettingsContainer
      formData={formData}
      validationErrors={validationErrors}
      logoPreview={logoPreview}
      saveStatus={saveStatus}
      organizationDetails={organizationDetails}
      onInputChange={handleInputChange}
      onLogoUpload={handleLogoUpload}
      onSave={handleSave}
    />
  );
};

export default OrganizationSettingsPage;
