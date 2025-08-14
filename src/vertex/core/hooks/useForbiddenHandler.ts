import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setForbiddenState } from '@/core/redux/slices/userSlice';

export const useForbiddenHandler = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleForbiddenAccess = (event: CustomEvent) => {
      dispatch(setForbiddenState({
        message: event.detail.message,
        timestamp: event.detail.timestamp,
        url: event.detail.url,
      }));
    };

    // Listen for forbidden access events
    window.addEventListener('forbidden-access', handleForbiddenAccess as EventListener);

    return () => {
      window.removeEventListener('forbidden-access', handleForbiddenAccess as EventListener);
    };
  }, [dispatch]);
};