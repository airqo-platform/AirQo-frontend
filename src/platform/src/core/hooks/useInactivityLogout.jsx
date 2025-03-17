import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import LogoutUser from '@/core/utils/LogoutUser';

const useInactivityLogout = (userId) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const INACTIVITY_TIMEOUT = 3600000; // 1 hour in milliseconds
  const CHECK_INTERVAL = 10000; // 10 seconds

  useEffect(() => {
    if (!userId) return;

    let lastActivity = Date.now();

    const resetTimer = () => {
      lastActivity = Date.now();
    };

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
    ];
    activityEvents.forEach((event) =>
      window.addEventListener(event, resetTimer),
    );

    const intervalId = setInterval(() => {
      if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
        LogoutUser(dispatch, router);
      }
    }, CHECK_INTERVAL);

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, resetTimer),
      );
      clearInterval(intervalId);
    };
  }, [dispatch, router, userId]);
};

export default useInactivityLogout;
