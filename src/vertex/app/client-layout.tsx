'use client';

import type React from 'react';
import dynamic from 'next/dynamic';

const Toaster = dynamic(
  () => import('@/components/shared/toast/ReusableToast').then(mod => mod.Toaster),
  { ssr: false }
);
import Providers from "./providers"

import { Session } from "next-auth";

export default function ClientLayout({
  children,
  session
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <body
      className="min-h-screen bg-background antialiased"
    >
      <Providers session={session}>{children}</Providers>
      <Toaster />
    </body>
  )
}
