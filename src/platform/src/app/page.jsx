'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectActiveGroup } from '@/lib/store/services/groups';
import LoadingSpinner from '@/common/components/LoadingSpinner';

const HomePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const activeGroup = useSelector(selectActiveGroup);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (status === 'loading' || hasRedirected) return; // Wait for session to load

    if (status === 'unauthenticated') {
      setHasRedirected(true);
      router.replace('/user/login');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      // Wait for active group to be set before redirecting
      // This ensures the user session is fully initialized
      if (activeGroup && activeGroup._id) {
        setHasRedirected(true);

        // Redirect based on the active group context
        if (session.requestedOrgSlug || session.orgSlug) {
          // User came from organization login - redirect to org dashboard
          const orgSlug = session.requestedOrgSlug || session.orgSlug;
          router.replace(`/org/${orgSlug}/dashboard`);
        } else {
          // Default redirect to user home
          router.replace('/user/Home');
        }
      }
      // If no active group yet, keep showing loading until UnifiedGroupProvider sets it
    }
  }, [status, session, activeGroup, router, hasRedirected]);

  // Show loading state while waiting for session and active group setup
  const getLoadingText = () => {
    if (status === 'loading') {
      return 'Loading...';
    }
    if (status === 'authenticated' && !activeGroup) {
      return 'Setting up your workspace...';
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
