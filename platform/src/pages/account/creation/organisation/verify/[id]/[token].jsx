import React, { useEffect } from 'react';
import VerifiedIcon from '@/icons/Account/verified.svg';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setUserId } from '@/lib/store/services/account/CreationSlice';
import { verifyUserEmailApi } from '@/core/apis/Account';

const UserCreationSuccess = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { id } = router.query;
  const { token } = router.query;

  const verifyOrgManagerEmail = async (userId, userToken) => {
    try {
      await verifyUserEmailApi(userId, userToken);
      router.push(`/account/creation/organisation/verify/${id}/create-org/details`);
    } catch {}
  };

  useEffect(() => {
    dispatch(setUserId(id));
    setTimeout(() => {
      verifyOrgManagerEmail(id, token);
    }, 4000);
  }, [router, id]);

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
