'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/common/components/LoadingSpinner';

const HomePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Redirect immediately when authenticated. The login pages are now
  // responsible for running client-side setup so the app doesn't need to
  // wait for provider-level initialization here.
  useEffect(() => {
    if (status === 'loading' || hasRedirected) return;

    if (status === 'unauthenticated') {
      setHasRedirected(true);
      router.replace('/user/login');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      setHasRedirected(true);
      const target = session.requestedOrgSlug || session.orgSlug
        ? `/org/${(session.requestedOrgSlug || session.orgSlug)}/dashboard`
        : '/user/Home';
      router.replace(target);
    }
  }, [status, session, router, hasRedirected]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner size="lg" text={status === 'loading' ? 'Authenticating...' : 'Redirecting...'} />
    </div>
  );
};

export default HomePage;
