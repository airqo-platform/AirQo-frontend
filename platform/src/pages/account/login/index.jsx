import React, { useEffect, useState } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { setUserName, setUserPassword } from '@/lib/store/services/account/LoginSlice';
import { postUserLoginDetails, getUserDetails } from '@/core/apis/Account';
import setAuthToken from '@/core/utils/setAuthToken';
import jwt_decode from 'jwt-decode';
import { setFailure, setSuccess, setUserInfo } from '@/lib/store/services/account/LoginSlice';
import Link from 'next/link';
import Spinner from '@/components/Spinner';

const UserLogin = () => {
  const [errors, setErrors] = useState(false);
  const [error, setError] = useState();
  const dispatch = useDispatch();
  const router = useRouter();
  const postData = useSelector((state) => state.login);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    await postUserLoginDetails(postData.userData)
      .then((res) => {
        const { token } = res;
        localStorage.setItem('token', token);
        setAuthToken(token);
        // Decode token to get user data
        const decoded = jwt_decode(token);

        getUserDetails(decoded._id, token)
          .then((response) => {
            localStorage.setItem('loggedUser', JSON.stringify(response.users[0]));
            if (response.users[0].groups && !response.users[0].groups[0].grp_title) {
              dispatch(setSuccess(false));
              dispatch(
                setFailure('Server error. Contact support to add you to the AirQo Organisation'),
              );
              setErrors(true);
              setError('Server error. Contact support to add you to the AirQo Organisation');
              setLoading(false);
              return;
            }
            // find airqo group in the users groups and set it as the active group
            const airqoGroup = response.users[0].groups.find(
              (group) => group.grp_title === 'airqo',
            );
            localStorage.setItem('activeGroup', JSON.stringify(airqoGroup));
            dispatch(setUserInfo(response.users[0]));
            dispatch(setSuccess(true));
            setLoading(false);
            router.push('/Home');
          })
          .catch((error) => {
            dispatch(setSuccess(false));
            dispatch(
              setFailure(error?.response?.data.message || 'Something went wrong, please try again'),
            );
            setErrors(true);
            setError(error?.response?.data.message || 'Something went wrong, please try again');
            setLoading(false);
          });
      })
      .catch((error) => {
        dispatch(setSuccess(false));
        dispatch(
          setFailure(error?.response?.data.message || 'Something went wrong, please try again'),
        );
        setErrors(true);
        setError(error?.response?.data.message || 'Something went wrong, please try again');
        setLoading(false);
      });
  };

  return (
    <AccountPageLayout>
      <div className='w-full'>
        <h2 className='text-3xl text-black-700 font-medium'>Lets get started</h2>
        <p className='text-xl text-black-700 font-normal mt-3'>
          Get access to air quality analytics across Africa
        </p>
        <form className='mt-6' onSubmit={handleLogin} data-testid='login-form'>
          <div className='w-full'>
            <div className='text-xs'>User Name</div>
            <div className='mt-2 w-full'>
              <input
                data-testid='username'
                onChange={(e) => dispatch(setUserName(e.target.value))}
                placeholder='e.g. greta.nagawa@gmail.com'
                className='input w-full rounded-none bg-form-input focus:outline-form-input focus:outline-none focus:outline-offset-0'
                required
              />
              <div className='text-xs mt-6'>Password</div>
              <input
                data-testid='password'
                onChange={(e) => dispatch(setUserPassword(e.target.value))}
                type='password'
                placeholder='******'
                className='input w-full rounded-none bg-form-input focus:outline-form-input focus:outline-none focus:outline-offset-0'
                required
              />
              <div data-testid='alert-box'>
                {errors && <div className='text-sm text-red-600 py-2 capitalize'>{error}</div>}
              </div>
              <button
                data-testid='login-btn'
                className='mt-6 btn bg-blue-900 rounded-none w-full text-sm outline-none border-none hover:bg-blue-950'
                type='submit'>
                {loading ? <Spinner data-testid='spinner' width={25} height={25} /> : 'Login'}
              </button>
            </div>
          </div>
        </form>
        <div className='mt-8'>
          <span className='text-sm text-grey-300'>Don't have an account?</span>
          <span className='text-sm text-blue-900 font-medium'>
            {' '}
            <Link href='/account/creation'>Register here</Link>
          </span>
        </div>
      </div>
    </AccountPageLayout>
  );
};

export default UserLogin;
