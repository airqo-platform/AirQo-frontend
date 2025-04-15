import React, { useState } from 'react';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import AccountPageLayout from '@/components/Account/Layout';
import {
  createUser,
  setUserFirstName,
  setUserLastName,
  setUserPassword,
  setUserEmail,
} from '@/lib/store/services/account/CreationSlice';
import HintIcon from '@/icons/Actions/exclamation.svg';
import VisibilityOffIcon from '@/icons/Account/visibility_off.svg';
import VisibilityOnIcon from '@/icons/Account/visibility_on.svg';
import Toast from '@/components/Toast';
import { useRouter } from 'next/router';
import Spinner from '@/components/Spinner';

const OrganisationIndividualAccountCreation = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordType, setPasswordType] = useState('password');
  const [passwordWordErrors, setPasswordWordErrors] = useState(false);
  let passwordRegex = new RegExp(
    '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&.*,]).{6,}$',
  );

  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [creationErrors, setCreationErrors] = useState({
    state: false,
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
        createUser({
          email,
          firstName,
          lastName,
          password,
          category: 'organisation',
        }),
      );
      if (!response.payload.success) {
        setCreationErrors({
          state: true,
          message: response.payload.errors,
        });
      } else {
        router.push('/account/creation/organisation/verify-email');
      }
    } catch (err) {
      return err;
    }
    setLoading(false);
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

  const toggleChecked = () => {
    if (checked) {
      setChecked(false);
    } else setChecked(true);
  };
  return (
    <AccountPageLayout
      childrenHeight={'lg:h-[680]'}
      childrenTop={'mt-20'}
      pageTitle={'Create Account | AirQo'}
    >
      <div className="w-full">
        <h2 className="text-3xl text-black-700 font-medium">
          Let&apos;s get started
        </h2>
        <p className="text-xl text-black-700 font-normal mt-3">
          Get access to air quality analytics across Africa
        </p>
        {creationErrors.state && (
          <Toast
            type={'error'}
            timeout={8000}
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
          <div className="mt-6">
            <div className="flex flex-row justify-between">
              <div className="w-full">
                <div className="text-sm text-gray-500">First name*</div>
                <div className="mt-2 w-11/12">
                  <input
                    onChange={(e) => {
                      setFirstName(e.target.value);
                    }}
                    type="text"
                    placeholder="Enter your name"
                    className={`input w-full p-3 rounded-[4px] border-gray-300 focus:outline-none focus:ring-0 placeholder-gray-300 focus:border-green-500`}
                    pattern="[A-Za-z]{3,}"
                    required
                  />
                </div>
              </div>
              <div className="w-full">
                <div className="text-sm text-gray-500">Last name*</div>
                <div className="mt-2 w-full">
                  <input
                    onChange={(e) => {
                      setLastName(e.target.value);
                    }}
                    type="text"
                    placeholder="Enter your name"
                    className={`input w-full p-3 rounded-[4px] border-gray-300 focus:outline-none focus:ring-0 placeholder-gray-300 focus:border-green-500`}
                    pattern="[A-Za-z]{2,}"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="w-full">
              <div className="text-sm text-gray-500">Email address*</div>
              <div className="mt-2 w-full">
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Enter your email"
                  className={`input w-full p-3 rounded-[4px] border-gray-300 focus:outline-none focus:ring-0 placeholder-gray-300 focus:border-green-500 ${
                    email.length >= 3 && !email.includes('@')
                      ? 'border-red-600'
                      : ''
                  }`}
                  required
                />
                {email.length >= 3 && !email.includes('@') && (
                  <div className="flex flex-row items-start text-xs text-red-600 py-2">
                    <HintIcon className="w-8 h-8 mr-2" />
                    <span>Please provide a valid email address!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="w-full">
              <div className="text-xs">Password*</div>
              <div className="mt-2 w-full relative">
                <input
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                  pattern="^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&]).{8,}$"
                  minLength={'6'}
                  maxLength={'20'}
                  type={passwordType}
                  placeholder="Create password"
                  className={`input w-full p-3 rounded-[4px] border-gray-300 focus:outline-none focus:ring-0 placeholder-gray-300 focus:border-green-500 focus:${
                    passwordWordErrors ? 'border-red-600' : ''
                  } ${passwordWordErrors ? 'border-red-600' : ''}`}
                  required
                />
                <span className="text-gray-400 text-sm">
                  Must be at least 8 characters
                </span>
                <div
                  onClick={showPassword}
                  className="absolute right-4 top-[25px]  transform -translate-y-1/2 cursor-pointer"
                >
                  {passwordType === 'password' ? (
                    <VisibilityOffIcon />
                  ) : (
                    <VisibilityOnIcon className="stroke-1 stroke-svg-green" />
                  )}
                </div>
              </div>
              {passwordWordErrors && (
                <div className="flex flex-row items-start text-xs text-red-600 py-2">
                  <HintIcon className="w-8 h-8 mr-2" />{' '}
                  <span>
                    Password must be more than 6 characters and contain an
                    uppercase letter(A-Z), lowercase letter(a-z), a number(0-9)
                    and special character(#?!@$%^&.*,)
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6">
            <div className="flex flex-row items-center">
              <div>
                <input
                  type="checkbox"
                  className="default:bg-white h-6 w-6 rounded border border-check-box checked:bg-blue-900 focus:border-check-box hover:cursor-pointer"
                  onChange={(event) => toggleChecked(event)}
                  required
                />
              </div>
              <div className="ml-3">
                <p className="text-xs">
                  I agree to the{' '}
                  <a href="#" className="underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="mt-10">
            <div className="flex flex-col-reverse md:flex-row items-center justify-start md:justify-between">
              <div className="w-full">
                <button
                  style={{ textTransform: 'none' }}
                  type="submit"
                  onClick={
                    password !== '' && !passwordWordErrors && checked
                      ? handleSubmit
                      : undefined
                  }
                  className={`w-full btn text-sm outline-none border-none rounded-[12px] ${
                    password !== '' && !passwordWordErrors && checked
                      ? 'bg-blue-900 text-white hover:bg-blue-950'
                      : 'btn-disabled bg-white'
                  }`}
                >
                  {loading &&
                  password !== '' &&
                  !passwordWordErrors &&
                  checked ? (
                    <Spinner data-testid="spinner" width={25} height={25} />
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 w-full flex justify-center">
            <div>
              <span className="text-sm text-grey-300">
                Already have an account?
              </span>
              <span className="text-sm text-blue-900 font-medium">
                {' '}
                <Link href="/account/login">Log in</Link>
              </span>
            </div>
          </div>
        </form>
      </div>
    </AccountPageLayout>
  );
};

export default OrganisationIndividualAccountCreation;
