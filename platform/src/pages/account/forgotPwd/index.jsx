import React, { useState } from 'react';
import Link from 'next/link';
import AccountPageLayout from '@/components/Account/Layout';
import Toast from '@/components/Toast';
import Spinner from '@/components/Spinner';
import { forgotPasswordApi } from '@/core/apis/Account';

const index = () => {
  const version = 3;
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [toastMessage, setToastMessage] = useState({
    message: '',
    type: '',
  });

  /**
   * @description Handles the forgot password request
   * @param {Object} e - The event object
   * @returns {void} - Returns nothing
   */
  const handleForgotPWD = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Check to ensure that the email is valid
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      setLoading(false);
      return setToastMessage({
        message: 'Please enter a valid email address',
        type: 'error',
      });
    }

    try {
      const data = {
        email,
        version,
      };
      const response = await forgotPasswordApi(data);
      if (response.success === true) {
        setLoading(false);
        setEmail('');
        return setToastMessage({
          message: response.message,
          type: 'success',
        });
      }
      setLoading(false);
      return setToastMessage({
        message: 'The provided email does not belong to a registered account, please try again',
        type: 'error',
      });
    } catch (error) {
      setLoading(false);
      setEmail('');
      return setToastMessage({
        message: 'An error occurred. Please try again',
        type: 'error',
      });
    }
  };

  return (
    <AccountPageLayout
      pageTitle='AirQo Analytics | Forgot Password'
      rightText={
        "What you've built here is so much better for air pollution monitoring than anything else on the market!"
      }>
      <div className='w-full'>
        <h2 className='text-3xl text-black-700 font-medium'>Forgot Your Password?</h2>
        <p className='text-xl text-black-700 font-normal mt-3'>
          Enter your email address and we will send you a link to reset your password.
        </p>
        <form onSubmit={handleForgotPWD}>
          <div className='mt-6'>
            <div className='w-full'>
              <div className='text-sm text-grey-300'>Email Address</div>
              <div className='mt-2 w-full'>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='e.g. greta.nagawa@gmail.com'
                  className={`input w-full p-3 rounded-[4px] border-gray-300 focus:outline-none focus:ring-0 placeholder-gray-300 focus:border-green-500`}
                  required
                />
              </div>
            </div>
          </div>
          <div className='mt-10'>
            <button
              style={{ textTransform: 'none' }}
              className='w-full btn bg-blue-900 rounded-[12px] text-white text-sm outline-none border-none hover:bg-blue-950'
              type='submit'>
              {loading ? <Spinner width={25} height={25} /> : 'Submit'}
            </button>
          </div>
        </form>
        <div className='mt-8 w-full flex justify-center'>
          <div>
            <span className='text-sm text-blue-900 font-medium'>
              <Link href='/account/login'>Login</Link>
            </span>
          </div>
        </div>
      </div>

      {toastMessage.message && (
        <Toast
          type={toastMessage.type}
          timeout={8000}
          message={toastMessage.message}
          clearData={() => setToastMessage({ message: '', type: '' })}
        />
      )}
    </AccountPageLayout>
  );
};

export default index;
