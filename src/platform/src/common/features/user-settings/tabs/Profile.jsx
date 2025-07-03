import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import { FaSpinner } from 'react-icons/fa';
import * as Yup from 'yup';
import AlertBox from '@/components/AlertBox';
import Button from '@/components/Button';
import Card from '@/components/CardWrapper';
import InputField from '@/common/components/InputField';
import TextField from '@/common/components/TextInputField';
import CustomToast from '@/components/Toast/CustomToast';
import ProfileSkeleton from '../components/ProfileSkeleton';
import { updateUserCreationDetails, getUserDetails } from '@/core/apis/Account';
import { cloudinaryImageUpload } from '@/core/apis/Cloudinary';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { setUserInfo } from '@/lib/store/services/account/LoginSlice';
import { useChecklistSteps } from '@/features/Checklist/hooks/useChecklistSteps';
import SelectField from '@/common/components/SelectField';

// Country setup
countries.registerLocale(enLocale);
const countryObj = countries.getNames('en', { select: 'official' });
const countryOptions = Object.entries(countryObj).map(([key, value]) => ({
  label: value,
  value: key,
}));

// Validation schema
const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  jobTitle: Yup.string().optional(),
  country: Yup.string().required('Country is required'),
  description: Yup.string().optional(),
});

export default function Profile() {
  const dispatch = useDispatch();
  const { data: session, update: updateSession } = useSession();
  const { completeStep } = useChecklistSteps();

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
  const [initialUserData, setInitialUserData] = useState({}); // To store initial data for comparison
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [localImagePreview, setLocalImagePreview] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [selectedImageBlob, setSelectedImageBlob] = useState(null);

  // Parse API errors
  const parseApiErrors = (error) => {
    const parsed = {};
    if (error.response?.data?.errors) {
      error.response.data.errors.forEach((err) => {
        if (err.param) parsed[err.param] = err.message;
      });
    }
    if (error.response?.data?.message)
      return { general: error.response.data.message };
    if (error.message) return { general: error.message };
    return parsed;
  };

  // Fetch details
  const fetchUserDetails = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) return;
    setIsDataLoading(true);
    try {
      const res = await getUserDetails(userId);
      const u = res.users?.[0];
      if (res.success && u) {
        const fetchedData = {
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.email || '',
          jobTitle: u.jobTitle || '',
          country: u.country || '',
          description: u.description || '',
          profilePicture: u.profilePicture || '',
        };
        setUserData(fetchedData);
        setInitialUserData(fetchedData); // Set initial data
        setLocalImagePreview(null);
        setImageError(false);
      } else {
        throw new Error('Failed to fetch user details');
      }
    } catch (e) {
      setErrorState({ isError: true, message: e.message, type: 'error' });
    } finally {
      setIsDataLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  // Field handlers
  const handleChange = (e) => {
    const { id, value } = e.target;
    setUserData((prev) => ({ ...prev, [id]: value }));
    setValidationErrors((prev) => ({ ...prev, [id]: '' }));
  };

  const handleCountryChange = (e) => {
    const { value } = e.target;
    setUserData((prev) => ({ ...prev, country: value }));
    setValidationErrors((prev) => ({ ...prev, country: '' }));
  };

  // Cancel resets
  const handleCancel = () => {
    setUserData(initialUserData); // Reset to initial data
    setValidationErrors({});
    setErrorState({ isError: false, message: '', type: '' });
    setLocalImagePreview(null);
    setImageError(false);
  };

  // Image cropping/upload
  const cropImage = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxSize = 200;
          let { width, height } = img;
          const ratio = width / height;
          if (width > height && width > maxSize) {
            width = maxSize;
            height = Math.round(maxSize / ratio);
          } else if (height > maxSize) {
            height = maxSize;
            width = Math.round(maxSize * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL(file.type));
        };
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!allowed.includes(file.type)) {
      CustomToast({
        message: 'Invalid image type. Please use JPEG, PNG, SVG, or WebP.',
        type: 'error',
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      CustomToast({
        message: 'Image size exceeds 5MB. Please choose a smaller image.',
        type: 'error',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLocalImagePreview(reader.result);
      setImageError(false);
    };
    reader.readAsDataURL(file);

    setProfileUploading(true);
    try {
      const cropped = await cropImage(file);
      const blob = await (await fetch(cropped)).blob();
      setSelectedImageBlob(blob);
      setLocalImagePreview(cropped);
    } catch (err) {
      CustomToast({
        message: `Image processing failed: ${err.message || 'An unknown error occurred.'}`,
        type: 'error',
      });
      setLocalImagePreview(null);
      setImageError(true);
    } finally {
      setProfileUploading(false);
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault(); // Crucial: Prevent default form submission to avoid full page reload
    setIsSaving(true);

    // First, handle image upload if needed
    let updatedProfilePicture = userData.profilePicture;
    if (selectedImageBlob) {
      setProfileUploading(true);
      try {
        const form = new FormData();
        form.append('file', selectedImageBlob);
        form.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);
        form.append('folder', 'profiles');
        const uploadRes = await cloudinaryImageUpload(form);
        if (uploadRes.secure_url) {
          updatedProfilePicture = uploadRes.secure_url;
          setLocalImagePreview(uploadRes.secure_url);
          setSelectedImageBlob(null);
        } else {
          throw new Error('No URL received from Cloudinary upload.');
        }
      } catch (err) {
        CustomToast({
          message: `Image upload failed: ${err.message || 'An unknown error occurred.'}`,
          type: 'error',
        });
        setIsSaving(false);
        setProfileUploading(false);
        return;
      } finally {
        setProfileUploading(false);
      }
    }

    // Now validate the form data
    try {
      await validationSchema.validate(userData, { abortEarly: false });
      setValidationErrors({});
    } catch (err) {
      const errs = {};
      err.inner.forEach((z) => (errs[z.path] = z.message));
      setValidationErrors(errs);
      setIsSaving(false);
      CustomToast({
        message: 'Please correct the validation errors.',
        type: 'error',
      });
      return;
    }

    const userID = session.user.id;
    const fieldsToUpdate = {};

    // Only include fields that have changed
    for (const key in userData) {
      if (userData[key] !== initialUserData[key]) {
        fieldsToUpdate[key] = userData[key];
      }
    }

    // Handle profile picture specially if it's new or changed
    if (
      updatedProfilePicture &&
      updatedProfilePicture !== initialUserData.profilePicture
    ) {
      fieldsToUpdate.profilePicture = updatedProfilePicture;
    } else if (
      !updatedProfilePicture &&
      !userData.profilePicture &&
      initialUserData.profilePicture
    ) {
      // This condition handles removing a profile picture if it was previously set
      fieldsToUpdate.profilePicture = ''; // Set to empty string or null to indicate removal
    }

    // If no changes, prevent API call and inform user
    if (Object.keys(fieldsToUpdate).length === 0) {
      setIsSaving(false);
      setErrorState({
        isError: true,
        message: 'No changes to save.',
        type: 'info',
      });
      return;
    }

    try {
      await updateUserCreationDetails(fieldsToUpdate, userID);

      // Successfully updated on the backend. Now, update client-side state directly
      // and refresh session and Redux store with the *newly saved* data.
      // Do NOT refetch user details unless absolutely necessary, as it can be redundant
      // and sometimes cause a re-render glitch.
      // Instead, create the `updatedSessionUser` object from `userData` and `localImagePreview`
      // and update the session and Redux store.

      const updatedProfilePictureFinal =
        localImagePreview || userData.profilePicture;

      // Prepare the updated user object for session and Redux
      const updatedUserForClient = {
        ...session.user, // Keep existing session user properties
        ...userData, // Apply all current userData (since we've successfully saved them)
        profilePicture: updatedProfilePictureFinal, // Use the new or existing profile picture
      };

      // Update NextAuth session
      await updateSession({
        ...session,
        user: updatedUserForClient,
      });

      // Update Redux store
      dispatch(setUserInfo({ _id: userID, ...updatedUserForClient }));

      // Reset initialUserData to the newly saved state
      setInitialUserData(userData);
      setLocalImagePreview(null); // Clear local image preview after successful save

      // Complete checklist step if all required fields are present based on the updated data
      if (
        userData.firstName &&
        userData.lastName &&
        userData.email &&
        userData.country
      ) {
        completeStep(2);
      }

      setErrorState({
        isError: true,
        message: 'Your profile has been updated successfully!',
        type: 'success',
      });
    } catch (err) {
      const apiErrs = parseApiErrors(err);
      if (Object.keys(apiErrs).length && !apiErrs.general) {
        setValidationErrors((prev) => ({ ...prev, ...apiErrs }));
        setErrorState({
          isError: true,
          message: 'Please fix the errors and try again.',
          type: 'error',
        });
      } else {
        setErrorState({
          isError: true,
          message: apiErrs.general || `Failed to save profile: ${err.message}`,
          type: 'error',
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Initials fallback
  const userDisplay = useMemo(() => {
    const fn = userData.firstName || '';
    const ln = userData.lastName || '';
    const full = (fn + ' ' + ln).trim() || 'User';
    let initials =
      fn && ln
        ? fn[0] + ln[0]
        : fn
          ? fn.slice(0, 2)
          : ln
            ? ln.slice(0, 2)
            : 'U';
    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
    let hash = 0;
    for (let c of full) hash = c.charCodeAt(0) + (hash << 5) - hash;
    return {
      initials: initials.toUpperCase(),
      color: colors[Math.abs(hash) % colors.length],
      fullName: full,
    };
  }, [userData.firstName, userData.lastName]);

  const renderProfileImage = () => {
    const url = localImagePreview || userData.profilePicture;
    if (url && !imageError)
      return (
        <img
          src={url}
          alt={userDisplay.fullName}
          className="w-16 h-16 rounded-full object-cover"
          onError={() => setImageError(true)}
        />
      );
    return (
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-white"
        style={{ backgroundColor: userDisplay.color }}
      >
        {userDisplay.initials}
      </div>
    );
  };

  const hasChanges = useMemo(() => {
    const dataChanged =
      JSON.stringify(userData) !== JSON.stringify(initialUserData);
    const imageChanged =
      localImagePreview !== null &&
      localImagePreview !== initialUserData.profilePicture;
    return dataChanged || imageChanged;
  }, [userData, initialUserData, localImagePreview]);

  return (
    <div data-testid="tab-content">
      <AlertBox
        message={errorState.message}
        type={errorState.type}
        show={errorState.isError}
        hide={() => setErrorState({ isError: false, message: '', type: '' })}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h1 className="text-2xl font-medium">My Profile</h1>
          <p className="text-sm text-gray-500">Update your photo & details</p>
        </div>
        <div className="md:col-span-2">
          <Card>
            {isDataLoading ? (
              <ProfileSkeleton />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center space-x-4">
                  {renderProfileImage()}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={profileUploading}
                      className="file:mr-4 file:py-2 file:px-4 file:border file:rounded file:text-sm file:bg-gray-100"
                    />
                    {profileUploading && (
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <FaSpinner className="animate-spin mr-1" />
                        Uploading…
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    id="firstName"
                    value={userData.firstName}
                    onChange={handleChange}
                    label="First name"
                    error={validationErrors.firstName}
                    required
                  />
                  <InputField
                    id="lastName"
                    value={userData.lastName}
                    onChange={handleChange}
                    label="Last name"
                    error={validationErrors.lastName}
                    required
                  />
                  <InputField
                    id="email"
                    value={userData.email}
                    onChange={handleChange}
                    label="Email"
                    error={validationErrors.email}
                    required
                    disabled // Email is usually not editable via profile settings
                  />
                  <InputField
                    id="jobTitle"
                    value={userData.jobTitle}
                    onChange={handleChange}
                    label="Job title"
                    error={validationErrors.jobTitle}
                  />
                  <SelectField
                    label="Country"
                    required
                    value={userData.country}
                    onChange={handleCountryChange}
                    error={validationErrors.country}
                  >
                    <option value="">Select a country</option>
                    {countryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectField>
                  <div className="md:col-span-2">
                    <TextField
                      id="description"
                      value={userData.description}
                      onChange={handleChange}
                      label="Bio"
                      error={validationErrors.description}
                      rows={4} // Give more space for bio
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isSaving || !hasChanges}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving || !hasChanges}>
                    {isSaving ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" /> Saving…
                      </>
                    ) : (
                      'Save'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
