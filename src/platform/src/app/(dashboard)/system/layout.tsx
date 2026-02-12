import { MainLayout } from '@/shared/layouts/MainLayout';

export default function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout showSidebar={true} showBottomNav={false}>
      {children}
    </MainLayout>
  );
}
