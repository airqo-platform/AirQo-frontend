"use client";

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/core/redux/hooks';
import { useAuth } from '@/core/hooks/users';
import { setInitialized, logout } from '@/core/redux/slices/userSlice';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { isInitialized } = useAppSelector((state) => state.user);
  const { initializeUserSession } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === 'authenticated' && !isInitialized && session?.user?.id) {
      initializeUserSession(session.user.id);
    } 
  
    else if (status === 'unauthenticated' && isInitialized) {
      dispatch(logout());
    }
    
    else if (status === 'unauthenticated' && !isInitialized) {
        dispatch(setInitialized());
    }
  }, [status, isInitialized, session, initializeUserSession, dispatch]);

  return <>{children}</>;
}

interface AuthProviderProps {
  children: React.ReactNode;
  session?: any;
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
