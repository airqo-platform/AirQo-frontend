'use client';

/**
 * Organization Settings Page
 *
 * This component implements a save-only-on-button-click pattern to ensure that:
 * 1. Form changes are only stored locally until the user explicitly clicks "Save Changes"
 * 2. No automatic saves occur when users type or make changes
 * 3. Users are warned about unsaved changes when navigating away
 * 4. Clear visual indicators show when there are unsaved changes
 * 5. A "Discard Changes" button allows users to reset to original values
 */

import { useUnifiedGroup } from '@/app/providers/UnifiedGroupProvider';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import {
  getGroupDetailsApi,
  updateGroupDetailsApi,
  getUserDetails,
} from '@/core/apis/Account';
import { OrganizationSettingsContainer } from '@/common/components/Organization';
import { OrganizationSettingsSkeleton } from '@/common/components/Skeleton';
import { setUserInfo } from '@/lib/store/services/account/LoginSlice';
import {
  fetchUserGroups,
  updateGroupDetails,
  setActiveGroup,
} from '@/lib/store/services/groups';

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
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.login?.userInfo);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [organizationDetails, setOrganizationDetails] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState({
    grp_title: '',
    grp_description: '',
    grp_website: '',
    grp_industry: '',
    grp_country: '',
    grp_timezone: '',
    grp_profile_picture: '',
    grp_image: '',
    grp_status: '',
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
              grp_profile_picture: orgData.grp_profile_picture || '',
              grp_image: orgData.grp_image || '',
              grp_status: orgData.grp_status || '',
            });
            setLogoPreview(orgData.grp_profile_picture || '');
          } else {
            setSaveStatus('error');
          }
        } catch {
          setSaveStatus('error');
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

  // Warn user about unsaved changes when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
        return ''; // Required for other browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]); // Handle input changes - only updates local state, does NOT save to server
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Mark as having unsaved changes
    setHasUnsavedChanges(true);

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  }; // Handle save button click - ONLY way to save changes to server
  const handleSave = async () => {
    try {
      setSaveStatus('saving');
      setValidationErrors({});

      // Validate form data
      await validationSchema.validate(formData, { abortEarly: false }); // Add grp_status to the update data
      const updateData = {
        grp_title: formData.grp_title,
        grp_description: formData.grp_description,
        grp_website: formData.grp_website,
        grp_industry: formData.grp_industry,
        grp_country: formData.grp_country,
        grp_timezone: formData.grp_timezone,
        grp_status: formData.grp_status,
      };

      // Add Cloudinary URLs if available (prioritize over file upload)
      if (formData.grp_profile_picture) {
        updateData.grp_profile_picture = formData.grp_profile_picture;
      }
      if (formData.grp_image) {
        updateData.grp_image = formData.grp_image;
      }

      // Always send as JSON (never as FormData with file)
      // The OrganizationInformationForm handles Cloudinary upload and sets URLs in formData
      const response = await updateGroupDetailsApi(activeGroup._id, updateData);

      if (!response.success) {
        throw new Error(response.message || 'Failed to update organization');
      }

      // If logo was updated via Cloudinary, update preview
      if (updateData.grp_profile_picture) {
        setLogoPreview(updateData.grp_profile_picture);
      } // Refresh user and group data in Redux to update all components
      await refreshUserAndGroupData();

      // Refetch the latest organization details to ensure UI reflects all changes
      const latestResponse = await getGroupDetailsApi(activeGroup._id);
      if (latestResponse.success && latestResponse.group) {
        const latestOrgData = latestResponse.group;
        setOrganizationDetails(latestOrgData);

        // Update formData with the latest data to ensure consistency
        setFormData({
          grp_title: latestOrgData.grp_title || '',
          grp_description: latestOrgData.grp_description || '',
          grp_website: latestOrgData.grp_website || '',
          grp_industry: latestOrgData.grp_industry || '',
          grp_country: latestOrgData.grp_country || '',
          grp_timezone: latestOrgData.grp_timezone || '',
          grp_profile_picture: latestOrgData.grp_profile_picture || '',
          grp_image: latestOrgData.grp_image || '',
          grp_status: latestOrgData.grp_status || '',
        });
      }

      // Small delay to ensure Redux state has propagated and then force final refresh
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new window.Event('logoRefresh'));
        }
      }, 100);

      // Mark as saved successfully
      setHasUnsavedChanges(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
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
      }
      setTimeout(() => setSaveStatus(''), 3000);
    }
  }; // Function to refresh user and group data in Redux
  const refreshUserAndGroupData = async () => {
    try {
      // First, refresh user information in Redux
      if (userInfo?._id) {
        const userResponse = await getUserDetails(userInfo._id);
        if (
          userResponse.success &&
          userResponse.users &&
          userResponse.users.length > 0
        ) {
          const updatedUser = userResponse.users[0];
          dispatch(setUserInfo(updatedUser));
        }
      }

      // Then, refresh the specific group details
      if (activeGroup?._id) {
        const refreshResponse = await getGroupDetailsApi(activeGroup._id);
        if (refreshResponse.success && refreshResponse.group) {
          const updatedGroup = refreshResponse.group;
          setOrganizationDetails(updatedGroup);

          // Update the group details in Redux
          dispatch(updateGroupDetails(updatedGroup));

          // Also update the active group if it's the same group
          if (activeGroup._id === updatedGroup._id) {
            dispatch(setActiveGroup(updatedGroup));
          }
        }
      }

      // Finally, refresh all groups data in Redux
      if (userInfo?._id) {
        await dispatch(fetchUserGroups(userInfo._id));
      }

      // Force refresh of all GroupLogo components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new window.Event('logoRefresh'));
        // Also dispatch a more specific event
        window.dispatchEvent(
          new window.CustomEvent('groupDataUpdated', {
            detail: { timestamp: Date.now() },
          }),
        );
      }
    } catch {
      // Silently handle errors in refresh since the main save was successful
      // The save operation was successful, refresh errors are not critical
    }
  };

  // Reset form to original values (discard unsaved changes)
  const handleReset = () => {
    if (organizationDetails) {
      setFormData({
        grp_title: organizationDetails.grp_title || '',
        grp_description: organizationDetails.grp_description || '',
        grp_website: organizationDetails.grp_website || '',
        grp_industry: organizationDetails.grp_industry || '',
        grp_country: organizationDetails.grp_country || '',
        grp_timezone: organizationDetails.grp_timezone || '',
        grp_profile_picture: organizationDetails.grp_profile_picture || '',
        grp_image: organizationDetails.grp_image || '',
        grp_status: organizationDetails.grp_status || '',
      });
      setLogoPreview(organizationDetails.grp_profile_picture || '');
      setHasUnsavedChanges(false);
      setValidationErrors({});
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
      hasUnsavedChanges={hasUnsavedChanges}
      onInputChange={handleInputChange}
      onSave={handleSave}
      onReset={handleReset}
    />
  );
};

export default OrganizationSettingsPage;
