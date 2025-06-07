'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import logger from '@/lib/logger';

/**
 * Loading component for auth checks
 */
const AuthLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="SecondaryMainloader" aria-label="Loading"></div>
  </div>
);

/**
 * Higher-order component for user auth routes (login, register, etc.)
 * Redirects to user dashboard if user is already authenticated with user session
 */
const withUserAuthRoute = (Component) => {
  const WithUserAuthRouteComponent = (props) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'loading') return;

      if (status === 'authenticated' && session?.user?.sessionType === 'user') {
        logger.info(
          'User already authenticated, redirecting to user dashboard',
        );
        router.replace('/user/Home');
        return;
      }
    }, [session, status, router]);

    if (status === 'loading') {
      return <AuthLoadingSpinner />;
    }

    if (status === 'authenticated' && session?.user?.sessionType === 'user') {
      return <AuthLoadingSpinner />;
    }

    return <Component {...props} />;
  };

  WithUserAuthRouteComponent.displayName = `withUserAuthRoute(${Component.displayName || Component.name || 'Component'})`;
  
  return WithUserAuthRouteComponent;
};

/**
 * HOC for organization auth routes (login, register, etc.)
 * Redirects to organization dashboard if user is already authenticated with org session for that org
 */
const withOrgAuthRoute = (Component) => {
  const WithOrgAuthRouteComponent = (props) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'loading') return;

      if (
        status === 'authenticated' &&
        session?.user?.sessionType === 'organization'
      ) {
        const currentPath =
          typeof window !== 'undefined' ? window.location.pathname : '';
        const orgSlugMatch = currentPath.match(/^\/org\/([^/]+)/);
        const currentOrgSlug = orgSlugMatch ? orgSlugMatch[1] : null;

        if (currentOrgSlug && session.user.orgSlug === currentOrgSlug) {
          logger.info(
            'User already authenticated for organization, redirecting to dashboard',
          );
          router.replace(`/org/${currentOrgSlug}/dashboard`);
          return;
        }
      }
    }, [session, status, router]);

    if (status === 'loading') {
      return <AuthLoadingSpinner />;
    }

    const currentPath =
      typeof window !== 'undefined' ? window.location.pathname : '';
    const orgSlugMatch = currentPath.match(/^\/org\/([^/]+)/);
    const currentOrgSlug = orgSlugMatch ? orgSlugMatch[1] : null;

    if (
      status === 'authenticated' &&
      session?.user?.sessionType === 'organization' &&
      session?.user?.orgSlug === currentOrgSlug
    ) {
      return <AuthLoadingSpinner />;
    }

    return <Component {...props} />;
  };

  WithOrgAuthRouteComponent.displayName = `withOrgAuthRoute(${Component.displayName || Component.name || 'Component'})`;
  
  return WithOrgAuthRouteComponent;
};

// Export as default and named exports
export default withUserAuthRoute;
export { withUserAuthRoute, withOrgAuthRoute };