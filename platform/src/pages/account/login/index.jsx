import React, { useEffect, useState } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { setUserName, setUserPassword, loginUser } from '@/lib/store/services/account/LoginSlice';
import { postUserLoginDetails } from '../../../core/apis/Account';
import setAuthToken from '@/core/utils/setAuthToken';
import jwt_decode from 'jwt-decode';
import { setFailure, setSuccess, setUserInfo } from '@/lib/store/services/account/LoginSlice';

const UserLogin = () => {
  const [errors, setErrors] = useState(false);
  const [error, setError] = useState();
  const dispatch = useDispatch();
  const router = useRouter();
  const postData = useSelector((state) => state.login);

  const handleLogin = async (e) => {
    e.preventDefault();
    try{
      await postUserLoginDetails(postData.userData)
      .then((res) => {
          const { token } = res;
          localStorage.setItem('token', token);
          setAuthToken(token);
          // Decode token to get user data
          const decoded = jwt_decode(token);
          localStorage.setItem('loggedUser', JSON.stringify(decoded));
          dispatch(setUserInfo(decoded))
          dispatch(setSuccess(true))
          router.push('/analytics')
      })
      .catch((error) => {
          dispatch(setSuccess(false))
          dispatch(setFailure(error.message))
          setErrors(true)
          setError(error.message);
      })
    }catch(error){
        alert(error)
    }
  };

  const handleErrors = () => {
    if (errors) {
      setError(false);
      setErrors();
    }
  };

  useEffect(() => {
    setErrors(false);
  }, []);

  return (
    <AccountPageLayout>
      <div className='w-full'>
        <h2 className='text-3xl text-black-700 font-medium'>Lets get started</h2>
        <p className='text-xl text-black-700 font-normal mt-3'>
          Get access to air quality analytics across Africa
        </p>
        <form className='mt-6' onSubmit={handleLogin}>
          <div className='w-full'>
            <div className='text-xs'>User Name</div>
            <div className='mt-2 w-full'>
              <input
                onChange={(e) => dispatch(setUserName(e.target.value))}
                placeholder='e.g. greta.nagawa@gmail.com'
                className='input w-full rounded-none bg-form-input focus:outline-form-input focus:outline-none focus:outline-offset-0'
                required
              />
              <div className='text-xs mt-6'>Password</div>
              <input
                onChange={(e) => dispatch(setUserPassword(e.target.value))}
                type='password'
                placeholder='******'
                className='input w-full rounded-none bg-form-input focus:outline-form-input focus:outline-none focus:outline-offset-0'
                required
              />
              <div>
                {errors && (
                  <div className='text-sm text-red-600 py-2'>{error || 'Please Retry'}</div>
                )}
              </div>
              <button
                className='mt-6 btn bg-blue-900 rounded-none w-full text-sm outline-none border-none hover:bg-blue-950'
                type='submit'
                onClick={handleErrors}>
                Login
              </button>
            </div>
          </div>
        </form>
      </div>
    </AccountPageLayout>
  );
};

export default UserLogin;
