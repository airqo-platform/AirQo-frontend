import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import * as Yup from 'yup';
import Modal from '@/components/Modal/Modal';
import AlertBox from '@/components/AlertBox';
import Button from '@/components/Button';
import Card from '@/components/CardWrapper';
import InputField from '@/common/components/InputField';
import SelectDropdown from '@/components/SelectDropdown';
import TextField from '@/components/TextInputField';
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
  const [updatedProfilePicture, setUpdatedProfilePicture] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [showDeleteProfileModal, setShowDeleteProfileModal] = useState(false);
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

    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [session?.user?.id]);

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
    setIsLoading(true);

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
      setIsLoading(false);
      return;
    }

    if (!session?.user?.id) {
      setErrorState({
        isError: true,
        message: 'No valid user session found',
        type: 'error',
      });
      setIsLoading(false);
      return;
    }

    const userID = session.user.id;

    // Create a cleaned version of userData without empty profilePicture
    const dataToUpdate = { ...userData };
    if (!dataToUpdate.profilePicture) {
      delete dataToUpdate.profilePicture;
    }
    try {
      await updateUserCreationDetails(dataToUpdate, userID);
      const res = await getUserDetails(userID);
      const updatedUser = res?.users?.[0];
      if (!updatedUser) throw new Error('User details not updated');
      const updatedData = { _id: userID, ...updatedUser };

      // Update the session with new user data
      await updateSession({
        user: {
          ...session.user,
          ...updatedData,
        },
      });

      dispatch(setUserInfo(updatedData));
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
      setIsLoading(false);
    }
  };
  // Handler for cancel button
  const handleCancel = () => {
    // Reset form to initial state
    fetchUserDetails();
    setUpdatedProfilePicture('');
    setValidationErrors({});
    setErrorState({ isError: false, message: '', type: '' });
  };

  const cropImage = () =>
    new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (event) => {
        const file = event.target.files[0];
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
      };
      input.click();
    });

  const handleAvatarClick = () => {
    cropImage()
      .then((croppedUrl) => {
        setUpdatedProfilePicture(croppedUrl);
        setUserData({ ...userData, profilePicture: croppedUrl });
      })
      .catch(() =>
        setErrorState({
          isError: true,
          message: 'Something went wrong',
          type: 'error',
        }),
      );
  };

  const handleProfileImageUpdate = async () => {
    if (!updatedProfilePicture) return;

    const formData = new FormData();
    formData.append('file', updatedProfilePicture);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);
    formData.append('folder', 'profiles');
    setProfileUploading(true);

    try {
      const responseData = await cloudinaryImageUpload(formData);
      const secureUrl = responseData.secure_url;

      // Only update if we have a valid URL
      if (secureUrl) {
        setUserData((prev) => ({
          ...prev,
          profilePicture: secureUrl,
        }));

        const userID = session?.user?.id;
        if (!userID) throw new Error('No valid user ID found');

        // Only send profile picture to API if it's not empty
        await updateUserCreationDetails({ profilePicture: secureUrl }, userID);

        const updatedData = {
          _id: userID,
          ...userData,
          profilePicture: secureUrl,
        };
        // Update session with the new profile picture
        await updateSession({
          user: {
            ...session.user,
            profilePicture: secureUrl,
          },
        });

        dispatch(setUserInfo(updatedData));

        setErrorState({
          isError: true,
          message: 'Profile image successfully added',
          type: 'success',
        });
      }

      setUpdatedProfilePicture('');
      setProfileUploading(false);
    } catch (err) {
      setUpdatedProfilePicture('');
      setProfileUploading(false);
      setErrorState({ isError: true, message: err.message, type: 'error' });
    }
  };

  const deleteProfileImage = async () => {
    setUpdatedProfilePicture('');
    setUserData((prev) => ({ ...prev, profilePicture: '' }));

    const userID = session?.user?.id;
    if (!userID) {
      setErrorState({
        isError: true,
        message: 'No valid user ID found',
        type: 'error',
      });
      return;
    }

    try {
      await updateUserCreationDetails({ profilePicture: '' }, userID);

      // Update local user data
      const updatedUserData = { ...userData };
      delete updatedUserData.profilePicture; // Remove profile picture before storing

      const updatedUser = {
        _id: userID,
        ...updatedUserData,
        profilePicture: '', // Explicitly set to empty
      }; // Update session with the profile picture removed
      await updateSession({
        user: {
          ...session.user,
          profilePicture: '',
        },
      });

      dispatch(setUserInfo(updatedUser));

      setShowDeleteProfileModal(false);
      setErrorState({
        isError: true,
        message: 'Profile image successfully deleted',
        type: 'success',
      });
    } catch (error) {
      setErrorState({ isError: true, message: error.message, type: 'error' });
    }
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
            {isLoading ? (
              <ProfileSkeleton />
            ) : (
              <>
                <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                  <div
                    className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex justify-center items-center cursor-pointer"
                    onClick={handleAvatarClick}
                    title="Tap to change profile image"
                  >
                    {userData.profilePicture ? (
                      <img
                        src={userData.profilePicture}
                        alt={`${userData.firstName} ${userData.lastName} profile image`}
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
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => setShowDeleteProfileModal(true)}
                      disabled={!userData.profilePicture}
                      className="text-sm font-medium text-gray-600"
                    >
                      Delete
                    </Button>
                    <Button
                      onClick={handleProfileImageUpdate}
                      disabled={!updatedProfilePicture}
                      variant={updatedProfilePicture ? 'outlined' : 'disabled'}
                      className="text-sm font-medium"
                    >
                      {updatedProfilePicture && !profileUploading
                        ? 'Save photo'
                        : profileUploading
                          ? 'Uploading...'
                          : 'Update'}
                    </Button>
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
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    type="button"
                    disabled={isLoading}
                    variant={isLoading ? 'disabled' : 'filled'}
                    className="py-3 px-4 text-sm rounded"
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
      <Modal
        display={showDeleteProfileModal}
        handleConfirm={deleteProfileImage}
        closeModal={() => setShowDeleteProfileModal(false)}
        description="Are you sure you want to delete your profile image?"
        confirmButton="Delete"
      />
    </div>
  );
};

export default Profile;
