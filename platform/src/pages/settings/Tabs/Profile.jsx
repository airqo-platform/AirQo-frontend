import BorderlessContentBox from '@/components/Layout/borderless_content_box';
import ContentBox from '@/components/Layout/content_box';
import Button from '@/components/Button';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import ReactCountryFlag from 'react-country-flag';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
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
    }
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.id]: e.target.value });
  };

  return (
    <BorderlessContentBox>
      <div className='block lg:flex justify-start lg:gap-8 w-full'>
        <div>
          <h3 className='text-sm font-medium leading-5 text-grey-710'>Personal information</h3>
          <p className='text-sm text-grey-500 leading-5'>Update your photo and personal details.</p>
        </div>

        <div className='w-full mb-12'>
          <ContentBox noMargin>
            <>
              <div className='w-full p-6'>
                <div className='flex items-center gap-6 w-full mb-6'>
                  <div className='w-16 h-16 bg-secondary-neutral-light-25 rounded-full flex justify-center items-center'>
                    {userData.profilePicture ? (
                      <img
                        src={userData.profilePicture}
                        alt={`${userData.firstName + ' ' + userData.lastName} profile image`}
                        className='w-full h-full rounded-full'
                      />
                    ) : (
                      <h3 className='text-center text-2xl leading-8 font-medium text-blue-600'>
                        {userData.firstName[0] + userData.lastName[0]}
                      </h3>
                    )}
                  </div>
                  <div className='flex items-center'>
                    <Button className='text-sm font-medium text-secondary-neutral-light-500'>
                      Delete
                    </Button>
                    <Button className='text-sm font-medium text-blue-600'>Update</Button>
                  </div>
                </div>
                <form className='grid grid-cols-2 gap-6'>
                  <div className='relative flex flex-col gap-[6px] md:col-span-1 col-span-full'>
                    <label className='text-secondary-neutral-light-600 text-sm leading-4 tracking-[-0.42px]'>
                      First name
                    </label>
                    <input
                      type='text'
                      id='firstName'
                      value={userData.firstName}
                      onChange={handleChange}
                      className='bg-white border border-gray-200 focus:border-gray-200 focus:bg-gray-100 text-gray-900 text-sm rounded block w-full p-3 dark:placeholder-white-400 dark:text-white'
                      required
                    />
                  </div>
                  <div className='relative flex flex-col gap-[6px] md:col-span-1 col-span-full'>
                    <label className='text-secondary-neutral-light-600 text-sm leading-4 tracking-[-0.42px]'>
                      Last name
                    </label>
                    <input
                      type='text'
                      id='lastName'
                      value={userData.lastName}
                      onChange={handleChange}
                      className='bg-white border border-gray-200 focus:border-gray-200 focus:bg-gray-100 text-gray-900 text-sm rounded block w-full p-3 dark:placeholder-white-400 dark:text-white'
                      required
                    />
                  </div>
                  <div className='relative flex flex-col gap-[6px] col-span-full'>
                    <label className='text-secondary-neutral-light-600 text-sm leading-4 tracking-[-0.42px]'>
                      Email
                    </label>
                    <input
                      type='email'
                      id='email'
                      value={userData.email}
                      onChange={handleChange}
                      className='bg-white border border-gray-200 focus:border-gray-200 focus:bg-gray-100 text-gray-900 text-sm rounded block w-full p-3 dark:placeholder-white-400 dark:text-white'
                      required
                    />
                  </div>
                  <div className='relative flex flex-col gap-[6px] col-span-full'>
                    <label className='text-secondary-neutral-light-600 text-sm leading-4 tracking-[-0.42px]'>
                      Job title
                    </label>
                    <input
                      type='text'
                      id='jobTitle'
                      value={userData.jobTitle}
                      onChange={handleChange}
                      className='bg-white border border-gray-200 focus:border-gray-200 focus:bg-gray-100 text-gray-900 text-sm rounded block w-full p-3 dark:placeholder-white-400 dark:text-white'
                      required
                    />
                  </div>
                  <div className='relative flex flex-col gap-[6px] md:col-span-1 col-span-full'>
                    <label className='text-secondary-neutral-light-600 text-sm leading-4 tracking-[-0.42px]'>
                      Country
                    </label>
                    {/* input select field to select country and country flag on the left */}
                    <div className='relative'>
                      <div className='absolute left-0 top-0 w-10 h-full flex items-center justify-center'>
                        {/* Add your flag component here */}
                        <ReactCountryFlag countryCode='US' svg />
                        {userData && userData.country && (
                          <ReactCountryFlag
                            countryCode={() => retrieveCountryCode(userData.country)}
                            svg
                          />
                        )}
                      </div>
                      <select
                        type='text'
                        id='country'
                        value={userData.country}
                        onChange={handleChange}
                        className='bg-white border border-gray-200 focus:border-gray-200 focus:bg-gray-100 text-gray-900 text-sm w-full rounded pl-12 pr-3 py-3 dark:placeholder-white-400 dark:text-white'
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
                    <label className='text-secondary-neutral-light-600 text-sm leading-4 tracking-[-0.42px]'>
                      Timezone
                    </label>
                    <input
                      type='text'
                      id='lastName'
                      value={userData.timezone}
                      onChange={handleChange}
                      className='bg-white border border-gray-200 focus:border-gray-200 focus:bg-gray-100 text-gray-900 text-sm rounded block w-full p-3 dark:placeholder-white-400 dark:text-white'
                      required
                    />
                  </div>
                  <div className='relative flex flex-col gap-[6px] col-span-full'>
                    <label className='text-secondary-neutral-light-600 text-sm leading-4 tracking-[-0.42px]'>
                      Bio
                    </label>
                    <textarea
                      type='email'
                      id='description'
                      value={userData.description}
                      onChange={handleChange}
                      className='bg-white border border-gray-200 focus:border-gray-200 focus:bg-gray-100 text-gray-900 text-sm rounded block w-full p-3 dark:placeholder-white-400 dark:text-white'
                      required
                    />
                  </div>
                </form>
              </div>
              <div className='col-span-full flex justify-end gap-3 border-t border-t-secondary-neutral-light-100 w-full px-3 py-4'>
                <Button className='text-sm font-medium leading-5 text-secondary-neutral-light-600 py-3 px-4 rounded border border-secondary-neutral-light-100 bg-white'>
                  Cancel
                </Button>
                <Button className='text-sm font-medium leading-5 text-white py-3 px-4 rounded bg-blue-600'>
                  Save
                </Button>
              </div>
            </>
          </ContentBox>
        </div>
      </div>
    </BorderlessContentBox>
  );
};

export default Profile;
