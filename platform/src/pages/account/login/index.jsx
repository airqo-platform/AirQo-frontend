import React, { useState } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { setUserName, setUserPassword, loginUser } from '@/lib/store/services/account/LoginSlice';

const UserLogin = () => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [error, setError] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const postData = useSelector((state) => state.login);

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(setUserName(email));
    dispatch(setUserPassword(password));
    await dispatch(loginUser({ userName: email, password })).then(() => {
      if (postData.success) router.push('/analytics');
      else setError(true);
    });
  };

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
                onChange={(e) => setEmail(e.target.value)}
                placeholder='e.g. greta.nagawa@gmail.com'
                className='input w-full rounded-none bg-form-input focus:outline-form-input focus:outline-none focus:outline-offset-0'
                required
              />
              <div className='text-xs mt-6'>Password</div>
              <input
                onChange={(e) => setPassword(e.target.value)}
                type='password'
                placeholder='******'
                className='input w-full rounded-none bg-form-input focus:outline-form-input focus:outline-none focus:outline-offset-0'
                required
              />
              {error && <div className='text-xs text-red-600 py-2'>{postData.errors}</div>}
              <button
                className='mt-6 btn bg-blue-900 rounded-none w-full text-sm outline-none border-none hover:bg-blue-950'
                type='submit'>
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
