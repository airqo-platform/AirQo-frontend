'use client';

import { withSessionAuth, PROTECTION_LEVELS } from '@/core/HOC';
import AuthLayout from '@/common/layouts/auth/AuthLayout';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Loading from '@/app/loading';

function AuthRouteGroupLayout({ children }) {
  const { status, data: session } = useSession();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (status === 'loading') {
      // Still loading session, don't show content
      setShowContent(false);
    } else if (status === 'unauthenticated') {
      // Not authenticated, show auth content
      setShowContent(true);
    } else if (status === 'authenticated' && session?.user) {
      // Authenticated, let HOC handle the redirect without showing content flash
      setShowContent(false);
    }
  }, [status, session]);

  // Show loading spinner instead of flashing between auth pages
  if (!showContent) {
    return <Loading />;
  }

  // Only render auth pages for unauthenticated users
  // The HOC handles redirecting authenticated users to appropriate dashboard
  return <AuthLayout>{children}</AuthLayout>;
}

export default withSessionAuth(PROTECTION_LEVELS.AUTH_ONLY)(
  AuthRouteGroupLayout,
);
