import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import { FaSpinner } from 'react-icons/fa';
import * as Yup from 'yup';
import AlertBox from '@/components/AlertBox';
import Button from '@/components/Button';
import Card from '@/components/CardWrapper';
import InputField from '@/common/components/InputField';
import SelectDropdown from '@/components/SelectDropdown';
import TextField from '@/common/components/TextInputField';
import CustomToast from '@/components/Toast/CustomToast';
import ProfileSkeleton from '../components/ProfileSkeleton';
import { updateUserCreationDetails, getUserDetails } from '@/core/apis/Account';
import { cloudinaryImageUpload } from '@/core/apis/Cloudinary';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { setUserInfo } from '@/lib/store/services/account/LoginSlice';
import { useChecklistSteps } from '@/features/Checklist/hooks/useChecklistSteps';

// Country setup
countries.registerLocale(enLocale);
const countryObj = countries.getNames('en', { select: 'official' });
const countryOptions = Object.entries(countryObj).map(([key, value]) => ({
  label: value,
  value: key,
}));

// Yup validation schema (removed phone and timezone)
const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  jobTitle: Yup.string().optional(),
  country: Yup.string().required('Country is required'),
  description: Yup.string().optional(),
});

const Profile = () => {
  const dispatch = useDispatch();
  const { data: session, update: updateSession } = useSession();
  const [errorState, setErrorState] = useState({
    isError: false,
    message: '',
    type: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    country: '',
    description: '',
    profilePicture: '',
  });
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [localImagePreview, setLocalImagePreview] = useState(null);
  const [imageError, setImageError] = useState(false);
  const { completeStep } = useChecklistSteps();

  // Helper function to parse API error responses
  const parseApiErrors = (error) => {
    const parsedErrors = {};

    // Handle the API error format you provided
    if (
      error.response?.data?.errors &&
      Array.isArray(error.response.data.errors)
    ) {
      error.response.data.errors.forEach((err) => {
        if (err.param && err.message) {
          parsedErrors[err.param] = err.message;
        }
      });
    }

    // Handle other error formats
    if (error.response?.data?.message) {
      return { general: error.response.data.message };
    }

    if (error.message) {
      return { general: error.message };
    }

    return parsedErrors;
  };

  // Function to fetch user details from API
  const fetchUserDetails = async () => {
    if (!session?.user?.id) return;

    setIsDataLoading(true);
    try {
      const res = await getUserDetails(session.user.id);
      if (res.success && res.users && res.users.length > 0) {
        const user = res.users[0];

        // Map API response fields to form fields (removed phone and timezone)
        setUserData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          jobTitle: user.jobTitle || '',
          country: user.country || '',
          description: user.description || '',
          profilePicture: user.profilePicture || '',
        });

        // Clear local preview when fetching fresh data
        setLocalImagePreview(null);
        setImageError(false);
      } else {
        setErrorState({
          isError: true,
          message: 'Failed to fetch user details',
          type: 'error',
        });
      }
    } catch (error) {
      setErrorState({
        isError: true,
        message: error.message || 'Error fetching user details',
        type: 'error',
      });
    } finally {
      setIsDataLoading(false);
    }
  };

  // Fixed useEffect with proper dependency array to prevent infinite loop
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserDetails();
    }
  }, [session?.user?.id]); // Only depend on the user ID

  // Handler for input changes from InputField/TextField components.
  const handleChange = (e) => {
    const { id, value } = e.target;
    setUserData({ ...userData, [id]: value });
    // Clear field-specific error when user types
    if (validationErrors[id]) {
      setValidationErrors({ ...validationErrors, [id]: '' });
    }
  };

  // Handlers for SelectDropdown fields
  const handleCountryChange = (option) => {
    setUserData({ ...userData, country: option.value });
    if (validationErrors.country) {
      setValidationErrors({ ...validationErrors, country: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Validate the userData using Yup schema
    try {
      await validationSchema.validate(userData, { abortEarly: false });
      // Clear any previous validation errors
      setValidationErrors({});
    } catch (validationError) {
      const errors = {};
      validationError.inner.forEach((err) => {
        errors[err.path] = err.message;
      });
      setValidationErrors(errors);
      setIsSaving(false);
      return;
    }

    if (!session?.user?.id) {
      setErrorState({
        isError: true,
        message: 'No valid user session found',
        type: 'error',
      });
      setIsSaving(false);
      return;
    }

    const userID = session.user.id;

    // Create a cleaned version of userData, prioritizing local preview URL if available
    const dataToUpdate = {
      ...userData,
      // Use local preview URL if available (from recent upload), otherwise use existing profilePicture
      profilePicture: localImagePreview || userData.profilePicture || '',
    };

    // Remove empty profilePicture
    if (!dataToUpdate.profilePicture) {
      delete dataToUpdate.profilePicture;
    }

    try {
      await updateUserCreationDetails(dataToUpdate, userID);

      // Refresh user data after successful update
      await fetchUserDetails();

      // Update the session with new user data
      const res = await getUserDetails(userID);
      const updatedUser = res?.users?.[0];
      if (updatedUser) {
        const updatedData = { _id: userID, ...updatedUser };
        await updateSession({
          user: {
            ...session.user,
            ...updatedData,
          },
        });
        dispatch(setUserInfo(updatedData));
      }

      if (
        userData.firstName &&
        userData.lastName &&
        userData.email &&
        userData.country
      ) {
        completeStep(2);
      }

      // Clear local preview after successful save
      setLocalImagePreview(null);

      setErrorState({
        isError: true,
        message: 'User details successfully updated',
        type: 'success',
      });
    } catch (error) {
      // Parse API errors to set field-specific errors
      const apiErrors = parseApiErrors(error);

      if (Object.keys(apiErrors).length > 0 && !apiErrors.general) {
        // If we have field-specific errors, set them in validation errors
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          ...apiErrors,
        }));

        setErrorState({
          isError: true,
          message: 'Please fix the errors below and try again',
          type: 'error',
        });
      } else {
        // If it's a general error, show it in the alert
        setErrorState({
          isError: true,
          message:
            apiErrors.general || error.message || 'Error updating user details',
          type: 'error',
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handler for cancel button
  const handleCancel = () => {
    // Reset form to initial state
    fetchUserDetails();
    setValidationErrors({});
    setErrorState({ isError: false, message: '', type: '' });
    setLocalImagePreview(null);
    setImageError(false);
  };

  // Enhanced image upload with consistent pattern
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/svg+xml',
      'image/webp',
    ];
    if (!allowedTypes.includes(file.type)) {
      CustomToast({
        message: 'Please upload a valid image file (PNG, JPG, SVG, WEBP)',
        type: 'error',
      });
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      CustomToast({
        message: 'File size must be less than 5MB',
        type: 'error',
      });
      return;
    }

    // Create local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setLocalImagePreview(e.target.result);
      setImageError(false);
    };
    reader.readAsDataURL(file);

    setProfileUploading(true);

    try {
      // Create cropped image
      const croppedImage = await cropImage(file);

      // Upload to Cloudinary
      const formData = new FormData();

      // Convert base64 to blob
      const response = await fetch(croppedImage);
      const blob = await response.blob();

      formData.append('file', blob);
      formData.append(
        'upload_preset',
        process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || 'ml_default',
      );
      formData.append('folder', 'profiles');

      const responseData = await cloudinaryImageUpload(formData);
      const cloudinaryUrl = responseData?.secure_url;

      if (cloudinaryUrl) {
        // Replace local preview with Cloudinary URL after successful upload
        setLocalImagePreview(cloudinaryUrl);

        // Show success toast - user needs to click Save to persist
        CustomToast({
          message:
            'Profile image uploaded successfully! Click Save to apply changes.',
          type: 'success',
        });
      } else {
        CustomToast({
          message:
            'Upload completed but failed to get image URL. Please try again.',
          type: 'error',
        });
        throw new Error('Failed to get secure URL from Cloudinary response');
      }
    } catch {
      // Handle upload error - keep local preview but show error
      CustomToast({
        message:
          'Failed to upload profile image to cloud storage. The preview is shown locally, but please try uploading again.',
        type: 'error',
      });
    } finally {
      setProfileUploading(false);
    }
  };

  const cropImage = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          const maxSize = 200;
          let width = img.width,
            height = img.height;
          const aspectRatio = width / height;
          if (width > height && width > maxSize) {
            height = Math.round(maxSize / aspectRatio);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round(maxSize * aspectRatio);
            height = maxSize;
          }
          canvas.width = width;
          canvas.height = height;
          context.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL(file.type));
        };
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // Generate user initials and color for fallback display
  const userDisplay = useMemo(() => {
    const firstName = userData.firstName || '';
    const lastName = userData.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();

    // Generate initials (max 2 characters)
    let initials;
    if (firstName && lastName) {
      initials = (firstName[0] + lastName[0]).toUpperCase();
    } else if (firstName) {
      initials = firstName.substring(0, 2).toUpperCase();
    } else if (lastName) {
      initials = lastName.substring(0, 2).toUpperCase();
    } else {
      initials = 'U'; // Default for "User"
    }

    // Generate consistent color based on user name
    const generateColor = (str) => {
      const colors = [
        '#3B82F6',
        '#10B981',
        '#8B5CF6',
        '#F59E0B',
        '#EF4444',
        '#06B6D4',
        '#84CC16',
        '#EC4899',
        '#6366F1',
        '#14B8A6',
      ];

      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }

      return colors[Math.abs(hash) % colors.length];
    };

    return {
      initials,
      color: generateColor(fullName || 'User'),
      fullName: fullName || 'User',
    };
  }, [userData.firstName, userData.lastName]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageError(false);
  }, []);

  // Get the appropriate image source with priority logic
  const getProfileImageSource = () => {
    // Priority: local preview > database profilePicture
    if (localImagePreview) return localImagePreview;
    if (userData.profilePicture) return userData.profilePicture;
    return null;
  };

  // Professional profile image display component
  const ProfileImageDisplay = () => {
    const imageUrl = getProfileImageSource();

    if (imageUrl && !imageError) {
      return (
        <div className="relative h-16 w-16 bg-white dark:bg-gray-50 rounded-full shadow-sm ring-1 ring-gray-200 dark:ring-gray-300 overflow-hidden">
          <img
            src={imageUrl}
            alt={`${userDisplay.fullName} profile image`}
            className="w-full h-full object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </div>
      );
    }

    // Professional fallback - User initials badge
    return (
      <div
        className="h-16 w-16 rounded-full flex items-center justify-center text-white font-semibold shadow-sm ring-2 ring-white dark:ring-gray-800 text-lg"
        style={{ backgroundColor: userDisplay.color }}
        title={userDisplay.fullName}
      >
        {userDisplay.initials}
      </div>
    );
  };

  return (
    <div data-testid="tab-content">
      <AlertBox
        message={errorState.message}
        type={errorState.type}
        show={errorState.isError}
        hide={() => setErrorState({ isError: false, message: '', type: '' })}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div>
          <h1 className="text-2xl font-medium text-gray-700 dark:text-white">
            My Profile
          </h1>
          <p className="text-sm text-gray-500">
            Update your photo and personal details.
          </p>
        </div>
        <div className="md:col-span-2">
          <Card>
            {isDataLoading ? (
              <ProfileSkeleton />
            ) : (
              <div className="space-y-6">
                {/* Upload Preview Section - Shows when user uploads an image */}
                {localImagePreview && (
                  <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative h-8 w-8 bg-white rounded-full shadow-sm border overflow-hidden">
                          <img
                            src={localImagePreview}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                            onError={() => {}}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {userDisplay.fullName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Profile preview
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        ✓ Image uploaded
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Image Upload Section */}
                <div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <ProfileImageDisplay />
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp"
                        onChange={handleImageUpload}
                        disabled={profileUploading}
                        className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        id="profile-upload"
                      />
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, SVG, WEBP formats supported. Max size: 5MB.
                        </p>
                        {profileUploading && (
                          <div className="flex items-center text-xs text-primary">
                            <FaSpinner className="animate-spin mr-1" />
                            Uploading...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <form
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  onSubmit={handleSubmit}
                >
                  {/* Row 1: First and Last Name */}
                  <InputField
                    id="firstName"
                    value={userData.firstName}
                    onChange={handleChange}
                    label="First name"
                    placeholder="Enter first name"
                    error={validationErrors.firstName}
                    required
                  />
                  <InputField
                    id="lastName"
                    value={userData.lastName}
                    onChange={handleChange}
                    label="Last name"
                    placeholder="Enter last name"
                    error={validationErrors.lastName}
                    required
                  />
                  {/* Row 2: Email and Job Title */}
                  <InputField
                    id="email"
                    value={userData.email}
                    onChange={handleChange}
                    label="Email"
                    placeholder="Enter email address"
                    error={validationErrors.email}
                    required
                  />
                  <InputField
                    id="jobTitle"
                    value={userData.jobTitle}
                    onChange={handleChange}
                    label="Job title"
                    placeholder="Enter job title"
                    error={validationErrors.jobTitle}
                  />
                  {/* Row 3: Country */}
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
                  {/* Bio/Description (full width) using TextField */}
                  <div className="md:col-span-2">
                    <TextField
                      id="description"
                      value={userData.description}
                      onChange={handleChange}
                      label="Bio"
                      placeholder="Enter your bio"
                      error={validationErrors.description}
                    />
                  </div>
                </form>

                <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                  <Button
                    onClick={handleCancel}
                    type="button"
                    variant="outlined"
                    className="py-3 px-4 text-sm dark:bg-transparent"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    type="button"
                    disabled={isSaving}
                    variant={isSaving ? 'disabled' : 'filled'}
                    className="py-3 px-4 text-sm rounded"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
