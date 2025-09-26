'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUnifiedGroupSafe } from '@/app/providers/UnifiedGroupProvider';

// Protection levels
export const PROTECTION_LEVELS = {
  PUBLIC: 'public', // No authentication required
  PROTECTED: 'protected', // Authentication required
  AUTH_ONLY: 'auth_only', // Auth pages only (redirect if already authenticated)
};

// Simple loading component
const AuthLoader = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// Higher-order component for session authentication
const withSessionAuth = (
  WrappedComponent,
  protectionLevel = PROTECTION_LEVELS.PROTECTED,
) => {
  const AuthComponent = (props) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const unified = useUnifiedGroupSafe();
    const sessionInitialized = unified?.sessionInitialized ?? true;
    const initialGroupSet = unified?.initialGroupSet ?? true;

    useEffect(() => {
      if (status === 'loading') return; // Wait for session to load

      // Handle public routes
      if (protectionLevel === PROTECTION_LEVELS.PUBLIC) return;

      // For auth-only pages (like login/register): only redirect when the
      // entire unified session (including active group) is initialized. This
      // prevents NextAuth from causing an early redirect to /user/Home which
      // leads to UI flicker while the rest of the app is still setting up.
      if (protectionLevel === PROTECTION_LEVELS.AUTH_ONLY) {
        if (status === 'authenticated') {
          if (!sessionInitialized || !initialGroupSet) {
            // Still setting up session - do not redirect yet
            return;
          }
          router.replace('/user/Home');
          return;
        }
      }

      if (protectionLevel === PROTECTION_LEVELS.PROTECTED) {
        if (status === 'unauthenticated') {
          router.replace('/user/login');
          return;
        }

        // If authenticated but unified session hasn't fully initialized,
        // keep showing loader until ready to avoid rendering protected UI
        if (
          status === 'authenticated' &&
          (!sessionInitialized || !initialGroupSet)
        ) {
          return;
        }
      }
    }, [status, router, sessionInitialized, initialGroupSet]);

    // Show loading state while session is loading
    if (status === 'loading') {
      return <AuthLoader message="Authenticating..." />;
    }

    // Auth-only routes: show component only if unauthenticated
    if (protectionLevel === PROTECTION_LEVELS.AUTH_ONLY) {
      if (status === 'authenticated') {
        return <AuthLoader message="Redirecting..." />;
      }
      return <WrappedComponent {...props} session={session} />;
    }

    // Protected routes: show component only if authenticated
    if (protectionLevel === PROTECTION_LEVELS.PROTECTED) {
      if (status === 'unauthenticated') {
        return <AuthLoader message="Redirecting to login..." />;
      }
      // If authenticated but unified session hasn't fully initialized,
      // keep showing loader until ready to avoid rendering protected UI
      if (!sessionInitialized || !initialGroupSet) {
        return <AuthLoader message="Setting up your workspace..." />;
      }
      return <WrappedComponent {...props} session={session} />;
    }

    // Public routes: always show component
    return <WrappedComponent {...props} session={session} />;
  };

  AuthComponent.displayName = `withSessionAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthComponent;
};

export default withSessionAuth;
export { withSessionAuth };
