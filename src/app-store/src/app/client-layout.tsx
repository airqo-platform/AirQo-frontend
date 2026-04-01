'use client';

import type React from 'react';
import dynamic from 'next/dynamic';
import { Session } from 'next-auth';
import { AuthProvider } from '@/core/auth/authProvider';

const Toaster = dynamic(
  () => import('@/components/shared/toast/ReusableToast').then(mod => mod.Toaster),
  { ssr: false }
);

export default function ClientLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <body className="min-h-screen bg-background antialiased">
      <AuthProvider session={session}>{children}</AuthProvider>
      <Toaster />
    </body>
  );
}