'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import withOrgAuth from '@/core/HOC/withOrgAuth';
import CardWrapper from '@/common/components/CardWrapper';
import Button from '@/common/components/Button';
import TextField from '@/components/TextInputField';
import SelectDropdown from '@/common/components/SelectDropdown';
import AlertBox from '@/common/components/AlertBox';
import { FaSave, FaCamera } from 'react-icons/fa';
import { updateUserCreationDetails } from '@/core/apis/Account';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import timeZones from 'timezones.json';

// Country and timezone setup
countries.registerLocale(enLocale);
const countryObj = countries.getNames('en', { select: 'official' });
const countryOptions = Object.entries(countryObj).map(([key, value]) => ({
  label: value,
  value: key,
}));
const timeZonesArr = timeZones.map((tz) => ({
  label: tz.text,
  value: tz.text,
}));

const UserProfilePage = ({ params }) => {
  const { data: session } = useSession();
  const _router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [updatedProfilePicture, setUpdatedProfilePicture] = useState('');
  const [showDeleteProfileModal, setShowDeleteProfileModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [errorState, setErrorState] = useState({
    isError: false,
    message: '',
    type: 'error',
  });

  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    country: '',
    timezone: '',
    description: '',
    profilePicture: '',
  });

  const _orgSlug = params?.org_slug || '';

  // Initialize user data from session
  useEffect(() => {
    if (session?.user) {
      setUserData({
        firstName: session.user.firstName || '',
        lastName: session.user.lastName || '',
        email: session.user.email || '',
        phone: session.user.phone || '',
        jobTitle: session.user.jobTitle || '',
        country: session.user.country || '',
        timezone: session.user.timezone || '',
        description: session.user.description || '',
        profilePicture: session.user.profilePicture || '',
      });
    }
  }, [session]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setUserData({ ...userData, [id]: value });

    // Clear field-specific error when user types
    if (validationErrors[id]) {
      setValidationErrors({ ...validationErrors, [id]: '' });
    }
  };

  const handleCountryChange = (option) => {
    setUserData({ ...userData, country: option.value });
    if (validationErrors.country) {
      setValidationErrors({ ...validationErrors, country: '' });
    }
  };

  const handleTimezoneChange = (option) => {
    setUserData({ ...userData, timezone: option.value });
    if (validationErrors.timezone) {
      setValidationErrors({ ...validationErrors, timezone: '' });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!userData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!userData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!userData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!userData.country) {
      errors.country = 'Country is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setErrorState({
        isError: true,
        message: 'Please fix the errors below',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      const userId = session?.user?.id;
      if (!userId) {
        throw new Error('User ID not found');
      }

      await updateUserCreationDetails(userData, userId);
      setErrorState({
        isError: true,
        message: 'Profile updated successfully',
        type: 'success',
      });
    } catch {
      setErrorState({
        isError: true,
        message: 'Failed to update profile',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (session?.user) {
      setUserData({
        firstName: session.user.firstName || '',
        lastName: session.user.lastName || '',
        email: session.user.email || '',
        phone: session.user.phone || '',
        jobTitle: session.user.jobTitle || '',
        country: session.user.country || '',
        timezone: session.user.timezone || '',
        description: session.user.description || '',
        profilePicture: session.user.profilePicture || '',
      });
    }
    setValidationErrors({});
    setErrorState({ isError: false, message: '', type: 'error' });
  };

  const handleProfileImageUpdate = async () => {
    if (!updatedProfilePicture) return;

    setProfileUploading(true);
    try {
      const userId = session?.user?.id;
      if (!userId) {
        throw new Error('User ID not found');
      }

      await updateUserCreationDetails(
        {
          profilePicture: updatedProfilePicture,
        },
        userId,
      );
      setUserData((prev) => ({
        ...prev,
        profilePicture: updatedProfilePicture,
      }));
      setUpdatedProfilePicture('');

      setErrorState({
        isError: true,
        message: 'Profile picture updated successfully',
        type: 'success',
      });
    } catch {
      setErrorState({
        isError: true,
        message: 'Failed to update profile picture',
        type: 'error',
      });
    } finally {
      setProfileUploading(false);
    }
  };

  const deleteProfileImage = async () => {
    try {
      const userId = session?.user?.id;
      if (!userId) {
        throw new Error('User ID not found');
      }

      await updateUserCreationDetails({ profilePicture: '' }, userId);
      setUserData((prev) => ({ ...prev, profilePicture: '' }));
      setUpdatedProfilePicture('');
      setShowDeleteProfileModal(false);

      setErrorState({
        isError: true,
        message: 'Profile picture deleted successfully',
        type: 'success',
      });
    } catch {
      setErrorState({
        isError: true,
        message: 'Failed to delete profile picture',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <CardWrapper
        title="My Profile"
        subtitle="Manage your personal account information"
        padding="p-6"
      />

      {/* Alert Box */}
      <AlertBox
        message={errorState.message}
        type={errorState.type}
        show={errorState.isError}
        onClose={() => setErrorState({ ...errorState, isError: false })}
      />

      {/* Profile Content */}
      <CardWrapper padding="p-6">
        <div className="space-y-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {userData.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <h3 className="text-2xl font-medium text-blue-600">
                    {userData.firstName && userData.lastName
                      ? userData.firstName[0] + userData.lastName[0]
                      : ''}
                  </h3>
                )}
              </div>
              <Button
                variant="filled"
                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                <FaCamera className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowDeleteProfileModal(true)}
                disabled={!userData.profilePicture}
                variant="outlined"
                className="text-sm"
              >
                Delete
              </Button>
              <Button
                onClick={handleProfileImageUpdate}
                disabled={!updatedProfilePicture}
                className="text-sm"
                loading={profileUploading}
              >
                {updatedProfilePicture && !profileUploading
                  ? 'Save photo'
                  : profileUploading
                    ? 'Uploading...'
                    : 'Update'}
              </Button>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <TextField
                id="firstName"
                value={userData.firstName}
                onChange={handleChange}
                label="First name"
                placeholder="Enter first name"
                error={validationErrors.firstName}
                required
              />

              {/* Last Name */}
              <TextField
                id="lastName"
                value={userData.lastName}
                onChange={handleChange}
                label="Last name"
                placeholder="Enter last name"
                error={validationErrors.lastName}
                required
              />

              {/* Email */}
              <TextField
                id="email"
                value={userData.email}
                onChange={handleChange}
                label="Email"
                placeholder="Enter email address"
                error={validationErrors.email}
                type="email"
                required
              />

              {/* Phone */}
              <TextField
                id="phone"
                value={userData.phone}
                onChange={handleChange}
                label="Phone"
                placeholder="Enter phone number"
                error={validationErrors.phone}
              />

              {/* Job Title */}
              <TextField
                id="jobTitle"
                value={userData.jobTitle}
                onChange={handleChange}
                label="Job title"
                placeholder="Enter job title"
                error={validationErrors.jobTitle}
              />

              {/* Country */}
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
                  Country
                  <span className="ml-1 text-blue-600 dark:text-blue-400">
                    *
                  </span>
                </label>
                <SelectDropdown
                  items={countryOptions}
                  selected={
                    countryOptions.find(
                      (option) => option.value === userData.country,
                    ) || null
                  }
                  onChange={handleCountryChange}
                  placeholder="Select a country"
                  error={validationErrors.country}
                  required
                />
              </div>

              {/* Timezone */}
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Timezone
                </label>
                <SelectDropdown
                  items={timeZonesArr}
                  selected={
                    timeZonesArr.find(
                      (option) => option.value === userData.timezone,
                    ) || null
                  }
                  onChange={handleTimezoneChange}
                  placeholder="Select a timezone"
                  error={validationErrors.timezone}
                />
              </div>

              {/* Bio/Description */}
              <div className="md:col-span-2">
                <TextField
                  id="description"
                  value={userData.description}
                  onChange={handleChange}
                  label="Bio"
                  placeholder="Enter your bio"
                  error={validationErrors.description}
                  multiline
                  rows={3}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-6">
              <Button
                onClick={handleCancel}
                type="button"
                variant="outlined"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isLoading} Icon={FaSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </CardWrapper>

      {/* Delete Profile Picture Modal */}
      {showDeleteProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Profile Picture
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete your profile picture? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setShowDeleteProfileModal(false)}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button onClick={deleteProfileImage} variant="danger">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withOrgAuth(UserProfilePage);
