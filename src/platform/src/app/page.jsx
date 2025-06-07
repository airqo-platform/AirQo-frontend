'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'authenticated' && session) {
      // Strict session type checking - organization sessions cannot access user routes
      if (session.sessionType === 'organization' && session.orgSlug) {
        router.replace(`/org/${session.orgSlug}/dashboard`);
      } else if (session.sessionType === 'user') {
        router.replace('/user/Home');
      } else {
        // Invalid or unknown session type - redirect to user login as fallback
        router.replace('/user/login');
      }
    } else {
      // Not authenticated - redirect to user login
      router.replace('/user/login');
    }
  }, [session, status, router]);

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
