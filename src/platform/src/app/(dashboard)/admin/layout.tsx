import { MainLayout } from '@/shared/layouts/MainLayout';

export default function AdminLayout({
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
