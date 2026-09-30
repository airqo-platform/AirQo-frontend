'use client';

import { MainLayout } from '@/shared/layouts/MainLayout';
import { HomeShortcutGuide } from '@/modules/home/HomeShortcutGuide';

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <HomeShortcutGuide />
      {children}
    </MainLayout>
  );
}
