import React, { useEffect } from 'react';
import VerifiedIcon from '@/icons/Account/verified.svg';
import { useRouter } from 'next/router';

const UserCreationSuccess = () => {
  const router = useRouter();
  useEffect(() => {
    setTimeout(() => {
      router.push('/account/creation/organisation/create-org/details');
    }, 2000);
  }, []);
  
  return (
    <div className='w-full h-screen flex flex-col items-center justify-center'>
      <div>
        <VerifiedIcon />
      </div>
      <div className='text-2xl font-semibold mt-4'>Email Verified</div>
    </div>
  );
};

export default UserCreationSuccess;
