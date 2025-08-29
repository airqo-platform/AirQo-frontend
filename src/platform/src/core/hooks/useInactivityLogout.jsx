import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import LogoutUser from '@/core/HOC/LogoutUser';

const useInactivityLogout = (userId) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const INACTIVITY_TIMEOUT = 3600000; // 1 hour in milliseconds
  const CHECK_INTERVAL = 10000; // 10 seconds
  const lastActivityRef = useRef(Date.now());
  const intervalRef = useRef(null);
  const listenersAddedRef = useRef(false);

  useEffect(() => {
    if (!userId) return;

    const resetTimer = () => {
      lastActivityRef.current = Date.now();
    };

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
    ];

    // Add event listeners only once
    if (!listenersAddedRef.current) {
      activityEvents.forEach((event) =>
        window.addEventListener(event, resetTimer, { passive: true }),
      );
      listenersAddedRef.current = true;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      if (Date.now() - lastActivityRef.current > INACTIVITY_TIMEOUT) {
        LogoutUser(dispatch, router);
        // Clear interval after logout
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, CHECK_INTERVAL);

    return () => {
      // Clear interval on cleanup
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Remove event listeners on cleanup
      if (listenersAddedRef.current) {
        activityEvents.forEach((event) =>
          window.removeEventListener(event, resetTimer),
        );
        listenersAddedRef.current = false;
      }
    };
  }, [dispatch, router, userId]);
};

export default useInactivityLogout;
