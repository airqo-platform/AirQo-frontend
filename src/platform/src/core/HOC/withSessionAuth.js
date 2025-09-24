'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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

    useEffect(() => {
      if (status === 'loading') return; // Wait for session to load

      // Handle different protection levels
      if (protectionLevel === PROTECTION_LEVELS.PUBLIC) {
        // Public routes - no authentication required
        return;
      }

      if (protectionLevel === PROTECTION_LEVELS.AUTH_ONLY) {
        // Auth-only routes (like login/register) - redirect if already authenticated
        if (status === 'authenticated') {
          router.replace('/user/Home');
          return;
        }
      }

      if (protectionLevel === PROTECTION_LEVELS.PROTECTED) {
        // Protected routes - require authentication
        if (status === 'unauthenticated') {
          router.replace('/user/login');
          return;
        }
      }
    }, [status, router]);

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
