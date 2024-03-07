import React, { useState } from 'react';
import Link from 'next/link';
import VisibilityOffIcon from '@/icons/Account/visibility_off.svg';
import VisibilityOnIcon from '@/icons/Account/visibility_on.svg';
import AccountPageLayout from '@/components/Account/Layout';
import Toast from '@/components/Toast';
import { useRouter } from 'next/router';
import { resetPasswordApi } from '@/core/apis/Account';

const index = () => {
  const router = useRouter();
  const [Password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordType, setPasswordType] = useState('password');
  const [confirmPasswordType, setConfirmPasswordType] = useState('password');
  const [toastMessage, setToastMessage] = useState({
    message: '',
    type: '',
  });
  const { token, version } = router.query;

  const [loading, setLoading] = useState(false);

  /**
   * @description Handles the forgot password request
   * @param {Object} e - The event object
   * @returns {void} - Returns nothing
   */
  const handlePasswordReset = (e) => {
    e.preventDefault();
    setLoading(true);
    if (Password !== confirmPassword) {
      setLoading(false);
      return setToastMessage({
        message: 'Passwords do not match',
        type: 'error',
      });
    }
    resetPasswordApi({ password: Password, resetPasswordToken: token })
      .then((response) => {
        setLoading(false);
        if (response.status === 'success') {
          return setToastMessage({
            message: response.message,
            type: 'success',
          });
        }

        // redirect to login page
        router.push('/account/login');

        return setToastMessage({
          message: response.message,
          type: 'error',
        });
      })
      .catch((error) => {
        setLoading(false);
        return setToastMessage({
          message: 'An error occurred. Please try again',
          type: 'error',
        });
      });
  };

  const togglePasswordVisibility = () => {
    setPasswordType(passwordType === 'password' ? 'text' : 'password');
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordType(confirmPasswordType === 'password' ? 'text' : 'password');
  };

  return (
    <AccountPageLayout
      pageTitle='AirQo Analytics | Forgot Password'
      rightText={
        "What you've built here is so much better for air pollution monitoring than anything else on the market!"
      }>
      <div className='w-full'>
        <h2 className='text-3xl text-black-700 font-medium'>Reset Your Password</h2>
        <p className='text-xl text-black-700 font-normal mt-3'>
          Please enter your new password below. Make sure it's something secure that you can
          remember.
        </p>
        <form onSubmit={handlePasswordReset}>
          <div className='mt-6'>
            <div className='w-full'>
              <div className='text-sm text-grey-300'>Password</div>
              <div className='mt-2 w-full relative'>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  type={passwordType}
                  placeholder='******'
                  className={`input w-full p-3 rounded-[4px] border-gray-300 focus:outline-none focus:ring-0 placeholder-gray-300 focus:border-green-500`}
                  required
                />
                <div className='absolute right-4 top-[25px]  transform -translate-y-1/2 cursor-pointer'>
                  <div onClick={togglePasswordVisibility}>
                    {passwordType === 'password' && <VisibilityOffIcon />}
                    {passwordType === 'text' && (
                      <VisibilityOnIcon className='stroke-1 stroke-svg-green' />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='mt-6'>
            <div className='w-full'>
              <div className='text-sm text-grey-300'>Confirm Password</div>
              <div className='mt-2 w-full relative'>
                <input
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={confirmPasswordType}
                  placeholder='******'
                  className={`input w-full p-3 rounded-[4px] border-gray-300 focus:outline-none focus:ring-0 placeholder-gray-300 focus:border-green-500`}
                  required
                />
                <div className='absolute right-4 top-[25px]  transform -translate-y-1/2 cursor-pointer'>
                  <div onClick={toggleConfirmPasswordVisibility}>
                    {confirmPasswordType === 'password' && <VisibilityOffIcon />}
                    {confirmPasswordType === 'text' && (
                      <VisibilityOnIcon className='stroke-1 stroke-svg-green' />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='mt-10'>
            <button
              style={{ textTransform: 'none' }}
              className='w-full btn bg-blue-900 rounded-[12px] text-white text-sm outline-none border-none hover:bg-blue-950'
              type='submit'>
              {loading ? <Spinner width={25} height={25} /> : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>

      {toastMessage.message && (
        <Toast type={toastMessage.type} timeout={8000} message={toastMessage.message} />
      )}
    </AccountPageLayout>
  );
};

export default index;
