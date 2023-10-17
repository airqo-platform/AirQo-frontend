import React from 'react';
import VerifiedIcon from '@/icons/Account/verified.svg';

const UserCreationSuccess = () => {
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
