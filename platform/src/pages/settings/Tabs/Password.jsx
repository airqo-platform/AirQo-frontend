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
        message: error.message || 'Something went wrong. Please try again later.',
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
      <div data-testid='tab-content' className='px-3 lg:px-16 py-3'>
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
        <div className='flex justify-start flex-col md:grid md:grid-cols-3 gap-4 items-start'>
          <div className='md:col-span-1'>
            <h1 className='text-2xl font-medium'>Password</h1>
            <p className='text-sm text-gray-500'>
              Enter your current password to change your password.
            </p>
          </div>
          <div className='md:col-span-2 w-full'>
            <div className='border-[0.5px] rounded-lg border-grey-150'>
              <div className='flex flex-col w-full'>
                <form className='flex flex-col gap-4 p-6' data-testid='form-box'>
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
                    {isDisabled ? (
                      <>
                        <svg
                          aria-hidden='true'
                          role='status'
                          className='inline w-4 h-4 mr-3 mb-1 text-white animate-spin'
                          viewBox='0 0 100 101'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'>
                          <path
                            d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                            fill='#E5E7EB'
                          />
                          <path
                            d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                            fill='currentColor'
                          />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Password;
