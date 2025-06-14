'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const handleRootRedirect = async () => {
      if (status === 'loading' || isRedirecting) {
        return;
      }

      try {
        setIsRedirecting(true);

        if (status === 'authenticated' && session?.user) {
          // Check if this was an organization login
          const isOrgLogin = session.isOrgLogin || session.user.isOrgLogin;
          const sessionOrgSlug =
            session.orgSlug || session.user.requestedOrgSlug;

          if (isOrgLogin && sessionOrgSlug) {
            // Organization login - redirect to org dashboard
            router.replace(`/org/${sessionOrgSlug}/dashboard`);
          } else if (session.user.organization) {
            // Check if user is organization user (legacy check)
            const orgSlug = session.user.organization_slug || 'airqo';
            router.replace(`/org/${orgSlug}/dashboard`);
          } else {
            // Individual user
            router.replace('/user/Home');
          }
        } else {
          // Not authenticated - redirect to user login
          router.replace('/user/login');
        }
      } catch {
        router.replace('/user/login');
      }
    };

    // Add a small delay to avoid immediate redirect conflicts
    const timeoutId = setTimeout(handleRootRedirect, 100);
    return () => clearTimeout(timeoutId);
  }, [session, status, router, isRedirecting]);

  return (
    <div className="w-full h-screen flex flex-grow justify-center items-center bg-white">
      <div className="flex flex-col items-center space-y-4">
        <div className="SecondaryMainloader" aria-label="Loading"></div>
        <p className="text-sm text-gray-600 animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

export default HomePage;
