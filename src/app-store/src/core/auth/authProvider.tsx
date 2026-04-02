'use client';

import { useSession, SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const authRoutes = ['/login', '/forgot-password'];
const publicRoutes = ['/', '/docs', '/docs/'];

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status, data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute =
    publicRoutes.some(route => pathname === route || pathname.startsWith(route));

  useEffect(() => {
    if (status === 'authenticated' && isAuthRoute) {
      router.replace('/');
    }
    if (status === 'unauthenticated' && !isAuthRoute && !isPublicRoute) {
      router.replace('/login');
    }
  }, [status, isAuthRoute, isPublicRoute, router]);

  if (status === 'loading' && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading session...
      </div>
    );
  }

  if (!session && !isAuthRoute && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Redirecting to login...
      </div>
    );
  }

  return <>{children}</>;
}

export function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false} refetchInterval={0}>
      <AuthGuard>{children}</AuthGuard>
    </SessionProvider>
  );
}
