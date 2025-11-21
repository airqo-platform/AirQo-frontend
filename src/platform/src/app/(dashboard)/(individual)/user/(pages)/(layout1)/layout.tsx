'use client';

import { MainLayout } from '@/shared/layouts/MainLayout';

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
