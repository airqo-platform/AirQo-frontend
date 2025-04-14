import BorderlessContentBox from '@/components/Layout/borderless_content_box';
import ContentBox from '@/components/Layout/content_box';
import Button from '@/components/Button';
import Modal from '@/components/Modal/Modal';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserCreationDetails, getUserDetails } from '@/core/apis/Account';
import ClockIcon from '@/icons/Settings/clock.svg';
import AlertBox from '@/components/AlertBox';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { cloudinaryImageUpload } from '@/core/apis/Cloudinary';
import timeZones from 'timezones.json';
import TextInputField from '@/components/TextInputField';
import { setUserInfo } from '@/lib/store/services/account/LoginSlice';

import { useChecklistSteps } from '@/features/Checklist/hooks/useChecklistSteps';
countries.registerLocale(enLocale);

const countryObj = countries.getNames('en', { select: 'official' });

const countryArr = Object.entries(countryObj).map(([key, value]) => ({
  label: value,
  value: key,
}));

const countryOptions = countryArr.map(({ label, value }) => ({
  label: label,
  value: value,
}));

const retrieveCountryCode = (countryName) => {
  for (let i = 0; i < countryArr.length; i++) {
    if (countryArr[i].label === countryName) {
      return countryArr[i];
    }
  }
  return '';
};

const timeZonesArr = timeZones.map((timeZone) => ({
  label: timeZone.text,
  value: timeZone.text,
}));

retrieveCountryCode('Uganda');

const Profile = () => {
  const [isError, setIsError] = useState({
    isError: false,
    message: '',
    type: '',
  });
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
  const [isLoading, setLoading] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [showDeleteProfileModal, setShowDeleteProfileModal] = useState(false);
  const userInfo = useSelector((state) => state.login.userInfo);
  const userToken = localStorage.getItem('token');

  const { completeStep } = useChecklistSteps();

  useEffect(() => {
    // Prevent running on the server
    if (typeof window === 'undefined') return;

    // Attempt to retrieve the "loggedUser" from localStorage
    const storedUser = localStorage.getItem('loggedUser');
    let parsedUser = null;

    if (storedUser && storedUser !== 'undefined') {
      try {
        parsedUser = JSON.parse(storedUser);
      } catch (error) {
        console.error('Error parsing "loggedUser" from localStorage:', error);
      }
    }

    // If parsing succeeded and we have user data
    if (parsedUser) {
      if (!userInfo) {
        dispatch(setUserInfo(parsedUser));
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
    } else {
      setIsError({
        isError: true,
        message: 'Hmm, no user details found!',
        type: 'error',
      });
    }
  }, [userInfo, dispatch]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Safely parse the "loggedUser" from localStorage
    let loggedUser = null;
    const storedUser = localStorage.getItem('loggedUser');

    if (storedUser && storedUser !== 'undefined') {
      try {
        loggedUser = JSON.parse(storedUser);
      } catch (error) {
        console.error('Error parsing "loggedUser" from localStorage:', error);

        setLoading(false);
        return;
      }
    }

    // If we still don't have a valid user, stop here
    if (!loggedUser) {
      setLoading(false);
      return;
    }

    const { _id: userID } = loggedUser;

    try {
      // 1. Update user creation details
      await updateUserCreationDetails(userData, userID);

      // 2. Retrieve updated user info from the server
      const res = await getUserDetails(userID, userToken);
      const updatedUser = res?.users?.[0];

      if (!updatedUser) {
        throw new Error('User details not updated');
      }

      // 3. Merge the updated user info with the ID
      const updatedData = { _id: userID, ...updatedUser };

      // 4. Store the updated user data in localStorage and Redux
      localStorage.setItem('loggedUser', JSON.stringify(updatedData));
      dispatch(setUserInfo(updatedData));

      // 5. Optional: Check if certain fields are present for profile completion
      if (
        userData.firstName &&
        userData.lastName &&
        userData.email &&
        userData.country &&
        userData.timezone
      ) {
        completeStep(2);
      }

      // 6. Show success message
      setIsError({
        isError: true,
        message: 'User details successfully updated',
        type: 'success',
      });
    } catch (error) {
      console.error(`Error updating user details: ${error}`);
      setIsError({
        isError: true,
        message: error.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Safely parse the "loggedUser" from localStorage
    let parsedUser = null;
    const storedUser = localStorage.getItem('loggedUser');
    if (storedUser && storedUser !== 'undefined') {
      try {
        parsedUser = JSON.parse(storedUser);
      } catch (error) {
        console.error('Error parsing "loggedUser" from localStorage:', error);
      }
    }

    // If no valid user, reset to empty fields or handle accordingly
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

    // Update local state with user data
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
  };

  const cropImage = () => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = (event) => {
        const file = event.target.files[0];
        const img = document.createElement('img');
        const reader = new FileReader();

        reader.onload = function (e) {
          img.onload = function () {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const aspectRatio = img.width / img.height;
            const maxSize = 200;

            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxSize) {
                height = Math.round(maxSize / aspectRatio);
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width = Math.round(maxSize * aspectRatio);
                height = maxSize;
              }
            }

            canvas.width = width;
            canvas.height = height;
            context.drawImage(img, 0, 0, width, height);

            const croppedUrl = canvas.toDataURL(file.type);
            resolve(croppedUrl);
          };

          img.src = e.target.result;
        };

        reader.onerror = (error) => {
          reject(error);
        };

        reader.readAsDataURL(file);
      };

      input.click();
    });
  };

  const handleAvatarClick = () => {
    cropImage()
      .then((croppedUrl) => {
        setUpdatedProfilePicture(croppedUrl);
        setUserData({ ...userData, profilePicture: croppedUrl });
      })
      .catch(() => {
        setIsError({
          isError: true,
          message: 'Something went wrong',
          type: 'error',
        });
      });
  };

  const handleProfileImageUpdate = async () => {
    if (!updatedProfilePicture) return;

    const formData = new FormData();
    formData.append('file', updatedProfilePicture);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);
    formData.append('folder', 'profiles');

    setProfileUploading(true);

    try {
      // 1. Upload to Cloudinary
      const responseData = await cloudinaryImageUpload(formData);

      // 2. Update local userData state
      setUserData((prev) => ({
        ...prev,
        profilePicture: responseData.secure_url,
      }));

      // 3. Safely parse "loggedUser" for user ID
      let userID = null;
      const storedUser = localStorage.getItem('loggedUser');
      if (storedUser && storedUser !== 'undefined') {
        try {
          const parsedUser = JSON.parse(storedUser);
          userID = parsedUser?._id || null;
        } catch (error) {
          console.error('Error parsing "loggedUser" from localStorage:', error);
          // localStorage.removeItem('loggedUser');
        }
      }

      if (!userID) {
        throw new Error('No valid user ID found in localStorage');
      }

      // 4. Update user details with the new profile picture
      await updateUserCreationDetails(
        { profilePicture: responseData.secure_url },
        userID,
      );

      // 5. Update localStorage and Redux store with new data
      const updatedData = {
        _id: userID,
        ...userData,
        profilePicture: responseData.secure_url,
      };
      localStorage.setItem('loggedUser', JSON.stringify(updatedData));
      dispatch(setUserInfo(updatedData));

      // 6. Success message
      setIsError({
        isError: true,
        message: 'Profile image successfully added',
        type: 'success',
      });

      setUpdatedProfilePicture('');
      setProfileUploading(false);
    } catch (err) {
      console.error('Error uploading/updating profile image:', err);
      setUpdatedProfilePicture('');
      setProfileUploading(false);
      setIsError({
        isError: true,
        message: err.message,
        type: 'error',
      });
    }
  };

  const deleteProfileImage = () => {
    setUpdatedProfilePicture('');
    setUserData((prev) => ({ ...prev, profilePicture: '' }));

    // Safely parse "loggedUser" for user ID
    let userID = null;
    const storedUser = localStorage.getItem('loggedUser');
    if (storedUser && storedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(storedUser);
        userID = parsedUser?._id || null;
      } catch (error) {
        console.error('Error parsing "loggedUser" from localStorage:', error);
      }
    }

    if (!userID) {
      setIsError({
        isError: true,
        message: 'No valid user ID found in localStorage.',
        type: 'error',
      });
      return;
    }

    // Update the user profile image to empty
    updateUserCreationDetails({ profilePicture: '' }, userID)
      .then(() => {
        // Update localStorage and Redux
        const updatedData = { ...userData, profilePicture: '', _id: userID };
        localStorage.setItem('loggedUser', JSON.stringify(updatedData));
        dispatch(setUserInfo(updatedData));

        setShowDeleteProfileModal(false);
        setIsError({
          isError: true,
          message: 'Profile image successfully deleted',
          type: 'success',
        });
      })
      .catch((error) => {
        console.error(`Error updating user details: ${error}`);
        setIsError({
          isError: true,
          message: error.message,
          type: 'error',
        });
      });
  };

  const confirmDeleteProfileImage = () => {
    setShowDeleteProfileModal(true);
  };

  return (
    <BorderlessContentBox>
      <AlertBox
        message={isError.message}
        type={isError.type}
        show={isError.isError}
        hide={() =>
          setIsError({
            isError: false,
            message: '',
            type: '',
          })
        }
      />
      <div className="block lg:flex justify-start lg:gap-8 w-full">
        <div className="mb-6">
          <h3 className="text-sm font-medium leading-5 text-grey-710">
            Personal information
          </h3>
          <p className="text-sm text-grey-500 leading-5">
            Update your photo and personal details.
          </p>
        </div>

        <div className="w-full mb-12">
          <ContentBox noMargin>
            <>
              <div className="w-full p-3 md:p-6">
                <div className="flex items-center md:gap-6 w-full mb-6">
                  <div
                    className="w-16 h-16 bg-secondary-neutral-light-25 rounded-full flex justify-center items-center cursor-pointer"
                    onClick={handleAvatarClick}
                    title="Tap to change profile image"
                  >
                    {userData.profilePicture ? (
                      <img
                        src={userData.profilePicture}
                        alt={`${
                          userData.firstName + ' ' + userData.lastName
                        } profile image`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <h3 className="text-center text-2xl leading-8 font-medium text-blue-600">
                        {userData.firstName[0] + userData.lastName[0]}
                      </h3>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      className="text-sm font-medium text-secondary-neutral-light-500"
                      onClick={confirmDeleteProfileImage}
                    >
                      Delete
                    </Button>
                    <Button
                      className={`text-sm font-medium ${
                        !updatedProfilePicture
                          ? 'text-secondary-neutral-light-500'
                          : 'text-blue-600 bg-blue-50 rounded'
                      }`}
                      onClick={handleProfileImageUpdate}
                      disabled={!updatedProfilePicture}
                    >
                      {updatedProfilePicture && !profileUploading
                        ? 'Save photo'
                        : profileUploading
                          ? 'Uploading...'
                          : 'Update'}
                    </Button>
                  </div>
                </div>
                <form className="grid grid-cols-2 gap-6">
                  <div className="gap-[6px] col-span-1">
                    <TextInputField
                      id="firstName"
                      value={userData.firstName}
                      onChange={handleChange}
                      label="First name"
                      type="text"
                    />
                  </div>

                  <div className="gap-[6px] col-span-1">
                    <TextInputField
                      id="lastName"
                      value={userData.lastName}
                      onChange={handleChange}
                      label="Last name"
                      type="text"
                    />
                  </div>
                  <div className="gap-[6px] col-span-full">
                    <TextInputField
                      id="email"
                      value={userData.email}
                      onChange={handleChange}
                      label="Email"
                      type="email"
                    />
                  </div>
                  <div className="gap-[6px] col-span-full">
                    <TextInputField
                      id="jobTitle"
                      value={userData.jobTitle}
                      onChange={handleChange}
                      label="Job title"
                      type="text"
                    />
                  </div>

                  <div className="relative flex flex-col gap-[6px] md:col-span-1 col-span-full">
                    <label className="text-gray-720 text-sm leading-4 tracking-[-0.42px]">
                      Country
                    </label>
                    <div className="relative">
                      <select
                        type="text"
                        id="country"
                        value={userData.country}
                        onChange={handleChange}
                        className="bg-white border border-gray-200 text-secondary-neutral-light-400 focus:border-gray-200 focus:bg-gray-100 text-sm w-full rounded p-3 dark:placeholder-white-400 dark:text-white"
                        required
                      >
                        <option value="" disabled></option>
                        {countryOptions.map((country) => (
                          <option value={country.value} key={country.value}>
                            {country.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="relative flex flex-col gap-[6px] md:col-span-1 col-span-full">
                    <label className="text-gray-720 text-sm leading-4 tracking-[-0.42px]">
                      Timezone
                    </label>
                    <div className="absolute left-0 top-3 w-10 h-full flex items-center justify-center">
                      <ClockIcon />
                    </div>
                    <select
                      type="text"
                      id="timezone"
                      value={userData.timezone}
                      onChange={handleChange}
                      className="bg-white border border-gray-200 text-secondary-neutral-light-400 focus:border-gray-200 focus:bg-gray-100 text-sm rounded block w-full pl-10 pr-3 py-3 dark:placeholder-white-400 dark:text-white"
                      required
                    >
                      <option value="" disabled></option>
                      {timeZonesArr.map((timeZone) => (
                        <option value={timeZone.value} key={timeZone.value}>
                          {timeZone.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative flex flex-col gap-[6px] col-span-full">
                    <label className="text-gray-720 text-sm leading-4 tracking-[-0.42px]">
                      Bio
                    </label>
                    <textarea
                      type="email"
                      id="description"
                      value={userData.description}
                      onChange={handleChange}
                      className="bg-white border border-gray-200 text-secondary-neutral-light-400 focus:border-gray-200 focus:bg-gray-100 text-sm rounded block w-full p-3 dark:placeholder-white-400 dark:text-white"
                      required
                    />
                  </div>
                </form>
              </div>
              <div className="col-span-full flex justify-end gap-3 border-t border-t-secondary-neutral-light-100 w-full px-3 py-4">
                <Button
                  onClick={handleCancel}
                  className="text-sm font-medium leading-5 py-3 px-4"
                  variant="outlined"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="text-sm font-medium leading-5 text-white py-3 px-4 rounded bg-blue-600"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Save'}
                </Button>
              </div>
            </>
          </ContentBox>
        </div>
      </div>
      <Modal
        display={showDeleteProfileModal}
        handleConfirm={deleteProfileImage}
        closeModal={() => setShowDeleteProfileModal(false)}
        description={`Are you sure you want to delete your profile image?`}
        confirmButton="Delete"
      />
    </BorderlessContentBox>
  );
};

export default Profile;
