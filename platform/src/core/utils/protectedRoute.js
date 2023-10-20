import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { resetStore } from '@/lib/store/services/account/LoginSlice';

// Custom hook to handle user inactivity
const useIdleTimer = (action, idleTime) => {
  useEffect(() => {
    let timer;
    const handleUserActivity = () => {
      clearTimeout(timer);
      timer = setTimeout(action, idleTime);
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
    };
  }, [action, idleTime]);
};

export default function withAuth(Component) {
  return () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const userCredentials = useSelector((state) => state.login);

    const logout = () => {
      localStorage.clear();
      dispatch(resetStore());
      router.push('/account/login');
    };

    // Use custom hook to handle user inactivity
    useIdleTimer(logout, 1800000);

    useEffect(() => {
      if (!userCredentials.success) {
        router.push('/account/login');
      }
    }, [userCredentials]);

    return userCredentials.success && <Component />;
  };
}
