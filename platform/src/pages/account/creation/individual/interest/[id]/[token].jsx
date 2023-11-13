import React, { useEffect, useState } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import RadioComponent from '@/components/Account/RadioComponent';
import { updateUserCreationDetails, verifyUserEmailApi } from '@/core/apis/Account';
import { useRouter } from 'next/router';
import Toast from '@/components/Toast';
import Spinner from '@/components/Spinner';
import { postUserDefaults } from '@/lib/store/services/account/UserDefaultsSlice';
import { useDispatch } from 'react-redux';

const IndividualAccountInterest = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = router.query;
  const { token } = router.query;

  const radioButtonText = [
    'Health Professional',
    'Software Developer',
    'Community Champion',
    'Environmental Scientist',
    'Student',
    'Policy Maker',
    'Researcher',
    'Air Quality Partner',
  ];
  const [clickedButton, setClickedButton] = useState('');
  const [interest, setInterest] = useState(null);
  const [userData, setUserData] = useState({});
  const [updateError, setUpdateError] = useState({
    state: false,
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const verifyUserEmail = async (userId, userToken) => {
    try {
      await verifyUserEmailApi(userId, userToken);
    } catch {}
  };

  useEffect(() => {
    verifyUserEmail(id, token);
  }, [router, id, token]);

  const handleUpdate = async () => {
    setLoading(true);
    setUpdateError({
      state: false,
      message: '',
    });
    setUserData({
      industry: clickedButton,
      interest,
    });
    const userDefaults = {
      user: id,
    };
    try {
      const response = await updateUserCreationDetails(userData, id);
      if (!response.success) {
        setUpdateError({
          state: true,
          message: response.message,
        });
      }
    } catch (error) {
      throw error;
    }

    try {
      const response = await dispatch(postUserDefaults(userDefaults));
      if (response.payload.success) {
        router.push('/account/creation/get-started');
      } else {
        setUpdateError({
          state: true,
          message: response.payload.message,
        });
      }
    } catch (error) {
      throw error;
    }
    setLoading(false);
  };

  return (
    <AccountPageLayout childrenHeight={'lg:h-[580]'}>
      {updateError.state && <Toast type={'error'} timeout={5000} message={updateError.message} />}
      <div className='w-full'>
        <h2 className='text-3xl text-black-700 font-medium'>Help us understand your interest</h2>
        <p className='text-xl text-black-700 font-normal mt-3'>
          We will help you get started based on your response
        </p>
        <div className='mt-6'>
          <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-4'>
            {clickedButton === ''
              ? radioButtonText.map((text, index) => (
                  <div key={index} className='w-full' onClick={() => setClickedButton(text)}>
                    <RadioComponent
                      text={text}
                      titleFont={'text-md font-normal'}
                      padding={'px-3 py-4'}
                      width={'w-full'}
                    />
                  </div>
                ))
              : radioButtonText
                  .filter((button) => button === clickedButton)
                  .map((text, index) => (
                    <div key={index} className='w-full col-span-2'>
                      <RadioComponent
                        text={text}
                        titleFont={'text-md font-normal'}
                        padding={'px-3 py-4'}
                        width={'w-full'}
                        checked={true}
                      />
                      <div className='mt-6'>
                        <div className='w-full'>
                          <div className='text-sm'>Give us more details about your interests?</div>
                          <div className='mt-2 w-10/12'>
                            <textarea
                              onChange={(e) => setInterest(e.target.value)}
                              rows='3'
                              className='textarea textarea-lg w-full bg-white rounded-lg border-input-light-outline focus:border-input-outline'
                              placeholder='Type here'></textarea>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
          </div>
        </div>
        <div className='mt-10'>
          <div className='lg:w-1/3 mt-6 md:mt-0 md:w-full'>
            {clickedButton === '' && interest === null ? (
              <button className='w-full btn btn-disabled bg-white rounded-none text-sm outline-none border-none'>
                {loading ? <Spinner data-testid='spinner' width={25} height={25} /> : 'Continue'}
              </button>
            ) : (
              <button
                className='w-full btn bg-blue-900 rounded-none text-sm outline-none border-none hover:bg-blue-950'
                onClick={() => handleUpdate()}>
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </AccountPageLayout>
  );
};

export default IndividualAccountInterest;
