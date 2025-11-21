'use client';

import type React from 'react';

import { Toaster } from '@/components/ui/sonner';
import Providers from './providers';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <body className="min-h-screen bg-background antialiased">
      <Providers>{children}</Providers>
      <Toaster />
    </body>
  );
}
