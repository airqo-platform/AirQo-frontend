'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useUserDetails } from '@/shared/hooks/useAuth';
import {
  setUser,
  setGroups,
  setLoading,
  setError,
  clearUser,
} from '@/shared/store/userSlice';
import { normalizeUser, normalizeGroups } from '@/shared/utils/userUtils';
import {
  selectActiveGroup,
  selectUser,
  selectLoggingOut,
} from '@/shared/store/selectors';
import { useLogout } from '@/shared/hooks/useLogout';
import type { User } from '@/shared/types/api';

/**
 * Component that automatically fetches and stores user data when authenticated
 * Optimized to prevent loops, conflicts, and repeated API calls
 * Note: Preferences are handled by individual components using useUserPreferences directly
 */
export function UserDataFetcher({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const activeGroup = useSelector(selectActiveGroup);
  const user = useSelector(selectUser);
  const logout = useLogout();
  const isLoggingOut = useSelector(selectLoggingOut);

  // Memoize userId to prevent unnecessary re-calculations
  const userId = useMemo(() => {
    return session?.user && '_id' in session.user
      ? (session.user as { _id: string })._id
      : null;
  }, [session?.user]);

  // Fetch user details only when userId is available and stable
  const { data, error, isLoading } = useUserDetails(userId);

  // Clear user data when userId changes (different user logged in)
  const prevUserIdRef = useRef(userId);
  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    if (userId !== prevUserId && userId) {
      dispatch(clearUser());
      hasLoggedOutForNoGroupRef.current = false; // Reset for new user
    }
  }, [userId, dispatch]);

  // Use refs to track previous values and prevent unnecessary dispatches
  const prevStatusRef = useRef(status);
  const prevDataRef = useRef(data);
  const prevErrorRef = useRef(error);
  const prevIsLoadingRef = useRef(isLoading);
  const hasLoggedOutForNoGroupRef = useRef(false);

  // Handle authentication status changes
  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;

    // Only dispatch when status actually changes and we're not logging out
    if (status !== prevStatus) {
      if (status === 'unauthenticated' && !isLoggingOut) {
        dispatch(clearUser());
      }
    }
  }, [status, dispatch, isLoggingOut]);

  // Handle loading state changes
  useEffect(() => {
    const prevIsLoading = prevIsLoadingRef.current;
    prevIsLoadingRef.current = isLoading;

    // Only dispatch when loading state actually changes
    if (isLoading !== prevIsLoading) {
      dispatch(setLoading(isLoading));
    }
  }, [isLoading, dispatch]);

  // Handle error changes
  useEffect(() => {
    const prevError = prevErrorRef.current;
    prevErrorRef.current = error;

    // Only dispatch when error actually changes
    if (error !== prevError) {
      if (error) {
        dispatch(setError(error.message || 'Failed to fetch user data'));
      } else {
        dispatch(setError(null));
      }
    }
  }, [error, dispatch]);

  // Handle successful data fetching
  useEffect(() => {
    const prevData = prevDataRef.current;
    prevDataRef.current = data;

    // Only process data when it actually changes and is valid
    if (data !== prevData && data?.users && data.users.length > 0) {
      const user = data.users[0] as User;
      const normalizedUser = normalizeUser(user);
      const normalizedGroups = normalizeGroups(user.groups);

      if (normalizedUser) {
        // Batch dispatches to prevent multiple re-renders
        dispatch(setUser(normalizedUser));
        dispatch(setGroups(normalizedGroups));
        dispatch(setError(null));
      } else {
        // Avoid keeping stale user data when backend responds with an invalid shape
        dispatch(clearUser());
        dispatch(setGroups([]));
        dispatch(setError('Invalid user data received from API'));
      }
    }
  }, [data, dispatch]);

  // Check if user has no active group after data is loaded and logout if necessary
  useEffect(() => {
    if (
      user &&
      !activeGroup &&
      !isLoading &&
      !hasLoggedOutForNoGroupRef.current
    ) {
      console.log('User has no active group, logging out to prevent issues');
      hasLoggedOutForNoGroupRef.current = true;
      logout();
    }
  }, [activeGroup, user, logout, isLoading]);

  // Note: Preferences are managed entirely by SWR in individual components to prevent loops
  // The Redux preferences store is used for cross-component state sharing, not data fetching

  return <>{children}</>;
}
