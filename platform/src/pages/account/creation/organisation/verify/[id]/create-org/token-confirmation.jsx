import React, { useEffect, useState } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import ProgressComponent from '@/components/Account/ProgressComponent';
import HintIcon from '@/icons/Actions/exclamation.svg';
import { useDispatch, useSelector } from 'react-redux';
import SearchIcon from '@/icons/Common/search_md.svg';
import Spinner from '@/components/Spinner';
import { useRouter } from 'next/router';
import Link from 'next/link';

const ConfirmOrganizationToken = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  return (
    <AccountPageLayout
      childrenHeight={'lg:h-[500]'}
      childrenTop={'mt-8'}
      rightText={
        "What you've built here is so much better for air pollution monitoring than anything else on the market!"
      }
    >
      <ProgressComponent colorFirst colorSecond />
      <div>
        <h2 className='text-3xl text-black-800 font-semibold'>
          Please enter your organisation token
        </h2>
        <p className='text-base text-black-800 font-normal mt-3'>
          The organisation token is provided by AirQo
        </p>
        <form onSubmit={handleSubmit}>
          <div className='mt-8'>
            <div className='w-full'>
              <div className='text-sm text-secondary-neutral-light-600'>Organization token</div>
              <div className='mt-2 w-full'>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  type='text'
                  placeholder='Enter your token'
                  className={`input w-full p-3 rounded-[4px] border-gray-300 focus:outline-none focus:ring-0 placeholder-gray-300 focus:border-green-500`}
                  required
                />
                {email.length >= 3 && !email.includes('@') && (
                  <div className='flex flex-row items-start text-xs text-red-600 py-2'>
                    <HintIcon className='w-8 h-8 mr-2' />
                    <span>Please provide a valid email address!</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='mt-6'>
            <div className='flex flex-col-reverse md:flex-row items-center justify-start md:justify-between'>
              <div className='w-full'>
                <button
                  style={{ textTransform: 'none' }}
                  type='submit'
                  onClick={
                    password !== '' && !passwordWordErrors && checked ? handleSubmit : undefined
                  }
                  className={`w-full btn text-sm outline-none border-none rounded-[12px] ${
                    password !== '' && !passwordWordErrors && checked
                      ? 'bg-blue-900 text-white hover:bg-blue-950'
                      : 'btn-disabled bg-white'
                  }`}
                >
                  {loading && password !== '' && !passwordWordErrors && checked ? (
                    <Spinner data-testid='spinner' width={25} height={25} />
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className='mt-8 w-full flex justify-start'>
            <div className='flex flex-col gap-3'>
              <div className='text-sm text-blue-960 font-medium'>Don't have a token?</div>
              <div className='text-sm text-blue-900'>
                {' '}
                <Link href='/account/login'>Contact admin</Link>
              </div>
              <div className='text-sm text-blue-900'>
                {' '}
                <Link href='/account/login'>Proceed as an individual</Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AccountPageLayout>
  );
};

export default ConfirmOrganizationToken;
