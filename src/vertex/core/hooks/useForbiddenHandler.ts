import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/core/redux/hooks';
import { setForbiddenState } from '@/core/redux/slices/userSlice';

export const useForbiddenHandler = () => {
  const dispatch = useDispatch();
  const isOrganizationSwitching = useAppSelector(
    (state) => state.user.organizationSwitching.isSwitching
  );

  useEffect(() => {
    const handleForbiddenAccess = (event: CustomEvent) => {
      // During org switching, stale in-flight admin requests can emit 403.
      // Ignore these transient events to avoid flashing a global forbidden page.
      if (isOrganizationSwitching) {
        return;
      }

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
  }, [dispatch, isOrganizationSwitching]);
};