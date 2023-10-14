import React, { useState } from 'react';
import Lock from '@/icons/Settings/lock.svg';
import { updateUserPasswordApi } from '@/core/apis/Settings';
import { useSelector } from 'react-redux';
import AlertBox from '@/components/AlertBox';

const Password = () => {
  const userInfo = useSelector((state) => state.login.userInfo);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isError, setIsError] = useState({
    isError: false,
    message: '',
    type: '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = userInfo._id;
    const tenant = userInfo.organization;
    const { newPassword, currentPassword, confirmNewPassword } = passwords;

    if (!newPassword || !currentPassword || !confirmNewPassword) {
      setIsError({
        isError: true,
        message: 'Please fill in all fields.',
        type: 'error',
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setIsError({
        isError: true,
        message: 'New password and confirmation password do not match.',
        type: 'error',
      });
      return;
    }

    const pwdData = {
      password: newPassword,
      old_password: currentPassword,
    };

    try {
      setIsDisabled(true);
      const response = await updateUserPasswordApi(userId, tenant, pwdData);

      if (response.success) {
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        setIsError({
          isError: true,
          message: 'Password updated successfully.',
          type: 'success',
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setIsError({
        isError: true,
        message: error.message || 'An error occurred while updating the password.',
        type: 'error',
      });
    } finally {
      setIsDisabled(false);
    }
  };

  const handleReset = () => {
    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
  };

  return (
    <>
      <div className='px-3 lg:px-16 -mb-6' data-testid='alert-box'>
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
      </div>
      <div
        data-testid='tab-content'
        className='px-3 lg:px-16 py-8 flex justify-start flex-col md:grid md:grid-cols-3 gap-4 items-start'>
        <div className='md:col-span-1'>
          <h1 className='text-2xl font-medium'>Password</h1>
          <p className='text-sm text-gray-500'>
            Enter your current password to change your password.
          </p>
        </div>
        <div className='md:col-span-2 w-full'>
          <div className='border-[0.5px] rounded-lg border-grey-150'>
            <div className='flex flex-col w-full'>
              <form className='flex flex-col gap-4 p-6'>
                {['currentPassword', 'newPassword', 'confirmNewPassword'].map((field) => (
                  <div key={field}>
                    <label
                      htmlFor={field}
                      className='block mb-2 text-sm font-medium text-gray-500 dark:text-white'>
                      {field
                        .replace(/([a-z])([A-Z])/g, '$1 $2')
                        .replace(/^\w/, (c) => c.toUpperCase())}
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none'>
                        <Lock />
                      </div>
                      <input
                        type='password'
                        id={field}
                        value={passwords[field]}
                        onChange={handleChange}
                        className='bg-white border border-gray-200 focus:border-gray-200 focus:bg-gray-100 text-gray-900 text-sm rounded-lg block w-full pl-10 p-3 dark:placeholder-white-400 dark:text-white'
                        placeholder='•••••••••'
                        required
                      />
                    </div>
                  </div>
                ))}
              </form>
              <div className='border-b border-gray-200 dark:border-gray-700' />
              <div className='flex justify-end p-4 gap-2'>
                <button
                  type='button'
                  onClick={handleReset}
                  className='bg-white text-gray-500 border border-gray-200 text-sm font-medium py-3 px-4 rounded focus:outline-none focus:shadow-outline'>
                  Cancel
                </button>
                <button
                  type='button'
                  data-testid='save-button'
                  onClick={handleSubmit}
                  disabled={isDisabled}
                  className={`text-white text-sm font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                    isDisabled
                      ? 'bg-blue-300 opacity-50 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Password;
