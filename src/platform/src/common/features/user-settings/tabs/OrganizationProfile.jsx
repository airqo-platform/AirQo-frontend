import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import * as Yup from 'yup';
import Modal from '@/components/Modal/Modal';
import AlertBox from '@/components/AlertBox';
import Button from '@/components/Button';
import Card from '@/components/CardWrapper';
import InputField from '@/common/components/InputField';
import TextField from '@/components/TextInputField';
import SelectDropdown from '@/components/SelectDropdown';
import { fetchGroupDetails } from '@/lib/store/services/groups';
import { updateGroupDetailsApi } from '@/core/apis/Account';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { cloudinaryImageUpload } from '@/core/apis/Cloudinary';
import timeZones from 'timezones.json';

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

const industryOptions = [
  'Textiles',
  'Transport',
  'Healthcare',
  'Manufacturing',
  'Agriculture',
  'Information Technology',
  'Policy & Government',
  'Education & Research',
  'Business',
  'Mining',
  'Hospitality',
  'Food and Catering',
  'Media & Journalism',
].map((industry) => ({
  label: industry,
  value: industry,
}));

// Yup validation schema for organization details
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

const OrganizationProfile = () => {
  const dispatch = useDispatch();
  const [errorState, setErrorState] = useState({
    isError: false,
    message: '',
    type: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [orgData, setOrgData] = useState({
    grp_title: '',
    grp_website: '',
    grp_industry: '',
    grp_description: '',
    grp_country: '',
    grp_timezone: '',
    grp_image: '',
  });
  const [updatedProfilePicture, setUpdatedProfilePicture] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [showDeleteProfileModal, setShowDeleteProfileModal] = useState(false);
  const orgInfo = useSelector((state) => state.groups.groupDetails);
  const { data: session } = useSession();

  // Fetch group info on mount using active group ID from session
  useEffect(() => {
    setIsLoading(true);
    const activeGroupId = session?.user?.activeGroup?._id;
    if (activeGroupId) {
      dispatch(fetchGroupDetails(activeGroupId));
    }
    setIsLoading(false);
  }, [dispatch, session]);

  // When orgInfo is updated, populate local state
  useEffect(() => {
    if (orgInfo) {
      setOrgData({
        grp_title: orgInfo.grp_title || '',
        grp_website: orgInfo.grp_website || '',
        grp_industry: orgInfo.grp_industry || '',
        grp_description: orgInfo.grp_description || '',
        grp_country: orgInfo.grp_country || '',
        grp_timezone: orgInfo.grp_timezone || '',
        grp_image: orgInfo.grp_image || '',
      });
    }
  }, [orgInfo]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setOrgData({ ...orgData, [id]: value });
    // Clear field-specific error when user types
    if (validationErrors[id]) {
      setValidationErrors({ ...validationErrors, [id]: '' });
    }
  };

  // Handlers for SelectDropdown fields
  const handleCountryChange = (option) => {
    setOrgData({ ...orgData, grp_country: option.value });
    if (validationErrors.grp_country) {
      setValidationErrors({ ...validationErrors, grp_country: '' });
    }
  };

  const handleTimezoneChange = (option) => {
    setOrgData({ ...orgData, grp_timezone: option.value });
    if (validationErrors.grp_timezone) {
      setValidationErrors({ ...validationErrors, grp_timezone: '' });
    }
  };

  const handleIndustryChange = (option) => {
    setOrgData({ ...orgData, grp_industry: option.value });
    // Clear error if exists
    if (validationErrors.grp_industry) {
      setValidationErrors({ ...validationErrors, grp_industry: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Validate organization data using Yup schema
    try {
      await validationSchema.validate(orgData, { abortEarly: false });
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

    const activeGroupId = session?.user?.activeGroup?._id;

    if (!activeGroupId) {
      setIsLoading(false);
      setErrorState({
        isError: true,
        message: 'No active group found',
        type: 'error',
      });
      return;
    }

    try {
      await updateGroupDetailsApi(activeGroupId, orgData);
      dispatch(fetchGroupDetails(activeGroupId));
      setErrorState({
        isError: true,
        message: 'Organization details successfully updated',
        type: 'success',
      });
    } catch (error) {
      setErrorState({ isError: true, message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (orgInfo) {
      setOrgData({
        grp_title: orgInfo.grp_title || '',
        grp_website: orgInfo.grp_website || '',
        grp_industry: orgInfo.grp_industry || '',
        grp_description: orgInfo.grp_description || '',
        grp_country: orgInfo.grp_country || '',
        grp_timezone: orgInfo.grp_timezone || '',
        grp_image: orgInfo.grp_image || '',
      });
    }
    setValidationErrors({});
  };

  // Crop image function using window.Image to satisfy ESLint
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
            let width = img.width;
            let height = img.height;
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
        setOrgData({ ...orgData, grp_image: croppedUrl });
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
    formData.append('folder', 'organization_profiles');
    setProfileUploading(true);
    try {
      const responseData = await cloudinaryImageUpload(formData);
      setOrgData((prev) => ({ ...prev, grp_image: responseData.secure_url }));
      const activeGroupId = session?.user?.activeGroup?._id;
      if (!activeGroupId) {
        setProfileUploading(false);
        setErrorState({
          isError: true,
          message: 'No valid group ID found.',
          type: 'error',
        });
        return;
      }
      await updateGroupDetailsApi(activeGroupId, {
        grp_image: responseData.secure_url,
      });
      dispatch(fetchGroupDetails(activeGroupId));
      setErrorState({
        isError: true,
        message: 'Organization image successfully added',
        type: 'success',
      });
      setUpdatedProfilePicture('');
    } catch (error) {
      // Error uploading/updating organization image
      setUpdatedProfilePicture('');
      setErrorState({ isError: true, message: error.message, type: 'error' });
    } finally {
      setProfileUploading(false);
    }
  };
  const deleteProfileImage = () => {
    setUpdatedProfilePicture('');
    setOrgData((prev) => ({ ...prev, grp_image: '' }));
    const activeGroupId = session?.user?.activeGroup?._id;
    if (!activeGroupId) {
      setErrorState({
        isError: true,
        message: 'No valid group ID found.',
        type: 'error',
      });
      return;
    }
    updateGroupDetailsApi(activeGroupId, { grp_image: '' })
      .then(() => {
        dispatch(fetchGroupDetails(activeGroupId));
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
    orgData &&
    orgData.grp_title && (
      <div>
        <AlertBox
          message={errorState.message}
          type={errorState.type}
          show={errorState.isError}
          hide={() => setErrorState({ isError: false, message: '', type: '' })}
        />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-white">
              Organization information
            </h3>
            <p className="text-sm text-gray-500">
              Update your organization details here.
            </p>
          </div>
          <div className="w-full mb-12">
            <Card>
              {/* Avatar & Upload Controls */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex justify-center items-center cursor-pointer"
                    onClick={handleAvatarClick}
                    title="Tap to change profile image"
                  >
                    {orgData.grp_image ? (
                      <img
                        src={orgData.grp_image}
                        alt={`${orgData.grp_title} profile image`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <h3 className="text-2xl font-medium text-primary uppercase">
                        {orgData.grp_title.slice(0, 2)}
                      </h3>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Recommended format: SVG with transparent background
                  </p>
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
                {/* Row 1: Organization Name */}
                <InputField
                  id="grp_title"
                  value={orgData.grp_title}
                  onChange={handleChange}
                  label="Organization name"
                  placeholder="Enter organization name"
                  error={validationErrors.grp_title}
                />

                {/* Row 2: Website with Globe Icon */}
                <InputField
                  id="grp_website"
                  value={orgData.grp_website}
                  onChange={handleChange}
                  label="Website"
                  placeholder="Enter website"
                  error={validationErrors.grp_website}
                />

                {/* Row 3: Industry (SelectDropdown) */}
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    Industry
                  </label>
                  <SelectDropdown
                    items={industryOptions}
                    selected={
                      industryOptions.find(
                        (option) => option.value === orgData.grp_industry,
                      ) || null
                    }
                    onChange={handleIndustryChange}
                    placeholder="Select an industry"
                    error={validationErrors.grp_industry}
                  />
                </div>

                {/* Row 4: About / Description using TextField */}
                <div className="md:col-span-2">
                  <TextField
                    id="grp_description"
                    value={orgData.grp_description}
                    onChange={handleChange}
                    label="About"
                    placeholder="Enter organization description"
                    error={validationErrors.grp_description}
                    required
                  />
                </div>

                {/* Row 5: Country (SelectDropdown) */}
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    Country
                  </label>
                  <SelectDropdown
                    items={countryOptions}
                    selected={
                      countryOptions.find(
                        (option) => option.value === orgData.grp_country,
                      ) || null
                    }
                    onChange={handleCountryChange}
                    placeholder="Select a country"
                    error={validationErrors.grp_country}
                  />
                </div>

                {/* Row 6: Timezone (SelectDropdown) */}
                <div className="relative flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Timezone
                  </label>
                  <SelectDropdown
                    items={timeZonesArr}
                    selected={
                      timeZonesArr.find(
                        (option) => option.value === orgData.grp_timezone,
                      ) || null
                    }
                    onChange={handleTimezoneChange}
                    placeholder="Select a timezone"
                    error={validationErrors.grp_timezone}
                    listClassName="pl-10"
                  />
                </div>
              </form>
              <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                <Button
                  className="dark:bg-transparent"
                  onClick={handleCancel}
                  type="button"
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  type="button"
                  disabled={isLoading}
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
          description="Are you sure you want to delete the organization profile image?"
          confirmButton="Delete"
        />
      </div>
    )
  );
};

export default OrganizationProfile;
