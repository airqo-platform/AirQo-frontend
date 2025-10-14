'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
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

const NoGroupsError = ({ onRefresh }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Account Configuration Error</h2>
      <p className="text-gray-700 mb-6">
        We couldn&apos;t find any groups for your account. Please try refreshing. If the issue
        persists, try logging out and back in. If you still see this message, please contact
        support.
      </p>
      <div className="flex flex-col space-y-2">
        <button
          onClick={onRefresh}
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Refresh
        </button>
        <button
          onClick={() => signOut({ callbackUrl: '/user/login' })}
          className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
        >
          Logout
        </button>
      </div>
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
    const userGroupsLength = unified?.userGroupsLength ?? -1;
    const refreshGroups = unified?.refreshGroups;

    
    useEffect(() => {
      if (status === 'loading') return;

      if (protectionLevel === PROTECTION_LEVELS.PUBLIC) return;

      
      if (protectionLevel === PROTECTION_LEVELS.AUTH_ONLY) {
        if (status === 'authenticated' && sessionReady) router.replace('/user/Home');
      }

      if (protectionLevel === PROTECTION_LEVELS.PROTECTED) {
        if (status === 'unauthenticated') {
          const currentPath = window.location.pathname;
          router.replace(`/user/login?callbackUrl=${encodeURIComponent(currentPath)}`);
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
        return <AuthLoader message="Redirecting..." />;
      }
      return <WrappedComponent {...props} session={session} />;
    }

    if (protectionLevel === PROTECTION_LEVELS.PROTECTED) {
      if (status === 'unauthenticated' || !sessionInitialized || !initialGroupSet) {
        return <AuthLoader message="Setting up your workspace..." />;
      }

      // After groups are initialized, check if the user has any.
      if (initialGroupSet && userGroupsLength === 0) {
        return <NoGroupsError onRefresh={() => refreshGroups && refreshGroups(true)} />;
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
