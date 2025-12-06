'use client';

import type React from 'react';
import dynamic from 'next/dynamic';

const Toaster = dynamic(
  () => import('@/components/shared/toast/ReusableToast').then(mod => mod.Toaster),
  { ssr: false }
);
import Providers from "./providers"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <body
      className="min-h-screen bg-background antialiased"
    >
      <Providers>{children}</Providers>
      <Toaster />
    </body>
  )
}
