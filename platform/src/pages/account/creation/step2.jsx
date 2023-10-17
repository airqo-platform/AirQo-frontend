import React, { useState } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { createUser } from '@/lib/store/services/account/CreationSlice';
import {
  setUserFirstName,
  setUserLastName,
  setUserPassword,
  setUserEmail
} from '@/lib/store/services/account/CreationSlice';
import { useRouter } from 'next/router';
import HintIcon from '@/icons/Actions/exclamation.svg';
import VisibilityOffIcon from '@/icons/Account/visibility_off.svg';
import VisibilityOnIcon from '@/icons/Account/visibility_on.svg';
import Toast from '@/components/Toast';

const AccountCreationPage2 = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordType, setPasswordType] = useState('password');
  const [passwordWordErrors, setPasswordWordErrors] = useState(false);
  let passwordRegex = new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&.*,]).{6,}$');

  const dispatch = useDispatch();
  const router = useRouter();
  const [creationErrors, setCreationErrors] = useState({
    state: false,
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setUserEmail(email));
    dispatch(setUserFirstName(firstName));
    dispatch(setUserLastName(lastName));
    dispatch(setUserPassword(password));
    setCreationErrors({
      state: false,
      message: '',
    });

    try {
      const response = await dispatch(
        createUser({ email, firstName, lastName, password }),
      );
      if (!response.payload.success) {
        setCreationErrors({
          state: true,
          message: response.payload.errors,
        });
      } else {
        router.push('/account/creation/step3');
      }
    } catch (err) {
      return err;
    }
  };

  const validatePassword = (password) => {
    if (passwordRegex.test(password)) {
      setPasswordWordErrors(false);
    } else setPasswordWordErrors(true);
  };

  const showPassword = () => {
    if (passwordType === 'password') {
      setPasswordType('text');
    } else {
      setPasswordType('password');
    }
  };

  const toggleChecked = (e) => {
    if (checked) {
      setChecked(false);
    } else setChecked(true);
  };

  return (
    <AccountPageLayout childrenHeight={'lg:h-[680]'} childrenTop={'mt-16'}>
      <div className='w-full'>
        <h2 className='text-3xl text-black-700 font-medium'>Let's get started</h2>
        <p className='text-xl text-black-700 font-normal mt-3'>
          Get access to air quality analytics across Africa
        </p>
        {creationErrors.state && (
          <Toast
            type={'error'}
            timeout={5000}
            message={`${
              creationErrors.message.email ||
              creationErrors.message.message ||
              creationErrors.message.password ||
              creationErrors.message.firstName ||
              creationErrors.message.lastName
            }`}
          />
        )}
        <form onSubmit={handleSubmit}>
          <div className='mt-6'>
            <div className='w-full'>
              <div className='text-xs'>Email address*</div>
              <div className='mt-2 w-full'>
                {email.length >= 3 && !email.includes('@') ? (
                  <>
                    <input
                      onChange={(e) => setEmail(e.target.value)}
                      type='email'
                      placeholder='e.g. greta.nagawa@gmail.com'
                      className='input w-full h-16 rounded-lg bg-form-input border-red-600'
                      required
                    />
                    <div className='flex flex-row items-start text-xs text-red-600 py-2'>
                      <HintIcon className='w-8 h-8 mr-2' />
                      <span>Please provide a valid email address!</span>
                    </div>
                  </>
                ) : (
                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    type='email'
                    placeholder='e.g. greta.nagawa@gmail.com'
                    className='input w-full h-16 rounded-lg bg-form-input focus:border-input-outline border-input-outline'
                    required
                  />
                )}
              </div>
            </div>
          </div>
          <div className='mt-6'>
            <div className='flex flex-row justify-between'>
              <div className='w-full'>
                <div className='text-xs'>First name*</div>
                <div className='mt-2 w-11/12'>
                  {firstName.length >= 3 ? (
                    <input
                      onChange={(e) => {
                        setFirstName(e.target.value);
                      }}
                      type='text'
                      placeholder='e.g. Greta'
                      className='input w-full h-16 rounded-lg bg-form-input border-input-outline focus:border-input-outline'
                      pattern='[A-Za-z]{3,}'
                      required
                    />
                  ) : (
                    <input
                      onChange={(e) => {
                        setFirstName(e.target.value);
                      }}
                      type='text'
                      placeholder='e.g. Greta'
                      className='input w-full h-16 rounded-lg bg-form-input border-none'
                      pattern='[A-Za-z]{3,}'
                      required
                    />
                  )}
                </div>
              </div>
              <div className='w-full'>
                <div className='text-xs'>Last name*</div>
                {lastName.length >= 2 ? (
                  <div className='mt-2 w-full'>
                    <input
                      onChange={(e) => {
                        setLastName(e.target.value);
                      }}
                      type='text'
                      placeholder='e.g. Nagawa'
                      className='input w-full h-16 rounded-lg bg-form-input border-input-outline focus:border-input-outline'
                      pattern='[A-Za-z]{2,}'
                      required
                    />
                  </div>
                ) : (
                  <div className='mt-2 w-full'>
                    <input
                      onChange={(e) => {
                        setLastName(e.target.value);
                      }}
                      type='text'
                      placeholder='e.g. Nagawa'
                      className='input w-full h-16 rounded-lg bg-form-input border-none'
                      pattern='[A-Za-z]{2,}'
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className='mt-6'>
            {firstName.length >= 3 && lastName.length >= 3 ? (
              <div className='w-full'>
                <div className='text-xs'>Password*</div>
                <div className='mt-2 flex flex-row justify-between'>
                  <div className='w-11/12'>
                    {passwordWordErrors ? (
                      <>
                        <input
                          onChange={(e) => {
                            setPassword(e.target.value);
                            validatePassword(e.target.value);
                          }}
                          pattern='^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&]).{8,}$'
                          minLength={'6'}
                          maxLength={'20'}
                          type={passwordType}
                          className={`input w-full h-16 rounded-lg bg-form-input focus:border-red-600 border-red-600`}
                          required
                        />
                        <div className='flex flex-row items-start text-xs text-red-600 py-2'>
                          <HintIcon className='w-8 h-8 mr-2' />{' '}
                          <span>
                            Password must be more than 6 characters and contain an uppercase
                            letter(A-Z), lowercase letter(a-z), a number(0-9) and special
                            character(#?!@$%^&.*,)
                          </span>
                        </div>
                      </>
                    ) : (
                      <input
                        onChange={(e) => {
                          setPassword(e.target.value);
                          validatePassword(e.target.value);
                        }}
                        pattern='^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&]).{8,}$'
                        minLength={'6'}
                        maxLength={'20'}
                        type={passwordType}
                        className={`input w-full h-16 rounded-lg bg-form-input focus:border-input-outline border-input-outline`}
                        required
                      />
                    )}
                  </div>
                  <div className='w-16 h-16 flex items-center p-4 justify-center hover:cursor-pointer'>
                    <div onClick={showPassword}>
                      {passwordType === 'password' && <VisibilityOffIcon />}
                      {passwordType === 'text' && (
                        <VisibilityOnIcon className='stroke-1 stroke-svg-green' />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className='mt-6'>
            <div className='flex flex-row items-center'>
              <div>
                <input
                  type='checkbox'
                  className='default:bg-white h-6 w-6 rounded border border-check-box checked:bg-blue-900 focus:border-check-box hover:cursor-pointer'
                  onChange={(event) => toggleChecked(event)}
                  required
                />
              </div>
              <div className='ml-3'>
                <p className='text-xs'>
                  I agree to the{' '}
                  <a href='#' className='underline'>
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href='#' className='underline'>
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className='mt-8'>
            <span className='text-sm text-grey-300'>Already have an account?</span>
            <span className='text-sm text-blue-900 font-medium'>
              {' '}
              <Link href='/account/login'>Log in</Link>
            </span>
          </div>
          <div className='mt-10'>
            <div className='flex flex-col-reverse md:flex-row items-center justify-start md:justify-between'>
              <div className='w-full md:w-1/3 mt-6 lg:mt-0'>
                <Link href='/account/creation'>
                  <button className='w-full text-sm btn bg-white rounded-none outline-none border-2 border-check-box hover:bg-gray-100 hover:border-inherit focus:border-inherit'>
                    <span style={{ color: '#353E52' }}>Back</span>
                  </button>
                </Link>
              </div>
              {password !== '' && !passwordWordErrors && checked ? (
                <div className='w-full md:w-1/3'>
                  <button
                    type='submit'
                    onClick={handleSubmit}
                    className='w-full btn bg-blue-900 rounded-none text-sm outline-none border-none hover:bg-blue-950'>
                    Continue
                  </button>
                </div>
              ) : (
                <div className='w-full md:w-1/3'>
                  <button
                    type='submit'
                    onClick={handleSubmit}
                    className='w-full btn btn-disabled bg-white rounded-none text-sm outline-none border-none'>
                    Continue
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </AccountPageLayout>
  );
};

export default AccountCreationPage2;
