import { useSession } from 'next-auth/react';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';

/**
 * Optimized session hook that reduces redundant useSession calls
 * Uses Redux state when available to minimize NextAuth session checks
 */
export const useOptimizedSession = () => {
  const { data: session, status } = useSession();
  const reduxUserInfo = useSelector((state) => state.login?.userInfo);
  const reduxActiveGroup = useSelector((state) => state.login?.activeGroup);

  // Memoize the combined session data to prevent unnecessary re-renders
  const optimizedSession = useMemo(() => {
    if (status === 'loading') {
      return {
        data: null,
        status: 'loading',
        isLoading: true,
        isAuthenticated: false,
      };
    }

    if (status === 'unauthenticated' || !session) {
      return {
        data: null,
        status: 'unauthenticated',
        isLoading: false,
        isAuthenticated: false,
      };
    }

    // Combine NextAuth session with Redux state for optimal performance
    const combinedSession = {
      ...session,
      user: {
        ...session.user,
        // Use Redux data if available (more up-to-date)
        ...(reduxUserInfo && {
          _id: reduxUserInfo._id,
          firstName: reduxUserInfo.firstName,
          lastName: reduxUserInfo.lastName,
          email: reduxUserInfo.email,
          organization: reduxUserInfo.organization,
          profilePicture: reduxUserInfo.profilePicture,
        }),
        // Include active group from Redux
        ...(reduxActiveGroup && {
          activeGroup: reduxActiveGroup,
        }),
      },
    };

    return {
      data: combinedSession,
      status: 'authenticated',
      isLoading: false,
      isAuthenticated: true,
    };
  }, [session, status, reduxUserInfo, reduxActiveGroup]);

  return optimizedSession;
};

/**
 * Lightweight hook that only checks if user is authenticated
 * Avoids full session data retrieval when only auth status is needed
 */
export const useIsAuthenticated = () => {
  const { status } = useSession();
  const reduxSuccess = useSelector((state) => state.login?.success);

  return useMemo(() => {
    // If Redux shows success, user is authenticated
    if (reduxSuccess) return true;

    // Fall back to NextAuth status
    return status === 'authenticated';
  }, [status, reduxSuccess]);
};

/**
 * Hook to get user info with fallback to Redux
 * Reduces the need for multiple useSession calls
 */
export const useUserInfo = () => {
  const { data: session } = useSession();
  const reduxUserInfo = useSelector((state) => state.login?.userInfo);

  return useMemo(() => {
    // Prefer Redux data as it's more up-to-date
    if (reduxUserInfo) {
      return reduxUserInfo;
    }

    // Fall back to session data
    return session?.user || null;
  }, [session?.user, reduxUserInfo]);
};

/**
 * Hook to get active group with fallback to Redux
 */
export const useActiveGroup = () => {
  const { data: session } = useSession();
  const reduxActiveGroup = useSelector((state) => state.login?.activeGroup);

  return useMemo(() => {
    // Prefer Redux data
    if (reduxActiveGroup) {
      return reduxActiveGroup;
    }

    // Fall back to session data
    return session?.user?.activeGroup || null;
  }, [session?.user?.activeGroup, reduxActiveGroup]);
};

export default useOptimizedSession;
