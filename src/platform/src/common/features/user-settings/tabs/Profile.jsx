import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [localImagePreview, setLocalImagePreview] = useState(null);
  const [imageError, setImageError] = useState(false);

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
        setUserData({
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.email || '',
          jobTitle: u.jobTitle || '',
          country: u.country || '',
          description: u.description || '',
          profilePicture: u.profilePicture || '',
        });
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
  const handleCountryChange = (option) => {
    setUserData((prev) => ({ ...prev, country: option.value }));
    setValidationErrors((prev) => ({ ...prev, country: '' }));
  };

  // Cancel resets
  const handleCancel = () => {
    fetchUserDetails();
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
    if (!allowed.includes(file.type))
      return CustomToast({ message: 'Invalid image type', type: 'error' });
    if (file.size > 5 * 1024 * 1024)
      return CustomToast({ message: 'Max size 5MB', type: 'error' });
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
      const form = new FormData();
      form.append('file', blob);
      form.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);
      form.append('folder', 'profiles');
      const uploadRes = await cloudinaryImageUpload(form);
      if (uploadRes.secure_url) {
        setLocalImagePreview(uploadRes.secure_url);
        CustomToast({
          message: 'Image uploaded! Click Save.',
          type: 'success',
        });
      } else throw new Error('No URL from Cloudinary');
    } catch {
      CustomToast({ message: 'Upload failed', type: 'error' });
    } finally {
      setProfileUploading(false);
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await validationSchema.validate(userData, { abortEarly: false });
      setValidationErrors({});
    } catch (err) {
      const errs = {};
      err.inner.forEach((z) => (errs[z.path] = z.message));
      setValidationErrors(errs);
      setIsSaving(false);
      return;
    }
    const userID = session.user.id;
    const payload = {
      ...userData,
      profilePicture: localImagePreview || userData.profilePicture,
    };
    if (!payload.profilePicture) delete payload.profilePicture;
    try {
      await updateUserCreationDetails(payload, userID);
      await fetchUserDetails();
      const fresh = (await getUserDetails(userID)).users?.[0];
      if (fresh) {
        await updateSession({
          ...session,
          user: {
            ...session.user,
            firstName: fresh.firstName,
            lastName: fresh.lastName,
            email: fresh.email,
            profilePicture: localImagePreview || fresh.profilePicture,
          },
        });
        dispatch(setUserInfo({ _id: userID, ...fresh }));
      }
      if (
        userData.firstName &&
        userData.lastName &&
        userData.email &&
        userData.country
      )
        completeStep(2);
      setLocalImagePreview(null);
      setErrorState({
        isError: true,
        message: 'Saved successfully',
        type: 'success',
      });
    } catch (err) {
      const apiErrs = parseApiErrors(err);
      if (Object.keys(apiErrs).length && !apiErrs.general) {
        setValidationErrors((prev) => ({ ...prev, ...apiErrs }));
        setErrorState({
          isError: true,
          message: 'Fix errors and retry',
          type: 'error',
        });
      } else
        setErrorState({
          isError: true,
          message: apiErrs.general || err.message,
          type: 'error',
        });
    } finally {
      setIsSaving(false);
    }
  };

  // Initials fallback
  const userDisplay = useMemo(() => {
    const fn = userData.firstName || '',
      ln = userData.lastName || '';
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
                      <div className="flex items-center mt-1 text-sm">
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
                  />
                  <InputField
                    id="jobTitle"
                    value={userData.jobTitle}
                    onChange={handleChange}
                    label="Job title"
                    error={validationErrors.jobTitle}
                  />
                  <div>
                    <label className="block mb-1">Country *</label>
                    <SelectDropdown
                      items={countryOptions}
                      selected={
                        countryOptions.find(
                          (o) => o.value === userData.country,
                        ) || null
                      }
                      onChange={handleCountryChange}
                    />
                    {validationErrors.country && (
                      <p className="text-red-600 text-sm">
                        {validationErrors.country}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <TextField
                      id="description"
                      value={userData.description}
                      onChange={handleChange}
                      label="Bio"
                      error={validationErrors.description}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving…' : 'Save'}
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
