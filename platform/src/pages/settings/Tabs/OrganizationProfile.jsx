import BorderlessContentBox from '@/components/Layout/borderless_content_box';
import ContentBox from '@/components/Layout/content_box';
import Button from '@/components/Button';
import Modal from '@/components/Modal/Modal';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GlobeIcon from '@/icons/Settings/globe.svg';
import ClockIcon from '@/icons/Settings/clock.svg';
import AlertBox from '@/components/AlertBox';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { cloudinaryImageUpload } from '@/core/apis/Cloudinary';
import timeZones from 'timezones.json';
import TextInputField from '@/components/TextInputField';
import { fetchGroupInfo } from '@/lib/store/services/groups/GroupInfoSlice';
import { updateGroupDetailsApi } from '@/core/apis/Account';
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

const OrganizationProfile = () => {
  const [isError, setIsError] = useState({
    isError: false,
    message: '',
    type: '',
  });
  const dispatch = useDispatch();
  const [orgData, setOrgData] = useState({
    grp_title: '',
    grp_website: '',
    grp_industry: '',
    grp_description: '',
    grp_country: '',
    grp_timezone: '',
    grp_image: '',
  });
  const industryList = [
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
  ];
  const [updatedProfilePicture, setUpdatedProfilePicture] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [showDeleteProfileModal, setShowDeleteProfileModal] = useState(false);
  const orgInfo = useSelector((state) => state.groupInfo.groupInfo);

  useEffect(() => {
    setLoading(true);
    const storedActiveGroup = localStorage.getItem('activeGroup');
    const storedActiveGroupID = storedActiveGroup && JSON.parse(storedActiveGroup)._id;

    // get group information
    try {
      dispatch(fetchGroupInfo(storedActiveGroupID));
    } catch (error) {
      console.error(`Error fetching group info: ${error}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (orgInfo) {
      setOrgData({
        grp_title: orgInfo.grp_title,
        grp_website: orgInfo.grp_website,
        grp_industry: orgInfo.grp_industry,
        grp_description: orgInfo.grp_description,
        grp_country: orgInfo.grp_country,
        grp_timezone: orgInfo.grp_timezone,
        grp_image: orgInfo.grp_image,
      });
    }
  }, [orgInfo]);

  const handleChange = (e) => {
    setOrgData({ ...orgData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const storedActiveGroup = localStorage.getItem('activeGroup');
    const storedActiveGroupID = storedActiveGroup && JSON.parse(storedActiveGroup)._id;
    if (!storedActiveGroupID) {
      setLoading(false);
      return;
    }
    try {
      updateGroupDetailsApi(storedActiveGroupID, orgData)
        .then((response) => {
          try {
            dispatch(fetchGroupInfo(storedActiveGroupID));

            setIsError({
              isError: true,
              message: 'Organization details successfully updated',
              type: 'success',
            });
          } catch (error) {
            console.error(`Error fetching organization info: ${error}`);
          } finally {
            setLoading(false);
          }
        })
        .catch((error) => {
          console.error(`Error updating organization details: ${error}`);
          setIsError({
            isError: true,
            message: error.message,
            type: 'error',
          });
          setLoading(false);
        });
    } catch (error) {
      console.error(`Error updating user cloudinary photo: ${error}`);
      setIsError({
        isError: true,
        message: error.message,
        type: 'error',
      });
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setOrgData({
      grp_title: orgInfo.grp_title,
      grp_website: orgInfo.grp_website,
      grp_industry: orgInfo.grp_industry,
      grp_description: orgInfo.grp_description,
      grp_country: orgInfo.grp_country,
      grp_timezone: orgInfo.grp_timezone,
      grp_image: orgInfo.grp_image,
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
        setOrgData({ ...orgData, grp_image: croppedUrl });
      })
      .catch((error) => {
        setIsError({
          isError: true,
          message: 'Something went wrong',
          type: 'error',
        });
      });
  };

  const handleProfileImageUpdate = async () => {
    if (updatedProfilePicture) {
      const formData = new FormData();
      formData.append('file', updatedProfilePicture);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);
      formData.append('folder', 'organization_profiles');

      setProfileUploading(true);
      await cloudinaryImageUpload(formData)
        .then(async (responseData) => {
          setOrgData({ ...orgData, grp_image: responseData.secure_url });
          const storedActiveGroup = localStorage.getItem('activeGroup');
          const storedActiveGroupID = storedActiveGroup && JSON.parse(storedActiveGroup)._id;

          return await updateGroupDetailsApi(storedActiveGroupID, {
            grp_image: responseData.secure_url,
          })
            .then((responseData) => {
              try {
                dispatch(fetchGroupInfo(storedActiveGroupID));
                // updated user alert
                setIsError({
                  isError: true,
                  message: 'Organization image successfully added',
                  type: 'success',
                });
                setUpdatedProfilePicture('');
              } catch (error) {
                console.log(error);
              } finally {
                setProfileUploading(false);
              }
            })
            .catch((err) => {
              // updated user failure alert
              setIsError({
                isError: true,
                message: err.message,
                type: 'error',
              });
              setUpdatedProfilePicture('');
              setProfileUploading(false);
            });
        })
        .catch((err) => {
          // unable to save image error
          setUpdatedProfilePicture('');
          setProfileUploading(false);
          setIsError({
            isError: true,
            message: err.message,
            type: 'error',
          });
        });
    }
  };

  const deleteProfileImage = () => {
    setUpdatedProfilePicture('');
    setOrgData({ ...orgData, grp_image: '' });

    const storedActiveGroup = localStorage.getItem('activeGroup');
    const storedActiveGroupID = storedActiveGroup && JSON.parse(storedActiveGroup)._id;

    updateGroupDetailsApi(storedActiveGroupID, { grp_image: '' })
      .then((response) => {
        try {
          dispatch(fetchGroupInfo(storedActiveGroupID));
          setShowDeleteProfileModal(false);
          setIsError({
            isError: true,
            message: 'Profile image successfully deleted',
            type: 'success',
          });
        } catch (error) {
          console.log(error);
        }
      })
      .catch((error) => {
        console.error(`Error updating organization details: ${error}`);
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
    orgData &&
    orgData.grp_title && (
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
        <div className='block lg:flex justify-start lg:gap-8 w-full'>
          <div className='mb-6'>
            <h3 className='text-sm font-medium leading-5 text-grey-710'>
              Organisation information
            </h3>
            <p className='text-sm text-grey-500 leading-5'>
              Update your organisation and details here.
            </p>
          </div>

          <div className='w-full mb-12'>
            <ContentBox noMargin>
              <>
                <div className='w-full p-3 md:p-6'>
                  <div className='flex items-center justify-between md:gap-6 w-full mb-6'>
                    <div
                      className='w-16 h-16 bg-secondary-neutral-light-25 rounded-full flex justify-center items-center cursor-pointer'
                      onClick={handleAvatarClick}
                      title='Tap to change profile image'
                    >
                      {orgData.grp_image ? (
                        <img
                          src={orgData.grp_image}
                          alt={`${orgData.grp_title[0] + ' ' + orgData.grp_title[1]} profile image`}
                          className='w-full h-full rounded-full object-cover'
                        />
                      ) : (
                        <h3 className='text-center text-2xl leading-8 font-medium text-blue-600 uppercase'>
                          {orgData.grp_title[0] + ' ' + orgData.grp_title[1]}
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
                  <form className='grid grid-cols-2 gap-6'>
                    <div className='gap-[6px] col-span-full'>
                      <TextInputField
                        id='grp_title'
                        value={orgData.grp_title}
                        onChange={handleChange}
                        label='Organisation name'
                        type='text'
                      />
                    </div>

                    <div className='relative flex flex-col gap-[6px] col-span-full'>
                      <TextInputField
                        id='grp_website'
                        value={orgData.grp_website}
                        onChange={handleChange}
                        label='Website'
                        type='text'
                        Icon={GlobeIcon}
                      />
                    </div>

                    <div className='relative flex flex-col gap-[6px] col-span-full'>
                      <label className='text-gray-720 text-sm leading-4 tracking-[-0.42px]'>
                        Industry
                      </label>
                      <div className='relative'>
                        <select
                          type='text'
                          id='grp_industry'
                          value={orgData.grp_industry}
                          onChange={handleChange}
                          className='bg-white border border-gray-200 text-secondary-neutral-light-400 focus:border-gray-200 focus:bg-gray-100 text-sm w-full rounded p-3 dark:placeholder-white-400 dark:text-white'
                          required
                        >
                          <option value='' disabled></option>
                          {industryList.map((industry, index) => (
                            <option value={industry} key={index}>
                              {industry}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className='relative flex flex-col gap-[6px] col-span-full'>
                      <label className='text-gray-720 text-sm leading-4 tracking-[-0.42px]'>
                        About
                      </label>
                      <textarea
                        type='text'
                        id='grp_description'
                        value={orgData.grp_description}
                        onChange={handleChange}
                        className='bg-white border border-gray-200 text-secondary-neutral-light-400 focus:border-gray-200 focus:bg-gray-100 text-sm rounded block w-full p-3 dark:placeholder-white-400 dark:text-white'
                        required
                      />
                    </div>

                    <div className='relative flex flex-col gap-[6px] md:col-span-1 col-span-full'>
                      <label className='text-gray-720 text-sm leading-4 tracking-[-0.42px]'>
                        Country
                      </label>
                      <div className='relative'>
                        <select
                          type='text'
                          id='grp_country'
                          value={orgData.grp_country || ''}
                          onChange={handleChange}
                          className='bg-white border border-gray-200 text-secondary-neutral-light-400 focus:border-gray-200 focus:bg-gray-100 text-sm w-full rounded p-3 dark:placeholder-white-400 dark:text-white'
                          required
                        >
                          <option value='' disabled></option>
                          {countryOptions.map((country) => (
                            <option value={country.label} key={country.value}>
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
                        id='grp_timezone'
                        value={orgData.grp_timezone || ''}
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
          description={`Are you sure you want to delete the organization profile image?`}
          confirmButton='Delete'
        />
      </BorderlessContentBox>
    )
  );
};

export default OrganizationProfile;
