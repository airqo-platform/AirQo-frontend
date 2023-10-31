import BorderlessContentBox from '@/components/Layout/borderless_content_box';
import ContentBox from '@/components/Layout/content_box';
import Button from '@/components/Button';
import Modal from '@/components/Modal/Modal';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateUserDetails } from '@/core/apis/Account';
import ReactCountryFlag from 'react-country-flag';
import ClockIcon from '@/icons/Settings/clock.svg';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { cloudinaryImageUpload } from '@/core/apis/Cloudinary';
import timeZones from 'timezones.json';
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
  const [errors, setErrors] = useState(false);
  const [error, setError] = useState();
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
  const [userID, setUserID] = useState('');
  const [updatedProfilePicture, setUpdatedProfilePicture] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [showDeleteProfileModal, setShowDeleteProfileModal] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedUser'));

    if (user) {
      setUserData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        jobTitle: user.jobTitle || '',
        country: user.country || '',
        timezone: user.timezone || '',
        description: user.description || '',
        profilePicture: user.profilePicture || '',
      });
      setUserID(user._id);
    }
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    if (!userID) return;
    try {
      updateUserDetails(userID, userData)
        .then((response) => {
          localStorage.setItem('loggedUser', JSON.stringify(response.user));
          setLoading(false);
        })
        .catch((error) => {
          console.error(`Error updating user details: ${error}`);
          setLoading(false);
        });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const user = JSON.parse(localStorage.getItem('loggedUser'));
    setUserData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      jobTitle: user.jobTitle || '',
      country: user.country || '',
      timezone: user.timezone || '',
      description: user.description || '',
      profilePicture: user.profilePicture || '',
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
      .catch((error) => {
        console.error(error);
      });
  };

  const handleProfileImageUpdate = async () => {
    if (updatedProfilePicture) {
      const formData = new FormData();
      formData.append('file', updatedProfilePicture);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);
      formData.append('folder', 'profiles');

      setProfileUploading(true);
      await cloudinaryImageUpload(formData)
        .then(async (responseData) => {
          const updateData = { profilePicture: responseData.secure_url };
          return await updateUserDetails(userID, updateData)
            .then((responseData) => {
              localStorage.setItem('loggedUser', JSON.stringify(responseData.user));
              // updated user alert
            })
            .catch((err) => {
              // updated user failure alert
            });
        })
        .catch(() => {
          // unable to save image error
        });
      setUpdatedProfilePicture('');
      setProfileUploading(false);
    }
  };

  const deleteProfileImage = () => {
    setUpdatedProfilePicture('');
    setUserData({ ...userData, profilePicture: '' });

    updateUserDetails(userID, { profilePicture: '' })
      .then((response) => {
        localStorage.setItem('loggedUser', JSON.stringify({ ...userData, profilePicture: '' }));
        setShowDeleteProfileModal(false);
      })
      .catch((error) => {
        console.error(`Error updating user details: ${error}`);
      });
  };

  const confirmDeleteProfileImage = () => {
    setShowDeleteProfileModal(true);
  };

  return (
    <BorderlessContentBox>
      <div className='block lg:flex justify-start lg:gap-8 w-full'>
        <div className='mb-6'>
          <h3 className='text-sm font-medium leading-5 text-grey-710'>Personal information</h3>
          <p className='text-sm text-grey-500 leading-5'>Update your photo and personal details.</p>
        </div>

        <div className='w-full mb-12'>
          <ContentBox noMargin>
            <>
              <div className='w-full p-3 md:p-6'>
                <div className='flex items-center md:gap-6 w-full mb-6'>
                  <div
                    className='w-16 h-16 bg-secondary-neutral-light-25 rounded-full flex justify-center items-center cursor-pointer'
                    onClick={handleAvatarClick}
                    title='Tap to change profile image'
                  >
                    {userData.profilePicture ? (
                      <img
                        src={userData.profilePicture}
                        alt={`${userData.firstName + ' ' + userData.lastName} profile image`}
                        className='w-full h-full rounded-full object-cover'
                      />
                    ) : (
                      <h3 className='text-center text-2xl leading-8 font-medium text-blue-600'>
                        {userData.firstName[0] + userData.lastName[0]}
                      </h3>
                    )}
                  </div>
                  <div className='flex items-center'>
                    <Button
                      className='text-sm font-medium text-secondary-neutral-light-500'
                      onClick={confirmDeleteProfileImage}
                    >
                      Delete
                    </Button>
                    <Button
                      className={`text-sm font-medium ${
                        !updatedProfilePicture
                          ? 'text-secondary-neutral-light-500'
                          : 'text-blue-600'
                      }`}
                      onClick={handleProfileImageUpdate}
                      disabled={!updatedProfilePicture}
                    >
                      Update
                    </Button>
                  </div>
                </div>
                <form className='grid grid-cols-2 gap-6'>
                  <div className='relative flex flex-col gap-[6px] md:col-span-1 col-span-full'>
                    <label className='text-gray-720 text-sm leading-4 tracking-[-0.42px]'>
                      First name
                    </label>
                    <input
                      type='text'
                      id='firstName'
                      value={userData.firstName}
                      onChange={handleChange}
                      className='bg-white border border-gray-200 text-secondary-neutral-light-400 focus:border-gray-200 focus:bg-gray-100 text-sm rounded block w-full p-3 dark:placeholder-white-400 dark:text-white'
                      required
                    />
                  </div>
                  <div className='relative flex flex-col gap-[6px] md:col-span-1 col-span-full'>
                    <label className='text-gray-720 text-sm leading-4 tracking-[-0.42px]'>
                      Last name
                    </label>
                    <input
                      type='text'
                      id='lastName'
                      value={userData.lastName}
                      onChange={handleChange}
                      className='bg-white border border-gray-200 text-secondary-neutral-light-400 focus:border-gray-200 focus:bg-gray-100 text-sm rounded block w-full p-3 dark:placeholder-white-400 dark:text-white'
                      required
                    />
                  </div>
                  <div className='relative flex flex-col gap-[6px] col-span-full'>
                    <label className='text-gray-720 text-sm leading-4 tracking-[-0.42px]'>
                      Email
                    </label>
                    <input
                      type='email'
                      id='email'
                      value={userData.email}
                      onChange={handleChange}
                      className='bg-white border border-gray-200 text-secondary-neutral-light-400 focus:border-gray-200 focus:bg-gray-100 text-sm rounded block w-full p-3 dark:placeholder-white-400 dark:text-white'
                      required
                    />
                  </div>
                  <div className='relative flex flex-col gap-[6px] col-span-full'>
                    <label className='text-gray-720 text-sm leading-4 tracking-[-0.42px]'>
                      Job title
                    </label>
                    <input
                      type='text'
                      id='jobTitle'
                      value={userData.jobTitle}
                      onChange={handleChange}
                      className='bg-white border border-gray-200 text-secondary-neutral-light-400 focus:border-gray-200 focus:bg-gray-100 text-sm rounded block w-full p-3 dark:placeholder-white-400 dark:text-white'
                      required
                    />
                  </div>
                  <div className='relative flex flex-col gap-[6px] md:col-span-1 col-span-full'>
                    <label className='text-gray-720 text-sm leading-4 tracking-[-0.42px]'>
                      Country
                    </label>
                    {/* input select field to select country and country flag on the left */}
                    <div className='relative'>
                      <select
                        type='text'
                        id='country'
                        value={userData.country}
                        onChange={handleChange}
                        className='bg-white border border-gray-200 text-secondary-neutral-light-400 focus:border-gray-200 focus:bg-gray-100 text-sm w-full rounded p-3 dark:placeholder-white-400 dark:text-white'
                        required
                      >
                        <option value='' disabled></option>
                        {countryOptions.map((country) => (
                          <option value={country.value} key={country.value}>
                            {country.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className='relative flex flex-col gap-[6px] md:col-span-1 col-span-full'>
                    <label className='text-gray-720 text-sm leading-4 tracking-[-0.42px]'>
                      Timezone
                    </label>
                    <div className='absolute left-0 top-3 w-10 h-full flex items-center justify-center'>
                      <ClockIcon />
                    </div>
                    <select
                      type='text'
                      id='timezone'
                      value={userData.timezone}
                      onChange={handleChange}
                      className='bg-white border border-gray-200 text-secondary-neutral-light-400 focus:border-gray-200 focus:bg-gray-100 text-sm rounded block w-full pl-10 pr-3 py-3 dark:placeholder-white-400 dark:text-white'
                      required
                    >
                      <option value='' disabled></option>
                      {timeZonesArr.map((timeZone) => (
                        <option value={timeZone.value} key={timeZone.value}>
                          {timeZone.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='relative flex flex-col gap-[6px] col-span-full'>
                    <label className='text-gray-720 text-sm leading-4 tracking-[-0.42px]'>
                      Bio
                    </label>
                    <textarea
                      type='email'
                      id='description'
                      value={userData.description}
                      onChange={handleChange}
                      className='bg-white border border-gray-200 text-secondary-neutral-light-400 focus:border-gray-200 focus:bg-gray-100 text-sm rounded block w-full p-3 dark:placeholder-white-400 dark:text-white'
                      required
                    />
                  </div>
                </form>
              </div>
              <div className='col-span-full flex justify-end gap-3 border-t border-t-secondary-neutral-light-100 w-full px-3 py-4'>
                <Button
                  onClick={handleCancel}
                  className='text-sm font-medium leading-5 text-secondary-neutral-light-600 py-3 px-4 rounded border border-secondary-neutral-light-100 bg-white'
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className='text-sm font-medium leading-5 text-white py-3 px-4 rounded bg-blue-600'
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
        confirmButton='Delete'
      />
    </BorderlessContentBox>
  );
};

export default Profile;
