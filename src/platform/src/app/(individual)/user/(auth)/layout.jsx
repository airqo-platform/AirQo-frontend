'use client';

import { withSessionAuth, PROTECTION_LEVELS } from '@/core/HOC';
import AuthLayout from '@/common/layouts/auth/AuthLayout';

function AuthRouteGroupLayout({ children }) {
  // Only render auth pages for unauthenticated users
  // The HOC handles redirecting authenticated users to appropriate dashboard
  return <AuthLayout>{children}</AuthLayout>;
}

export default withSessionAuth(PROTECTION_LEVELS.AUTH_ONLY)(
  AuthRouteGroupLayout,
);
