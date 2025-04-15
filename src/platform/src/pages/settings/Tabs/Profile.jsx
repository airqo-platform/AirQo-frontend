import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import Modal from '@/components/Modal/Modal';
import AlertBox from '@/components/AlertBox';
import Button from '@/components/Button';
import Card from '@/components/CardWrapper';
import InputField from '@/components/InputField';
import SelectDropdown from '@/components/SelectDropdown';
import TextField from '@/components/TextInputField';
import { updateUserCreationDetails, getUserDetails } from '@/core/apis/Account';
import { cloudinaryImageUpload } from '@/core/apis/Cloudinary';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import timeZones from 'timezones.json';
import { setUserInfo } from '@/lib/store/services/account/LoginSlice';
import { useChecklistSteps } from '@/features/Checklist/hooks/useChecklistSteps';

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

// Yup validation schema
const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  jobTitle: Yup.string().required('Job title is required'),
  country: Yup.string().required('Country is required'),
  timezone: Yup.string().required('Timezone is required'),
  description: Yup.string().required('Bio is required'),
});

const Profile = () => {
  const [errorState, setErrorState] = useState({
    isError: false,
    message: '',
    type: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const dispatch = useDispatch();
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
  const [updatedProfilePicture, setUpdatedProfilePicture] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [showDeleteProfileModal, setShowDeleteProfileModal] = useState(false);
  const userInfo = useSelector((state) => state.login.userInfo);
  const userToken =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const { completeStep } = useChecklistSteps();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedUser = localStorage.getItem('loggedUser');
    let parsedUser = null;
    try {
      parsedUser =
        storedUser && storedUser !== 'undefined' && JSON.parse(storedUser);
    } catch (err) {
      console.error('Error parsing loggedUser:', err);
    }
    if (parsedUser) {
      if (!userInfo) dispatch(setUserInfo(parsedUser));
      setUserData({
        firstName: parsedUser.firstName || '',
        lastName: parsedUser.lastName || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
        jobTitle: parsedUser.jobTitle || '',
        country: parsedUser.country || '',
        timezone: parsedUser.timezone || '',
        description: parsedUser.description || '',
        profilePicture: parsedUser.profilePicture || '',
      });
    } else {
      setErrorState({
        isError: true,
        message: 'No user details found!',
        type: 'error',
      });
    }
  }, [userInfo, dispatch]);

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

  const handleTimezoneChange = (option) => {
    setUserData({ ...userData, timezone: option.value });
    if (validationErrors.timezone) {
      setValidationErrors({ ...validationErrors, timezone: '' });
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

    let loggedUser;
    try {
      loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
    } catch (err) {
      console.error('Error parsing loggedUser:', err);
      setIsLoading(false);
      return;
    }
    if (!loggedUser) return setIsLoading(false);
    const userID = loggedUser._id;
    try {
      await updateUserCreationDetails(userData, userID);
      const res = await getUserDetails(userID, userToken);
      const updatedUser = res?.users?.[0];
      if (!updatedUser) throw new Error('User details not updated');
      const updatedData = { _id: userID, ...updatedUser };
      localStorage.setItem('loggedUser', JSON.stringify(updatedData));
      dispatch(setUserInfo(updatedData));
      if (
        userData.firstName &&
        userData.lastName &&
        userData.email &&
        userData.country &&
        userData.timezone
      ) {
        completeStep(2);
      }
      setErrorState({
        isError: true,
        message: 'User details successfully updated',
        type: 'success',
      });
    } catch (error) {
      console.error('Error updating details:', error);
      setErrorState({ isError: true, message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    let parsedUser;
    try {
      parsedUser = JSON.parse(localStorage.getItem('loggedUser'));
    } catch (err) {
      console.error('Error parsing loggedUser:', err);
    }
    if (!parsedUser) {
      setUserData({
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
      return;
    }
    setUserData({
      firstName: parsedUser.firstName || '',
      lastName: parsedUser.lastName || '',
      email: parsedUser.email || '',
      phone: parsedUser.phone || '',
      jobTitle: parsedUser.jobTitle || '',
      country: parsedUser.country || '',
      timezone: parsedUser.timezone || '',
      description: parsedUser.description || '',
      profilePicture: parsedUser.profilePicture || '',
    });
    // Clear any validation errors
    setValidationErrors({});
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
      setUserData((prev) => ({
        ...prev,
        profilePicture: responseData.secure_url,
      }));
      const userID = JSON.parse(localStorage.getItem('loggedUser'))?._id;
      if (!userID) throw new Error('No valid user ID found');
      await updateUserCreationDetails(
        { profilePicture: responseData.secure_url },
        userID,
      );
      const updatedData = {
        _id: userID,
        ...userData,
        profilePicture: responseData.secure_url,
      };
      localStorage.setItem('loggedUser', JSON.stringify(updatedData));
      dispatch(setUserInfo(updatedData));
      setErrorState({
        isError: true,
        message: 'Profile image successfully added',
        type: 'success',
      });
      setUpdatedProfilePicture('');
      setProfileUploading(false);
    } catch (err) {
      console.error('Error uploading profile image:', err);
      setUpdatedProfilePicture('');
      setProfileUploading(false);
      setErrorState({ isError: true, message: err.message, type: 'error' });
    }
  };

  const deleteProfileImage = () => {
    setUpdatedProfilePicture('');
    setUserData((prev) => ({ ...prev, profilePicture: '' }));
    const userID = JSON.parse(localStorage.getItem('loggedUser'))?._id;
    if (!userID) {
      setErrorState({
        isError: true,
        message: 'No valid user ID found',
        type: 'error',
      });
      return;
    }
    updateUserCreationDetails({ profilePicture: '' }, userID)
      .then(() => {
        const updatedData = { ...userData, profilePicture: '', _id: userID };
        localStorage.setItem('loggedUser', JSON.stringify(updatedData));
        dispatch(setUserInfo(updatedData));
        setShowDeleteProfileModal(false);
        setErrorState({
          isError: true,
          message: 'Profile image successfully deleted',
          type: 'success',
        });
      })
      .catch((error) => {
        setErrorState({ isError: true, message: error.message, type: 'error' });
      });
  };

  return (
    <div className="px-4 md:px-0 py-6">
      <AlertBox
        message={errorState.message}
        type={errorState.type}
        show={errorState.isError}
        hide={() => setErrorState({ isError: false, message: '', type: '' })}
      />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-white">
            Personal information
          </h3>
          <p className="text-sm text-gray-500">
            Update your photo and personal details.
          </p>
        </div>
        <div className="w-full mb-12">
          <Card rounded radius="rounded-lg">
            <div className="p-6">
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
                      {userData.firstName[0] + userData.lastName[0]}
                    </h3>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={deleteProfileImage}
                    className="text-sm font-medium text-gray-600"
                  >
                    Delete
                  </Button>
                  <Button
                    onClick={handleProfileImageUpdate}
                    disabled={!updatedProfilePicture}
                    className={`text-sm font-medium ${
                      updatedProfilePicture
                        ? 'text-blue-600 bg-blue-50 rounded'
                        : 'text-gray-600'
                    }`}
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
                />
                <InputField
                  id="lastName"
                  value={userData.lastName}
                  onChange={handleChange}
                  label="Last name"
                  placeholder="Enter last name"
                  error={validationErrors.lastName}
                />

                {/* Row 2: Email and Phone */}
                <InputField
                  id="email"
                  value={userData.email}
                  onChange={handleChange}
                  label="Email"
                  placeholder="Enter email address"
                  error={validationErrors.email}
                />
                <InputField
                  id="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  label="Phone"
                  placeholder="Enter phone number"
                  error={validationErrors.phone}
                />

                {/* Row 3: Job Title and Country */}
                <InputField
                  id="jobTitle"
                  value={userData.jobTitle}
                  onChange={handleChange}
                  label="Job title"
                  placeholder="Enter job title"
                  error={validationErrors.jobTitle}
                />
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    Country
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
                  />
                </div>

                {/* Row 4: Timezone */}
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

                {/* Row 5: Bio/Description (full width) using TextField */}
                <div className="md:col-span-2">
                  <TextField
                    id="description"
                    value={userData.description}
                    onChange={handleChange}
                    label="Bio"
                    placeholder="Enter your bio"
                    error={validationErrors.description}
                    required
                  />
                </div>
              </form>
            </div>
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
                className="py-3 px-4 text-sm rounded bg-blue-600 text-white"
              >
                {isLoading ? 'Loading...' : 'Save'}
              </Button>
            </div>
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
