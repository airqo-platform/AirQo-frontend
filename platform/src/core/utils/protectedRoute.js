import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { resetStore } from '@/lib/store/services/account/LoginSlice';

export default function withAuth(Component) {
  return () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const userCredentials = useSelector((state) => state.login);

    // session timeout after 30 minutes
    useEffect(() => {
      if (userCredentials.success) {
        setTimeout(() => {
          localStorage.clear();
          dispatch(resetStore());
          router.push('/account/login');
        }, 1800000); // 30 minutes
      }
    }, [userCredentials]);

    useEffect(() => {
      if (!userCredentials.success) {
        router.push('/account/login');
      }
    }, [userCredentials]);

    return userCredentials.success && <Component />;
  };
}
