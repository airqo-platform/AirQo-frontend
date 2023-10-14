import React, { useState } from 'react';
import Lock from '@/icons/Settings/lock.svg';
import Toast from '@/components/Toast';

const Password = () => {
  const [isError, setIsError] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your submit logic here
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
      {isError && (
        <Toast
          type={'success'}
          timeout={5000}
          message={'Uh-oh! Server error. Please try again later.'}
        />
      )}
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
              <form onSubmit={handleSubmit} className='flex flex-col gap-4 p-6'>
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
                  type='submit'
                  className='bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline'>
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
