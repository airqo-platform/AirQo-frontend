'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUnifiedGroupSafe } from '@/app/providers/UnifiedGroupProvider';

export const PROTECTION_LEVELS = {
  PUBLIC: 'public',
  PROTECTED: 'protected',
  AUTH_ONLY: 'auth_only',
};

const AuthLoader = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

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
    const sessionReady = unified?.sessionReady ?? true;

    
    useEffect(() => {
      if (status === 'loading') return;

      if (protectionLevel === PROTECTION_LEVELS.PUBLIC) return;

      
      if (protectionLevel === PROTECTION_LEVELS.AUTH_ONLY) {
        if (status === 'authenticated') {
          if (!sessionReady) {
            return;
          }
          router.replace('/user/Home');
          return;
        }
      }

      if (protectionLevel === PROTECTION_LEVELS.PROTECTED) {
        if (status === 'unauthenticated') {
          const currentPath = window.location.pathname;
          const orgSlugMatch = currentPath.match(/^\/org\/([^/]+)/);
          const loginPath = orgSlugMatch ? `/org/${orgSlugMatch[1]}/login` : '/user/login';
          router.replace(`${loginPath}?callbackUrl=${encodeURIComponent(currentPath)}`);
        }

        if (
          status === 'authenticated' &&
          (!sessionInitialized || !initialGroupSet)
        ) {
          return;
        }
      }
    }, [status, router, sessionInitialized, initialGroupSet, sessionReady]);

    if (status === 'loading') {
      return <AuthLoader message="Loading session..." />;
    }

    if (protectionLevel === PROTECTION_LEVELS.AUTH_ONLY) {
      if (status === 'authenticated') {
        if (sessionReady) {
          return <AuthLoader message="Redirecting..." />;
        }
        return <AuthLoader message="Loading..." />;
      }
      return <WrappedComponent {...props} session={session} />;
    }

    if (protectionLevel === PROTECTION_LEVELS.PROTECTED) {
      if (status === 'unauthenticated') {
        return <AuthLoader message="Redirecting to login..." />;
      }
      if (!sessionInitialized || !initialGroupSet) {
        return <AuthLoader message="Setting up your workspace..." />;
      }
      return <WrappedComponent {...props} session={session} />;
    }

    return <WrappedComponent {...props} session={session} />;
  };

  AuthComponent.displayName = `withSessionAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthComponent;
};

export default withSessionAuth;
export { withSessionAuth };
