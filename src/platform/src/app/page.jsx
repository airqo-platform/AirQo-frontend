'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/common/components/LoadingSpinner';
import { useUnifiedGroup } from '@/app/providers/UnifiedGroupProvider';

const HomePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { activeGroup, sessionInitialized } = useUnifiedGroup();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Faster redirect logic - don't wait for all flags to be true
  // Just check if we have the essential data needed for redirect
  const canRedirect = sessionInitialized && activeGroup?._id;

  useEffect(() => {
    if (status === 'loading' || hasRedirected) return;

    if (status === 'unauthenticated') {
      setHasRedirected(true);
      router.replace('/user/login');
      return;
    }

    if (status === 'authenticated' && session?.user && canRedirect) {
      setHasRedirected(true);

      // Redirect based on the active group context or session data
      if (session.requestedOrgSlug || session.orgSlug) {
        // User came from organization login - redirect to org dashboard
        const orgSlug = session.requestedOrgSlug || session.orgSlug;
        router.replace(`/org/${orgSlug}/dashboard`);
      } else {
        // Default redirect to user home
        router.replace('/user/Home');
      }
    }
  }, [status, session, canRedirect, router, hasRedirected]);

  // Show loading state while waiting for session and active group setup
  const getLoadingText = () => {
    if (status === 'loading') {
      return 'Authenticating...';
    }
    // Show faster, more specific loading messages
    if (status === 'authenticated' && !canRedirect) {
      return 'Loading your dashboard...';
    }
    return 'Redirecting...';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner size="lg" text={getLoadingText()} />
    </div>
  );
};

export default HomePage;
