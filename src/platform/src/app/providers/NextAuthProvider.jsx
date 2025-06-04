'use client';

import { SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NextAuthProvider({ children, session }) {
  const pathname = usePathname();
  const [basePath, setBasePath] = useState('/api/auth'); // Default fallback

  useEffect(() => {
    // Determine the appropriate basePath based on the current route
    let newBasePath = '/api/auth'; // Default fallback

    // Check for individual user routes (including route groups)
    if (pathname.includes('/user/') || pathname.includes('(individual)')) {
      newBasePath = '/api/auth/user';
    }
    // Check for organization routes
    else if (
      pathname.includes('/org/') ||
      pathname.includes('(organization)')
    ) {
      newBasePath = '/api/auth/organization';
    }

    setBasePath(newBasePath);
  }, [pathname]);

  return (
    <SessionProvider session={session} basePath={basePath}>
      {children}
    </SessionProvider>
  );
}
