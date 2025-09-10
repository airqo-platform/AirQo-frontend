'use client';

import { useEffect, useCallback } from 'react';
import { AqCheck } from '@airqo/icons-react';
import { useRouter, useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUserId } from '@/lib/store/services/account/CreationSlice';
import { verifyUserEmailApi } from '@/core/apis/Account';

const UserCreationSuccess = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useParams();
  const { id, token } = params;

  const verifyOrgManagerEmail = useCallback(
    async (userId, userToken) => {
      try {
        await verifyUserEmailApi(userId, userToken);
        router.push(
          `/user/creation/organisation/verify/${id}/create-org/token-confirmation`,
        );
      } catch {
        // TODO:ADD LATER
      }
    },
    [router, id],
  );

  useEffect(() => {
    if (id) {
      dispatch(setUserId(id));
      setTimeout(() => {
        verifyOrgManagerEmail(id, token);
      }, 4000);
    }
  }, [id, token, dispatch, router, verifyOrgManagerEmail]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <div>
        <AqCheck className="w-8 h-8" />
      </div>
      <div className="text-2xl font-semibold mt-4">Email Verified</div>
    </div>
  );
};

export default UserCreationSuccess;
