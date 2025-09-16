"use client";

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/core/redux/hooks';
import { useAuth } from '@/core/hooks/users';
import { setInitialized, logout } from '@/core/redux/slices/userSlice';
import { ExtendedSession } from '../utils/secureApiProxyClient';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { isInitialized, user } = useAppSelector((state) => state.user);
  const { initializeUserSession } = useAuth();
  const dispatch = useAppDispatch();
  const isInitializing = useRef(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id && (!isInitialized || user?.id !== session.user.id)) {
      if (!isInitializing.current) {
        isInitializing.current = true;
        initializeUserSession(session.user.id);
      }
    }
    else if (status === 'unauthenticated') {
      isInitializing.current = false;
      if (isInitialized) {
        dispatch(logout());
      } else {
        dispatch(setInitialized());
      }
    }
  }, [status, isInitialized, session, user, initializeUserSession, dispatch]);

  return <>{children}</>;
}

interface AuthProviderProps {
  children: React.ReactNode;
  session?: ExtendedSession;
}

export function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider session={session}>
      <AuthInitializer>
        {children}
      </AuthInitializer>
    </SessionProvider>
  );
}
