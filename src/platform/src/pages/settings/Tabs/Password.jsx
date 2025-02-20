import React, { useState } from 'react';
import Lock from '@/icons/Settings/lock.svg';
import { updateUserPasswordApi } from '@/core/apis/Settings';
import { useSelector } from 'react-redux';
import AlertBox from '@/components/AlertBox';
import Spinner from '@/components/Spinner';
import ContentBox from '@/components/Layout/content_box';
import Button from '@/components/Button';

const Password = () => {
  const userInfo = useSelector((state) => state.login.userInfo);
  const [isDisabled, setIsDisabled] = useState(false);
  let passwordRegex = new RegExp(
    '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&.*,]).{6,}$',
  );
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

    if (!passwordRegex.test(newPassword)) {
      setIsError({
        isError: true,
        message:
          'Password must contain at least 6 characters, including UPPER/lowercase and numbers and special characters (e.g. !@#$%^&*).',
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
      console.log(error);
      setIsError({
        isError: true,
        message:
          error.message || 'Something went wrong. Please try again later.',
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
    <div data-testid="tab-content">
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
      <div
        className="grid 
          grid-cols-1 md:grid-cols-3 gap-2 items-start
          "
      >
        <div>
          <h1 className="text-2xl font-medium">Password</h1>
          <p className="text-sm text-gray-500">
            Enter your current password to change your password.
          </p>
        </div>
        <div className="md:col-span-2">
          <ContentBox>
            <div className="w-full ">
              <div className="border-[0.5px] rounded-lg border-grey-150">
                <div className="flex flex-col w-full">
                  <form
                    className="flex flex-col gap-4 p-6"
                    data-testid="form-box"
                  >
                    {[
                      'currentPassword',
                      'newPassword',
                      'confirmNewPassword',
                    ].map((field) => (
                      <div key={field}>
                        <label
                          htmlFor={field}
                          className="block mb-2 text-sm font-medium text-gray-500 dark:text-white"
                        >
                          {field
                            .replace(/([a-z])([A-Z])/g, '$1 $2')
                            .replace(/^\w/, (c) => c.toUpperCase())}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                            <Lock />
                          </div>
                          <input
                            type="password"
                            id={field}
                            value={passwords[field]}
                            onChange={handleChange}
                            className="bg-white border border-gray-200 focus:border-gray-200 focus:bg-gray-100 text-gray-900 text-sm rounded-lg block w-full pl-10 p-3 dark:placeholder-white-400 dark:text-white"
                            placeholder="•••••••••"
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </form>
                  <div className="border-b border-gray-200 dark:border-gray-700" />
                  <div className="flex justify-end p-4 gap-2">
                    <Button
                      type="button"
                      onClick={handleReset}
                      variant="outlined"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      data-testid="save-button"
                      onClick={handleSubmit}
                      disabled={isDisabled}
                      className={` ${
                        isDisabled
                          ? 'bg-blue-300 opacity-50 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isDisabled ? (
                        <div className="flex">
                          <span className="mb-1 mr-1">
                            <Spinner width={16} height={16} />
                          </span>
                          Saving...
                        </div>
                      ) : (
                        'Save'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </ContentBox>
        </div>
      </div>
    </div>
  );
};

export default Password;
